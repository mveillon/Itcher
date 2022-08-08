import { MachineLearning } from "./MachineLearning.js";

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

    fit(features: number[][], targets: number[]): void {
        this._mean = targets.reduce((a, b) => a + b, 0) / targets.length;
    }

    predict(features: number[][]): number[] {
        let res: number[] = [];
        for (let i = 0; i < features.length; i++) {
            res.push(this._mean);
        }
        return res;
    }

    toObj(): { [key: string]: any } {
        return { _mean: this._mean };
    }

    static fromObj(obj: { [key: string]: any }): AlwaysMean {
        let res = new AlwaysMean();
        res._mean = obj['_mean'];
        return res;
    }
}

/**
 * Factory function for a default AlwaysMean
 * @returns default always mean
 */
export const alwaysMean = (): AlwaysMean => {
    return new AlwaysMean();
}
