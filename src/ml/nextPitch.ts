import { learner } from "./KNN.js";
import { getFeature } from "./mappings.js";
import { state } from "../baseballLogic/GameState.js";
import { choice } from "../utils/random.js";

/**
 * Given the current game state, computes the next pitch to throw
 * Current game state is in global "state" variable
 * Trained weights are in global "learner" variable
 * @returns what pitch to throw
 */
export const nextPitch = (): string => {
    let rewards: number[] = [];
    const pitches = Object.keys(state.pitcher.pitches);
    for (const p of pitches) {
        rewards.push(learner.predict([getFeature(p)])[0]);
        if (rewards.length > 1) {
            rewards[rewards.length - 1] += rewards[rewards.length - 2];
        }
    }
    return choice(pitches, rewards);
}
