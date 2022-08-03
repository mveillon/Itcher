import { MachineLearning } from "./MachineLearning.js";
import * as tf from "../../../node_modules/@tensorflow/tfjs";

export class NeuralNet extends MachineLearning {
    private net: tf.Sequential;

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
            loss: 'mse',
            metrics: ['mse']
        });
    }

    async fit(features: number[][], targets: number[]) {
        await this.net.fit(
            tf.tensor(features),
            tf.tensor(targets)
        );
    }

    predict(features: number[][]): number[] {
        const preds = this.net.predict(tf.tensor(features));
        const res = (preds as tf.Tensor).arraySync();
        return res as number[];
    }
}
