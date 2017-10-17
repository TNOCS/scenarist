import {
    Request,
    Response
} from "express";
import {
    IDbConfig
} from '../config/IDatabaseConfig';
import {
    IScenario
} from '../models/scenario';
import * as request from 'request';
import * as httpcodes from 'http-status-codes';
const testJson = require('./TestJson.json');

const requestOpts: request.CoreOptions = {
    timeout: 5000
};

export enum IPlayState {
    'playing' = 0,
    'paused' = 1,
    'stopped' = 2
}

export interface IScenarioState {
    startTime: number;
    endTime: number;
    currentTime: number;
    speed;
    playState: IPlayState
}

export class ScenarioController {

    private scenarioStates: {
        [id: string]: IScenarioState
    } = {};

    constructor(public options: IDbConfig) {
        this.initScenarios();
    }

    private initScenarios() {
        let url = this.getUrl(this.options.scenarioRoute);
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK) {
                return;
            }
            this.parseScenarios(body);
        });
    }

    private parseScenarios(scenString: string){
        let scenarioArr: IScenario[];
        if (scenString) {
            try {
                scenarioArr = JSON.parse(scenString);
            } catch (error) {
                console.warn('Error parsing JSON');
            }
            if (scenarioArr) {
                scenarioArr.forEach((s) => {
                    this.scenarioStates[s.id] = {
                        currentTime: Date.parse((<any>s.start).date),
                        startTime: Date.parse((<any>s.start).date),
                        endTime: Date.parse((<any>s.end).date),
                        speed: 1,
                        playState: IPlayState.stopped
                    }
                });
                console.log(`Initilialized ${scenarioArr.length} scenarios`);
            }
        }
    }

    public index(req: Request, res: Response) {
        res.send('ok');
    };

    public play(req: Request, res: Response) {
        res.send('play');
    };

    public pause(req: Request, res: Response) {
        res.send('pause');
    };

    public stop(req: Request, res: Response) {
        res.send('stop');
    };

    public reload(req: Request, res: Response) {
        res.send('reload');
    };

    public speed(req: Request, res: Response) {
        if (!req.params || !req.params.hasOwnProperty('scenarioId') || !req.params.hasOwnProperty('speed')) {
            res.sendStatus(httpcodes.BAD_REQUEST);
            return;
        }

        let scenarioId = req.params['scenarioId'];
        if (!this.scenarioStates.hasOwnProperty(scenarioId)) {
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return;
        }

        let speed = +req.params['speed'];
        if (speed <= 0 || speed > 1000) {
            res.sendStatus(httpcodes.NOT_ACCEPTABLE);
            return;
        }

        this.scenarioStates[scenarioId].speed = speed;
        res.send('speed set');
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
        res.send(testJson);
    };

    /**
     * Requests a list of scenarios from a rest-source and returns it to the requestor
     */
    public scenarios(req: Request, res: Response) {
        let url = this.getUrl(this.options.scenarioRoute);
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK) {
                res.sendStatus(httpcodes.NOT_FOUND);
                return;
            }
            res.send(body);
        });
    };

    private getUrl(route: string) {
        return `${this.options.host}${route}`;
    }
}