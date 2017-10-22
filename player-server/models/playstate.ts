export enum PlayState {
    'playing' = 0,
    'paused' = 1,
    'stopped' = 2
}

export interface IScenarioState {
    id: string;
    title: string;
    simTitle: string;
    startTime: number;
    endTime: number;
    currentTime: number;
    speed: number;
    playState: PlayState;
    stepHandle ? : NodeJS.Timer;
}

export function SerializeScenarioState(s: IScenarioState) {
    return {
        id: s.id.toString(),
        title: s.title,
        simTitle: s.simTitle,
        startTime: s.startTime,
        endTime: s.endTime,
        currentTime: s.currentTime,
        speed: s.speed,
        playState: s.playState
    }
}