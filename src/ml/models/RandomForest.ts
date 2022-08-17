const rf = require('random-forest');
import { MachineLearning } from "./MachineLearning.js";

export class RandomForest extends MachineLearning {
    protected _forest: any;

    /**
     * An ensemble of decision trees, each trained on a subset of the data
     * @param leafSize the minimum number of elements in each leaf. Default is 200
     */
    constructor(leafSize?: number) {
        super();
        this._forest = new rf.RandomForestRegressor({
            maxFeatures: 'auto',
            minSamplesLeaf: leafSize || 200,
            nEstimators: 30,
        });
    }

    fit(features: number[][], targets: number[]) {
        this._forest.train(features, targets);
    }

    predict(features: number[][]): number[] {
        return this._forest.predict(features);
    }

    static fromObj(obj: { [key: string]: any }): RandomForest {
        const forest = rf.load(new Uint8Array(obj.arr));
        let res = new RandomForest();
        res._forest = forest;
        return res;
    }

    toObj(): { [key: string]: any } {
        return { arr: this._forest.save() };
    }
}

/**
 * Factory function for a default RandomForest
 * @param leafSize the minimum number of elements in each leaf. Default is 200
 * @returns default random forest
 */
export const randomForest = (leafSize?: number): RandomForest => {
    return new RandomForest(leafSize);
}
