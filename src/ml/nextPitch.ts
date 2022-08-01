import { learner } from "./ReinforcementLearning.js";
import { stateToInd, pitchToInd } from "./mappings.js";
import { state } from "../baseballLogic/GameState.js";
import { choice } from "../utils/random.js";

/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * Trained weights are in global "learner" variable
 * @returns what pitch to throw
 */
export const nextPitch = (): string => {
    const ws = getWeights();
    if (ws.length === 0) {
        throw new Error(
            `Empty pitch list for ${state.pitcher.name} (${state.pitcher.pitches})`
        );
    }
    const pitchNames = Object.keys(state.pitcher.pitches);
    const inds: number[] = [];
    for (let i = 0; i < ws.length; i++) {
        inds.push(i);
    }
    return pitchNames[choice(inds, ws)];
}

/**
 * Uses the current state to compute the weights for each pitch
 * @returns a weight for each pitch the current pitcher throws
 */
const getWeights = (): number[] => {
    const q = learner.weights.q[stateToInd(state)];
    const canThrow = state.pitcher.pitches;
    const pitchNames = Object.keys(canThrow); // to guarantee iteration order
    const relevant: number[] = [];
    let total = 0;

    for (const pitch in pitchNames) {
        relevant.push(q[pitchToInd[pitch]]);
        total += canThrow[pitch];
    }

    const mean = total / relevant.length;
    let variance = 0;
    for (const pitch in pitchNames) {
        variance += Math.pow(canThrow[pitch] - mean, 2) / relevant.length;
    }
    const stdDev = Math.sqrt(variance);

    let ind = 0;
    for (const pitch in pitchNames) {
        const z = (canThrow[pitch] - mean) / stdDev;
        relevant[ind++] *= Math.sqrt(z);
    }

    return relevant;
}

