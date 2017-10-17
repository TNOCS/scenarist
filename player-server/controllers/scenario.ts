import {
    Request,
    Response
} from "express";
import {
    IDbConfig
} from '../config/IDatabaseConfig';
import * as request from 'request';
import * as httpcodes from 'http-status-codes';

const requestOpts: request.CoreOptions = {
    timeout: 5000
};
export class ScenarioController {

    constructor(public options: IDbConfig) {

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
        res.send('speed');
    };

    public scenarios(req: Request, res: Response) {
        let url = this.getUrl(this.options.scenarioRoute);
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || res.statusCode !== httpcodes.OK) {
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