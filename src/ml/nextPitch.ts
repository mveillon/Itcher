import { getFeature } from "./mappings.js";
import { state } from "../baseballLogic/GameState.js";
import { choice } from "../utils/random.js";
import { MachineLearning } from "./models/MachineLearning.js";

/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * @returns what pitch to throw
 */
export const nextPitch = (learner: MachineLearning): string => {
    const pitches = Object.keys(state.pitcher.pitches);
    const feats = pitches.map(getFeature);
    const rewards = learner.predict(feats);
    let cum = [rewards[0]];
    for (let i = 1; i < rewards.length; i++) {
        cum.push(cum[i - 1] + rewards[i]);
    }
    return choice(pitches, cum);
}
