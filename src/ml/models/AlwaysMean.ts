import { MachineLearning } from "./MachineLearning.js";
import { average } from "../calculations.js";

export class AlwaysMean extends MachineLearning {
    private _mean: number;

    /**
     * Always predicts the mean of the targets supplied in training
     * Useful as a control model
     */
    constructor() {
        super();
        this._mean = 0;
    }

    get mean(): number {
        return this._mean;
    }

    protected async fitAsync(features: number[][], targets: number[]) {
        this._mean = average(targets);
    }

    predict(features: number[][]): number[] {
        return Array(features.length).fill(this._mean);
    }
}

/**
 * Factory function for a default AlwaysMean
 * @returns default always mean
 */
export const alwaysMean = (): AlwaysMean => {
    return new AlwaysMean();
}
