import {
    Request,
    Response
} from "express";
import {
    IDbConfig
} from '../config/IDatabaseConfig';
import {
    IPlayerConfig
} from '../config/IPlayerConfig';
import {
    IScenario,
    ITrack
} from '../models/scenario';
import {
    IEntityType
} from '../models/entity';
import {
    IProperty
} from '../models/property';
import * as Utils from '../utils/utils';
import {
    IScenarioState,
    PlayState,
    SerializeScenarioState
} from '../models/playstate';
import {
    InterpolationController
} from './InterpolationController';
import * as request from 'request';
import * as _ from 'underscore';
import * as httpcodes from 'http-status-codes';
const testJson = require('./TestJson.json');

const requestOpts: request.CoreOptions = {
    timeout: 5000
};

export class ScenarioController {

    private TIMESTEP: number = 1000;

    private interpolationCtrl: InterpolationController;
    private scenarioStates: {
        [id: string]: IScenarioState
    } = {};
    private entityTypes: {
        [id: string]: IEntityType
    } = {};
    private propertyTypes: {
        [id: string]: IProperty;
    } = {};
    private nvgToScenarioIdDict: {
        [nvgId: string]: string;
    } = {};

    constructor(public dbOptions: IDbConfig, public playerOptions: IPlayerConfig) {
        this.TIMESTEP = playerOptions.millisPerTimeStep;
        this.interpolationCtrl = new InterpolationController(dbOptions, playerOptions);
        this.initScenarios();
    }

    private initScenarios() {
        let url = this.getUrl(this.dbOptions.scenarioRoute);
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK) {
                return;
            }
            let parsedScenarios = this.parseScenarios(body);
            this.scenarioStates = this.getScenarioStates(parsedScenarios);
            _.each(this.scenarioStates, (s) => {
                if (!this.nvgToScenarioIdDict.hasOwnProperty(s.simTitle)) {
                    this.nvgToScenarioIdDict[s.simTitle] = s.id.toString();
                }
            });
        });
    }

    private parseScenarios(scenString: string) {
        let scenarioArr: IScenario[];
        if (scenString) {
            try {
                scenarioArr = JSON.parse(scenString);
            } catch (error) {
                console.warn('Error parsing JSON');
            }
            return scenarioArr;
        }
    }

    private getScenarioStates(scenarioArr: IScenario[]) {
        if (!scenarioArr || !Array.isArray(scenarioArr)) return;
        var result = {};
        scenarioArr.forEach((s) => {
            if (!s.start || !s.start.date || !s.start.time || !s.end || !s.end.date || !s.end.time) return;
            result[s.id.toString()] = {
                id: s.id.toString(),
                title: s.title,
                simTitle: s.simTitle || s.title,
                currentTime: Utils.dateTimeToMillis(s.start.date.toString(), s.start.time.toString()),
                startTime: Utils.dateTimeToMillis(s.start.date.toString(), s.start.time.toString()),
                endTime: Utils.dateTimeToMillis(s.end.date.toString(), s.end.time.toString()),
                speed: 1,
                playState: PlayState.stopped
            }
        });
        console.log(`Updated ${scenarioArr.length} scenarios`);
        return result;
    }

    public index(req: Request, res: Response) {
        res.send('Go to /scenarios to get a list of scenarios');
    };

    public play(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let time = (req.query && req.query.hasOwnProperty('time')) ? req.query.time : null;
        let scenarioId = req.params['scenarioId'];
        let state = this.scenarioStates[scenarioId];
        if (this.nvgToScenarioIdDict.hasOwnProperty(state.simTitle)) {
            //Stop previous
            let prevStateId = this.nvgToScenarioIdDict[state.simTitle];
            if (prevStateId !== state.id) {
                this.scenarioStates[prevStateId].playState = PlayState.stopped;
                this.clearScheduledStep(this.scenarioStates[prevStateId]);
                this.printStatus(this.scenarioStates[prevStateId]);
            }
            //Play current
            this.nvgToScenarioIdDict[state.simTitle] = state.id;
        }
        if (time !== null) {
            state.currentTime = +time;
        }
        state.playState = PlayState.playing;
        this.step(scenarioId, true);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
        this.printStatus(this.scenarioStates[scenarioId]);
    };

    private step(scenarioId: string, firstCall: boolean = false) {
        let state = this.scenarioStates[scenarioId];
        if (!firstCall) {
            state.currentTime += state.speed * this.TIMESTEP;
            if (state.currentTime > state.endTime) {
                state.playState = PlayState.stopped;
            }
            // console.log(`Scenario ${scenarioId} ${PlayState[state.playState]} at ${new Date(state.currentTime).toString()}`)
        }
        this.clearScheduledStep(state);
        state.stepHandle = setTimeout(() => {
            this.step(scenarioId);
        }, this.TIMESTEP);
    }

    public pause(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let time = (req.query && req.query.hasOwnProperty('time')) ? req.query.time : null;
        let scenarioId = req.params['scenarioId'];
        let state = this.scenarioStates[scenarioId];
        if (this.nvgToScenarioIdDict.hasOwnProperty(state.simTitle)) {
            //Stop previous
            let prevStateId = this.nvgToScenarioIdDict[state.simTitle];
            if (prevStateId !== state.id) {
                this.scenarioStates[scenarioId].playState = PlayState.stopped;
                this.clearScheduledStep(this.scenarioStates[scenarioId]);
                this.printStatus(this.scenarioStates[scenarioId]);
            }
            //Play current
            this.nvgToScenarioIdDict[state.simTitle] = state.id;
        }
        if (time !== null) {
            state.currentTime = +time;
        }
        state.playState = PlayState.paused;
        this.clearScheduledStep(this.scenarioStates[scenarioId]);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
        this.printStatus(this.scenarioStates[scenarioId]);
    };

    public stop(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let scenarioId = req.params['scenarioId'];
        this.scenarioStates[scenarioId].playState = PlayState.stopped;
        this.scenarioStates[scenarioId].currentTime = this.scenarioStates[scenarioId].startTime;
        this.clearScheduledStep(this.scenarioStates[scenarioId]);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
        this.printStatus(this.scenarioStates[scenarioId]);
    };

    public reload(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let scenarioId = req.params['scenarioId'];
        let url = `${this.getUrl(this.dbOptions.scenarioRoute)}/${scenarioId}`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK) {
                res.sendStatus(httpcodes.NOT_FOUND);
                return;
            }
            let parsedScenario = this.parseScenarios(body);
            let scenState = this.getScenarioStates(parsedScenario);
            if (this.scenarioStates.hasOwnProperty(scenarioId) && scenState.hasOwnProperty(scenarioId)) {
                this.scenarioStates[scenarioId] = scenState[scenarioId];
                res.send(this.scenarioStates[scenarioId]);
            } else {
                res.sendStatus(httpcodes.INTERNAL_SERVER_ERROR);
            }
        });
    };

    public speed(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId', 'speed']);
        if (!ok) return;

        let scenarioId = req.params['scenarioId'];
        let speed = +req.params['speed'];
        if (speed <= 0 || speed > 4096) {
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return;
        }
        this.scenarioStates[scenarioId].speed = speed;
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
        this.printStatus(this.scenarioStates[scenarioId]);
    };

    public state(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;

        let scenarioId = req.params['scenarioId'];
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
    };

    /**
     * Returns the current situation as a featurecollection for the provided scenarioId
     */
    public current(req: Request, res: Response) {
        if (!req.params || !req.params.hasOwnProperty('scenarioId')) {
            res.sendStatus(httpcodes.BAD_REQUEST);
            return;
        }
        let scenarioId = req.params['scenarioId'];
        let state = this.scenarioStates[scenarioId];
        let ftCollection = this.interpolationCtrl.getCurrentSituation(state, (result) => {
            if (!result) {
                res.sendStatus(httpcodes.INTERNAL_SERVER_ERROR);
                return;
            }
            res.send(result);
        });
    }
    /**
     * Returns the current situation as a featurecollection for the provided scenarioId
     */
    public currentPlaying(req: Request, res: Response) {
        if (!req.params || !req.params.hasOwnProperty('scenarioId')) {
            res.sendStatus(httpcodes.BAD_REQUEST);
            return;
        }
        let nvgId = req.params['scenarioId'];
        let scenarioId = this.nvgToScenarioIdDict[nvgId];
        if (!scenarioId || !this.scenarioStates[scenarioId]) {
            res.sendStatus(httpcodes.BAD_REQUEST);
            return;
        }
        let state = this.scenarioStates[scenarioId];
        let ftCollection = this.interpolationCtrl.getCurrentSituation(state, (result) => {
            if (!result) {
                res.sendStatus(httpcodes.INTERNAL_SERVER_ERROR);
                return;
            }
            res.send(result);
        });
    }

    /**
     * Requests a list of scenarios from a rest-source and returns it to the requestor
     */
    public scenarios(req: Request, res: Response) {
        let url = this.getUrl(this.dbOptions.scenarioRoute);
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK) {
                res.sendStatus(httpcodes.NOT_FOUND);
                return;
            }
            let parsedScenarios = this.parseScenarios(body);
            let scenarioStates = this.getScenarioStates(parsedScenarios);
            if (scenarioStates) {
                res.send(scenarioStates);
            } else {
                res.sendStatus(httpcodes.INTERNAL_SERVER_ERROR);
            }
        });
    };

    public playableScenarios(req: Request, res: Response) {
        if (this.nvgToScenarioIdDict) {
            res.send(this.nvgToScenarioIdDict);
        } else {
            res.sendStatus(httpcodes.NOT_FOUND);
        }
    };

    private checkRequest(req: Request, res: Response, required: string[]) {
        // Check if any parameters are present
        if (!req.params) {
            res.sendStatus(httpcodes.BAD_REQUEST);
            return false;
        }
        // Check if all required parameters are present
        let missingParameter = required.some((param) => {
            if (!req.params.hasOwnProperty(param)) {
                res.sendStatus(httpcodes.BAD_REQUEST);
                return true;
            }
        });
        if (missingParameter) return false;
        // Check if scenarioId exists
        let scenarioId = req.params['scenarioId'];
        if (!this.scenarioStates.hasOwnProperty(scenarioId)) {
            this.initScenarios(); //Check if the scenario was just added
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return false;
        }
        return true;
    }

    private clearScheduledStep(state: IScenarioState) {
        if (state && state.stepHandle) {
            clearTimeout(state.stepHandle);
        }
    }

    private printStatus(state: IScenarioState) {
        console.log(`Scenario ${state.id} ${PlayState[state.playState]} at layer ${state.simTitle} ${new Date(state.currentTime).toString()}(speed: ${state.speed}x)`);
    }

    private getUrl(route: string) {
        return `${this.dbOptions.host}${route}`;
    }
}