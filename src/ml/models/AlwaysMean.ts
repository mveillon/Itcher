import { MachineLearning } from "./MachineLearning.js";
import { readJSON, writeJSON } from "../../utils/files.js";

export class AlwaysMean extends MachineLearning {
    mean: number;

    /**
     * Always predicts the mean of the targets supplied in training
     * Useful as a control model
     */
    constructor() {
        super();
        this.mean = 0;
    }

    fit(features: number[][], targets: number[]): void {
        this.mean = targets.reduce((a, b) => a + b, 0) / targets.length;
    }

    predict(features: number[][]): number[] {
        let res: number[] = [];
        for (let i = 0; i < features.length; i++) {
            res.push(this.mean);
        }
        return res;
    }

    toObj(): { [key: string]: any } {
        return { mean: this.mean };
    }

    static fromObj(obj: { [key: string]: any }): AlwaysMean {
        let res = new AlwaysMean();
        res.mean = obj['mean'];
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
