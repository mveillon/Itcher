import { MachineLearning } from "./MachineLearning.js";
import { KNN } from "./KNN.js";
import { trainLearner } from "../trainTest.js";
import { Regression } from "./Regression.js";
import { AlwaysMean } from "./alwaysMean.js";
import { KNNBall } from "./KNNBall.js";
import { NeuralNet } from "./NeuralNet.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (): Promise<MachineLearning> => {
    // let res = new KNN(8);
    // let res = new Regression(2);
    // let res = new AlwaysMean();
    let res = new NeuralNet(20, 32, 128, 64, 1);
    // let res = new KNNBall(8);

    await trainLearner(res);
    return res;
}
