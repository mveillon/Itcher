import { MachineLearning } from "./MachineLearning.js";
import { numArray, ndMap } from "../../utils/numJS.js";

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
        await this._model.fit(features, this.toBinary(targets) as number[]);
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
        return ndMap(arr, n => +(n > threshold));
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
