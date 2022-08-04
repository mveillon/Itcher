import { MachineLearning } from "./MachineLearning.js";

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
}
