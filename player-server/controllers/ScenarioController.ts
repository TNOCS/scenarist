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
import * as _ from 'underscore';
import * as async from 'async';
import * as request from 'request';
import * as httpcodes from 'http-status-codes';
const testJson = require('./TestJson.json');

const requestOpts: request.CoreOptions = {
    timeout: 5000
};

export class ScenarioController {

    private TIMESTEP: number = 1000;

    private scenarioStates: {
        [id: string]: IScenarioState
    } = {};
    private entityTypes: {
        [id: string]: IEntityType
    } = {};
    private propertyTypes: {
        [id: string]: IProperty;
    } = {};

    constructor(public dbOptions: IDbConfig, public playerOptions: IPlayerConfig) {
        this.TIMESTEP = playerOptions.millisPerTimeStep;
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
            result[s.id.toString()] = {
                id: s.id.toString(),
                title: s.title,
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
        let scenarioId = req.params['scenarioId'];
        this.scenarioStates[scenarioId].playState = PlayState.playing;
        this.step(scenarioId, true);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
    };

    private step(scenarioId: string, firstCall: boolean = false) {
        let state = this.scenarioStates[scenarioId];
        if (!firstCall) {
            state.currentTime += state.speed * this.TIMESTEP;
            if (state.currentTime > state.endTime) {
                state.playState = PlayState.stopped;
            }
            console.log(`Scenario ${scenarioId} ${PlayState[state.playState]} at ${new Date(state.currentTime).toString()}`)
        }
        this.clearScheduledStep(state);
        state.stepHandle = setTimeout(() => {
            this.step(scenarioId);
        }, this.TIMESTEP);
    }

    public pause(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let scenarioId = req.params['scenarioId'];
        this.scenarioStates[scenarioId].playState = PlayState.paused;
        this.clearScheduledStep(this.scenarioStates[scenarioId]);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
    };

    public stop(req: Request, res: Response) {
        let ok = this.checkRequest(req, res, ['scenarioId']);
        if (!ok) return;
        let scenarioId = req.params['scenarioId'];
        this.scenarioStates[scenarioId].playState = PlayState.stopped;
        this.scenarioStates[scenarioId].currentTime = this.scenarioStates[scenarioId].startTime;
        this.clearScheduledStep(this.scenarioStates[scenarioId]);
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
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
        if (speed <= 0 || speed > 1000) {
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return;
        }
        this.scenarioStates[scenarioId].speed = speed;
        res.send(SerializeScenarioState(this.scenarioStates[scenarioId]));
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
        let ftCollection = this.getCurrentSituation(scenarioId, (result) => {
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
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return false;
        }
        return true;
    }

    private getCurrentSituation(scenarioId: string, cb: Function) {
        let state: IScenarioState = this.scenarioStates[scenarioId];
        let url = `${this.getUrl(this.dbOptions.scenarioRoute)}/${scenarioId}?_embed=tracks`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return cb();
            }
            let scenario;
            if (typeof body == 'string') {
                try {
                    scenario = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing scenario');
                }
                if (!scenario) {
                    return cb();
                }
                this.calculateCurrentSituation(scenario, cb);
            }
        });
    }

    private calculateCurrentSituation(scenario: IScenario, cb: Function) {
        if (!scenario.tracks || !Array.isArray(scenario.tracks)) {
            console.warn('No tracks found in scenario');
            return cb();
        }
        let fc = Utils.createFeatureCollection();
        this.getEntityTypes(scenario, (err) => {
            if (err) {
                console.warn(`Error getting entityTypes: ${err}`);
                return cb();
            }
            scenario.tracks.forEach((tr) => {
                let ft = this.convertTrackToFeature(tr);
                if (ft) fc.features = fc.features.concat(ft);
            })
            cb(fc);
        });
    }

    private getEntityTypes(scenario: IScenario, cb: Function) {
        // Extract all unique entityTypes
        let entityIds = _.chain(scenario.tracks)
            .pluck('entityTypeId')
            .uniq()
            .value();
        // Request entityTypes from db
        async.each(entityIds, (id: string, callback: Function) => {
            return this.getEntityType(id, callback);
        }, (err) => {
            if (err) {
                return cb(err);
            }
            console.log(`Got ${entityIds.length} entityTypes`);
            cb();
        });
    }

    private getEntityType(id: string, callback: Function) {
        let url = `${this.getUrl(this.dbOptions.entityRoute)}/${id}`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return callback(err);
            }
            let entity;
            if (typeof body == 'string') {
                try {
                    entity = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing entity');
                }
                if (!entity) {
                    return callback('Error parsing entity');
                }
                this.entityTypes[id] = entity;
                if (entity.hasOwnProperty('propertyIds')) {
                    this.getPropertyTypes(entity.propertyIds, (err) => {
                        callback(err);
                    });
                } else {
                    callback(); //success
                }
            }
        });
    }

    private getPropertyTypes(propertyIds: string[], cb: Function) {
        if (!propertyIds || !Array.isArray(propertyIds)) return cb();
        // Request propertyTypes from db
        async.each(propertyIds, (id: string, callback: Function) => {
            return this.getPropertyType(id, callback);
        }, (err) => {
            if (err) {
                return cb(err);
            }
            console.log(`Got ${propertyIds.length} propertyTypes`);
            cb();
        });
    }

    private getPropertyType(id: string, callback: Function) {
        let url = `${this.getUrl(this.dbOptions.propertyRoute)}/${id}`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return callback(err);
            }
            let property;
            if (typeof body == 'string') {
                try {
                    property = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing property');
                }
                if (!property) {
                    return callback('Error parsing property');
                }
                this.propertyTypes[id] = property;
                callback(); //success
            }
        });
    }

    private convertTrackToFeature(track: ITrack) {
        if (!track.features || !Array.isArray(track.features)) {
            console.warn('No features found in track');
            return;
        }
        track.features.forEach((f) => {
            if (!f.properties) f.properties = {};
            Object.keys(f.properties).forEach((key) => {
                if (this.propertyTypes.hasOwnProperty(key)) {
                    f.properties[this.propertyTypes[key].title] = f.properties[key];
                    delete f.properties[key];
                }
            });
            f.properties['sidc'] = `app6a:${this.entityTypes[track.entityTypeId].sidc}`;
            f.properties['title'] = track.title;
            f.properties['description'] = track.description;
            f.id = `t${track.id}e${track.entityTypeId}`;
        });
        return track.features;
    }

    private clearScheduledStep(state: IScenarioState) {
        if (state && state.stepHandle) {
            clearTimeout(state.stepHandle);
        }
    }

    private getUrl(route: string) {
        return `${this.dbOptions.host}${route}`;
    }
}