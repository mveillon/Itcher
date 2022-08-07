import { GameState, state } from "../baseballLogic/GameState.js";
import { allPitchTypes } from "../utils/utilities.js";
import { dot } from "./metrics.js";

const maxes = [
    4, // max number of balls
    3, // max number of strikes
    2, // for platoon advantage
];

let cumulative = [1];
for (let i = 0; i < maxes.length; i++) {
    cumulative.push(maxes[i] * cumulative[i]);
}

/**
 * Maps the current game state to the index of the state 
 * within the q and n matrices
 * @param theState the current game state
 * @returns the corresponding column withing q and n
 */
export const stateToInd = (theState: GameState): number => {
    const factors = [
        theState.balls,
        theState.strikes,
        Number(theState.pitcherPlatoon()),
    ];
    return dot(cumulative, factors);
}
/**
 * The total number of attributes in each feature
 * @returns the width of the features array
 */
export const numAttributes = (): number => {
    return 7;
}

/**
 * Returns a feature array for the given state
 * @param pitch what pitch is being thrown
 * @returns the corresponding feature array
 */
export const getFeature = (pitch: string): number[] => {
    let pitchO = state.pitcher.pitches[pitch];
    const radDirec = pitchO.spinDirection * Math.PI / 360;
    return [
        state.balls,
        state.strikes,
        +state.pitcherPlatoon(),
        pitchO.timesThrown,
        pitchO.spinRate,
        Math.sin(radDirec),
        Math.cos(radDirec),
    ];
}

/**
 * Maps each pitch type to the corresponding index
 * @returns an index for each pitch type
 */
export const pitchToInd = (): { [key: string]: number } => {
    let res: { [key: string]: number } = {};
    for (let i = 0; i < allPitchTypes.length; i++) {
        res[allPitchTypes[i]] = i;
    }
    return res;
}

/**
 * Total number of possible states
 * @returns the total number of possible states
 */
export const numStates = (): number => {
    return cumulative[cumulative.length - 1];
}

/**
 * Total number of possible actions (pitches)
 * @returns the total number of possible actions
 */
export const numActions = (): number => {
    return Object.keys(pitchToInd()).length;
}
