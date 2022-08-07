import { MachineLearning } from "./MachineLearning.js";
import { knnKD } from "./KNNkd.js";
import { trainLearner } from "../trainTest.js";
import { regression } from "./Regression.js";
import { alwaysMean } from "./alwaysMean.js";
import { knnBall } from "./KNNBall.js";
import { neuralNet } from "./NeuralNet.js";
import { Ensemble } from "./Ensemble.js";

/**
 * Trains the machine learning network that will predict
 * the expected reward given the current state and what pitch
 * is being thrown.
 * @returns a machine learning model for selecting pitches
 */
export const getLearner = async (): Promise<MachineLearning> => {
    let res = knnKD();
    // let res = regression();
    // let res = alwaysMean();
    // let res = neuralNet();
    // let res = knnBall();

    const numChildren = 8;
    // let res = new Ensemble(knnKD, numChildren);
    // let res = new Ensemble(regression, numChildren);
    // let res = new Ensemble(alwaysMean, numChildren);
    // let res = new Ensemble(neuralNet, numChildren);
    // let res = new Ensemble(knnBall, numChildren);
    // let res = new Ensemble([
    //     knnKD(),
    //     regression(),
    //     neuralNet(),
    //     knnBall(),
    // ]);

    await trainLearner(res);
    return res;
}
