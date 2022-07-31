import { GameState } from "../baseballLogic/GameState";
import { dot, allPitchTypes } from "../utils/utilities";

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
 * @param state the current game state
 * @returns the corresponding column withing q and n
 */
export const stateToInd = (state: GameState): number => {
    const factors = [
        state.balls,
        state.strikes,
        Number(state.pitcherPlatoon()),
    ];
    return dot(cumulative, factors);
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
