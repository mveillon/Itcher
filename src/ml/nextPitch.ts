import { getFeature } from "./mappings.js";
import { getState } from "../baseballLogic/GameState.js";
import { choice } from "../utils/random.js";
import { MachineLearning } from "./models/MachineLearning.js";
import { sigmoid } from "./calculations.js";
import { scalarMul } from "../utils/numJS.js";

/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * @param learner the ML model to use for predictions
 * @returns what pitch to throw
 */
export const nextPitch = (learner: MachineLearning): string => {
    const state = getState();
    const pitches = Object.keys(state.pitcher.pitches).filter(name => {
        return state.pitcher.pitches[name].timesThrown > 0.05;
    });
    return choice(pitches, getWs(learner, pitches));
}

/**
 * Returns the cumulative weights for each given pitch
 * @param learner the ML model to use to predict the value of each pitch
 * @param pitches the pitches to weight
 * @returns the cumulative weights for each pitch
 */
export const getWs = (learner: MachineLearning, pitches: string[]): number[] => {
    const state = getState();
    const feats = pitches.map((pitch) => getFeature(pitch, state));
    const rewards = learner.predict(feats);
    const weights = rewards.map(sigmoid);

    let cum = [weights[0]];
    for (let i = 1; i < rewards.length; i++) {
        cum.push(cum[i - 1] + weights[i]);
    }

    // console.log(scalarMul(1 / cum[cum.length - 1], weights));
    // console.log(rewards);

    return cum;
}
