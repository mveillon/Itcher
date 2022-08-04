import { MachineLearning } from "./MachineLearning.js";
import * as tf from "@tensorflow/tfjs-node";

export class NeuralNet extends MachineLearning {
    private net: tf.Sequential;

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
        this.net = tf.sequential();
        const active = 'relu';
        this.net.add(tf.layers.dense({
            inputShape: [layerSizes[0]],
            units: layerSizes[1],
            activation: active
        }));

        for (let i = 2; i < layerSizes.length; i++) {
            this.net.add(tf.layers.dense({
                units: layerSizes[i],
                activation: active
            }))
        }

        this.net.compile({
            optimizer: 'sgd',
            loss: tf.losses.meanSquaredError,
            metrics: [tf.metrics.meanSquaredError]
        });
    }

    async fit(features: number[][], targets: number[]) {
        await this.net.fit(
            tf.tensor(features),
            tf.tensor(targets),
            {
                epochs: 4, 
                batchSize: 64,
                verbose: 0,
            }
        );
    }

    predict(features: number[][]): number[] {
        const preds = this.net.predict(
            tf.tensor(features), {
                verbose: false
            });
        const res = (preds as tf.Tensor).arraySync();
        return (res as number[][]).map(row => row[0]);
    }
}
