import { MachineLearning } from "./MachineLearning.js";
import { completeFeatsTargs } from "../trainTest.js";
import { regression } from "./Regression.js";
import { EnsembleClassifier } from "./EnsembleClassifier.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @param numChildren the number of children to use in the ensemble method.
 * Default is 20
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (numChildren: number = 20): Promise<MachineLearning> => {
    let res = new EnsembleClassifier(regression, numChildren);

    const [feats, targs] = completeFeatsTargs();
    await res.fit(feats, targs);
    return res;
}
