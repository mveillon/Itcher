/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { shuffle } from "../../utils/random.js";
import { MachineLearning } from "./MachineLearning.js";
import { colAverage, arange, arrIndex } from "../../utils/numJS.js";

export class Ensemble extends MachineLearning {
    protected _models: MachineLearning[];

    /**
     * A model that combines the predictions of several different models to make its predictions
     * @param models either a function that generates a new untrained ML model or a list of untrained models
     * @param numModels how many models to use. Not necessary if models is an array
     */
    constructor(
        models: (() => MachineLearning) | MachineLearning[], 
        numModels?: number,
    ) {
        super();
        if (typeof models === 'function') {
            if (typeof numModels === 'undefined') {
                throw new Error('numModels must be specified when constructor is passed a generator function');
            }

            this._models = [];
            for (let i = 0; i < numModels; i++) {
                this._models.push(models());
            }

        } else {
            this._models = models;
        }
    }

    /**
     * Trains each child model on the given features and targets
     * @param features the dependent variables to train on
     * @param targets the response variables 
     * @param perModel what fraction of samples to send to each child model. Default
     * is to `1 / this._models.length`
     */
    protected async fitAsync(features: number[][], targets: number[], perModel?: number) {
        perModel = perModel || (1 / this._models.length);
        const sampsPer = Math.floor(features.length * perModel);

        const inds: number[] = arange(features.length);
        shuffle(inds);
        let featureCuts: number[][][] = [];
        let targetCuts: number[][] = [];

        for (let m = 0; m < this._models.length; m++) {
            const start = m * sampsPer;
            const end = start + sampsPer;
            const indSlice = inds.slice(start, end);
            featureCuts.push(arrIndex(features, indSlice) as number[][]);
            targetCuts.push(arrIndex(targets, indSlice) as number[]);
        }

        let fitPromises: Promise<void>[] = [];
        for (let m = 0; m < this._models.length; m++) {
            fitPromises.push(this._models[m].fit(featureCuts[m], targetCuts[m]));
        }
        await Promise.all(fitPromises);
    }

    predict(features: number[][]): number[] {
        return colAverage(this._models.map((m) => m.predict(features)));
    }
}

