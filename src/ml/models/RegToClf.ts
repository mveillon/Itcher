import { MachineLearning } from "./MachineLearning.js";
import { numArray, arrGT, toNum, arange, arrIndex, toBool, arrNot, argMin } from "../../utils/numJS.js";
import { shuffle } from "../../utils/random.js";

export class RegToClf extends MachineLearning {
    protected _model: MachineLearning;

    /**
     * Uses a regression model as a binary classifier, converting its outputs 
     * to either zero or one
     * @param model the regression model to use
     */
    constructor(model: MachineLearning) {
        super();
        this._model = model;
    }

    async fitAsync(features: number[][], targets: number[]) {
        await this._model.fit(...this.equalClasses(features, targets));
    }

    predict(features: number[][]): number[] {
        return this.toBinary(this._model.predict(features), 0.5) as number[];
    }

    /**
     * Converts the numeric array to one of all ones and zeros. For each value,
     * if the value is greater than `threshold` (default is 0), the outputted value
     * is one, otherwise it is zero
     * @param arr the array to binarize
     * @param threshold the threshold at which to split the data into ones and zeros
     * @returns an array of ones and zeros
     */
    private toBinary = (arr: numArray, threshold: number = 0): numArray => {
        return toNum(arrGT(arr, threshold));
    }

    /**
     * Removes features and targets to ensure that there is an equal amount
     * of samples of each class
     * @param features the 2D array of features
     * @param targets the 1D array of targets as passed into the fit function
     * @returns the new features and targets array
     */
    protected equalClasses(
        features: number[][], 
        targets: number[]
    ): [number[][], number[]] {
        const binTargs: number[] = this.toBinary(targets) as number[];
        const inds = arange(features.length);
        let byClass: [number[], number[]] = [[], []];
        for (let i = 0; i < binTargs.length; i++) {
            byClass[binTargs[i]].push(inds[i]);
        }
        const smaller = argMin(byClass.map(a => a.length));
        shuffle(byClass[1 - smaller]);
        byClass[1 - smaller] = byClass[1 - smaller].slice(0, byClass[smaller].length);
        const newInds = byClass[0].concat(byClass[1]);
        shuffle(newInds);
        return [
            arrIndex(features, newInds) as number[][],
            arrIndex(binTargs, newInds) as number[]
        ];
    }
}

/**
 * Factory function for a regression-to-classifier model
 * @param model the regression model to use
 * @returns the classifier that uses model to make its classifications
 */
export const regToClf = (model: MachineLearning): RegToClf => {
    return new RegToClf(model);
}
