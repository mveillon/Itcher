import { MachineLearning } from "./MachineLearning.js";
import { knn } from "./KNN.js";
import { trainLearner } from "../trainTest.js";
import { regression } from "./Regression.js";
import { alwaysMean } from "./alwaysMean.js";
import { knnBall } from "./KNNBall.js";
import { neuralNet } from "./NeuralNet.js";
import { ModelManager } from "./ModelManager.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (): Promise<MachineLearning> => {
    // let res = knn();
    // let res = regression();
    // let res = alwaysMean();
    // let res = neuralNet(20);
    // let res = knnBall();

    // let res = new ModelManager(knn);
    // let res = new ModelManager(regression);
    // let res = new ModelManager(alwaysMean);
    // let res = new ModelManager(neuralNet);
    let res = new ModelManager(knnBall);

    await trainLearner(res);
    return res;
}
