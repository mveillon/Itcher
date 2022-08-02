import { MachineLearning } from "./MachineLearning.js";
import { KNN } from "./KNN.js";
import { trainLearner } from "../trainTest.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * THIS FUNCTION RESETS THE GLOBAL STATE VARIABLE
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = (): MachineLearning => {
    let res = new KNN(8);
    trainLearner(res);
    return res;
}
