import { MachineLearning } from "./MachineLearning.js";
import { numAttributes } from "../mappings.js";
import * as tf from "@tensorflow/tfjs-node";
import { validFeatsTargs } from "../trainTest.js";
import { writeFile } from "../../utils/files.js";

export class NeuralNet extends MachineLearning {
    private _net: tf.Sequential;

    /**
     * A deep learning neural network
     * @param layerSizes the sizes of each layer. Should include the input and output layers
     */
    constructor(...layerSizes: number[]) {
        super();
        if (layerSizes.length < 2) {
            throw new Error(
                `Layer sizes need to have at least 2 numbers: ${layerSizes}`
            );
        }
        this._net = tf.sequential();
        this._net.add(tf.layers.dense({
            inputShape: [layerSizes[0]],
            units: layerSizes[1],
            activation: 'softsign'
        }));

        for (let i = 2; i < layerSizes.length - 1; i++) {
            this._net.add(tf.layers.dense({
                units: layerSizes[i],
                activation: 'softsign'
            }));
        }

        if (layerSizes.length > 2) {
            this._net.add(tf.layers.dense({
                units: layerSizes[layerSizes.length - 1]
            }))
        }

        this._net.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
            metrics: [tf.metrics.meanSquaredError]
        });
    }

    async fit(features: number[][], targets: number[]) {
        if (features.length === 0) return;
        const [validFeats, validTargs] = validFeatsTargs();
        let trainAcc: number[] = [];
        let validAcc: number[] = [];
        await this._net.fit(
            tf.tensor(features),
            tf.tensor(targets),
            {
                shuffle: true,
                epochs: 30, 
                batchSize: 64,
                verbose: 0,
                validationData: [tf.tensor(validFeats), tf.tensor(validTargs)],
                callbacks: [new tf.CustomCallback({
                    onEpochEnd: (batch, logs) => {
                        trainAcc.push(logs.meanSquaredError);
                        validAcc.push(logs.val_meanSquaredError);
                    }
                })]
            }
        );
        const root = './src/ml/models/overfittingTest/';
        writeFile(root + 'netTrainAcc.txt', trainAcc.join(','));
        writeFile(root + 'netValidAcc.txt', validAcc.join(','));
    }

    predict(features: number[][]): number[] {
        if (features.length === 0) return [];

        const preds = this._net.predict(
            tf.tensor(features), 
            {
                verbose: false
            }
        );

        const res = (preds as tf.Tensor).arraySync();
        return (res as number[][]).map(row => row[0]);
    }

    static fromObj(obj: { [key: string]: any }): MachineLearning {
        throw new Error('Neural net saving and loading not supported');
    }

    toObj(): { [key: string]: any } {
        throw new Error('Neural net saving and loading not supported');
    }
}

/**
 * Factory function for a default NeuralNet
 * @param numInputs the number of inputs to be fed to the first layer
 * @returns default neural net
 */
 export const neuralNet = (numInputs: number = numAttributes()): NeuralNet => {
    return new NeuralNet(numInputs, 1024, 1);
}
