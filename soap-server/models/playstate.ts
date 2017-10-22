export enum PlayState {
    'playing' = 0,
    'paused' = 1,
    'stopped' = 2
}

export interface IScenarioState {
    title: string;
    simTitle: string;
    startTime: number;
    endTime: number;
    currentTime: number;
    speed;
    playState: PlayState
}