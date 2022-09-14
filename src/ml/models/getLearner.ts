import { MachineLearning } from "./MachineLearning.js";
import { completeFeatsTargs } from "../trainTest.js";
import { Regression } from "./Regression.js";
// import { KNNBall } from "./KNNBall.js";
import { EnsembleClassifier } from "./EnsembleClassifier.js";

export const ensembleChildren = 100;

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @param numChildren the number of children to use in the ensemble method.
 * Default is 100
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (numChildren: number = ensembleChildren): Promise<MachineLearning> => {
    let res = new EnsembleClassifier(() => new Regression(2), numChildren);

    const [feats, targs] = completeFeatsTargs();
    await res.fit(feats, targs);
    return res;
}
