import {
    Request,
    Response
} from "express";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
    res.send('ok');
};

export let play = (req: Request, res: Response) => {
    res.send('play');
};

export let pause = (req: Request, res: Response) => {
    res.send('pause');
};

export let stop = (req: Request, res: Response) => {
    res.send('stop');
};

export let reload = (req: Request, res: Response) => {
    res.send('reload');
};

export let speed = (req: Request, res: Response) => {
    res.send('speed');
};

export let scenarios = (req: Request, res: Response) => {
    res.send('scenarios');
};