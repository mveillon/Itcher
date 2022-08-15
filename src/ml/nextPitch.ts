import { getFeature } from "./mappings.js";
import { getState } from "../baseballLogic/GameState.js";
import { choice } from "../utils/random.js";
import { MachineLearning } from "./models/MachineLearning.js";

/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * @returns what pitch to throw
 */
export const nextPitch = (learner: MachineLearning): string => {
    const state = getState();
    const pitches = Object.keys(state.pitcher.pitches);
    const feats = pitches.map((pitch) => getFeature(pitch, state));
    const rewards = learner.predict(feats);
    const weights = rewards.map(Math.tanh);

    let cum = [weights[0]];
    for (let i = 1; i < rewards.length; i++) {
        cum.push(cum[i - 1] + weights[i]);
    }
    return choice(pitches, cum);
}
