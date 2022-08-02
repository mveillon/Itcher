import { MachineLearning } from "./MachineLearning.js";
import { trainLearner } from "./parseData.js";

const squaredDistance = (x: number[], y: number[]): number => {
    let res = 0;
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        res += Math.pow(x[i] - y[i], 2);
    }
    return res;
}

export class KNN extends MachineLearning {
    features: number[][];
    targets: number[];
    k: number;

    constructor(_k: number) {
        super()
        this.k = _k;
        this.features = [];
        this.targets = [];
    }

    fit(features: number[][], targets: number[]): void {
        this.features = features;
        this.targets = targets;
        if (this.features.length < this.k) {
            throw new Error(`Features too small: ${this.features}`);
        }
    }

    predict(features: number[][]): number[] {
        let predictions: number[] = [];
        const sorter = (a: number[], b: number[]) => {
            if (a[1] > b[1]) return -1;
            if (b[1] > a[1]) return 1;
            return 0;
        }
        for (const f of features) {
            let inds: number[][] = [];
            for (let i = 0; i < this.features.length; i++) {
                inds.push([i, squaredDistance(f, this.features[i])]);
            }

            inds.sort(sorter);

            let avg = 0;
            for (let i = 0; i < this.k; i++) {
                avg += this.targets[inds[i][0]] / this.k;
            }
            predictions.push(avg);
        }

        return predictions;
    }
}

export const learner = new KNN(5);
trainLearner(learner);
