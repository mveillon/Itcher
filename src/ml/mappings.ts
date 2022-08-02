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

    return [
        state.balls,
        state.strikes,
        Number(state.pitcherPlatoon()),
        state.pitcher.pitches[pitchAbbreviations[pitch]],
        ...pType
    ];
}

/**
 * Maps each pitch type to the corresponding row in q and n
 */
export const pitchToInd: { [key: string]: number } = {};
for (let i = 0; i < allPitchTypes.length; i++) {
    pitchToInd[allPitchTypes[i]] = i;
}

/**
 * Total number of possible states
 */
export const numStates = cumulative[cumulative.length - 1];

/**
 * Total number of possible actions (pitches)
 */
export const numActions = Object.keys(pitchToInd).length;
