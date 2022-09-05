import { MachineLearning } from "./MachineLearning.js";
import { trainLearner } from "../trainTest.js";
import { regression } from "./Regression.js";
import { EnsembleClassifier } from "./EnsembleClassifier.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (): Promise<MachineLearning> => {
    let res = new EnsembleClassifier(regression, 8);

    await trainLearner(res);
    return res;
}
