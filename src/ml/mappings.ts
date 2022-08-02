import { GameState, state } from "../baseballLogic/GameState.js";
import { dot, allPitchTypes } from "../utils/utilities.js";
import { pitchAbbreviations } from "./parseData.js";

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
 * Returns a feature array for the given state
 * @param pitch what pitch is being thrown
 * @returns the corresponding feature array
 */
export const getFeature = (pitch: string): number[] => {
    let pType: number[] = [];
    for (const p in pitchAbbreviations) {
        pType.push(+(pitchAbbreviations[p] === pitch));
    }

    let freq = state.pitcher.pitches[pitch];
    if (typeof freq === 'undefined') freq = 0.025;
    return [
        state.balls,
        state.strikes,
        Number(state.pitcherPlatoon()),
        freq,
        ...pType
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
