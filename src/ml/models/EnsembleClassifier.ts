import { Ensemble } from "./Ensemble.js";

export class EnsembleClassifier extends Ensemble {
    /**
     * A model that uses children all trained to be binary
     * classifiers to make predictions that are then aggregated
     * and interpreted as probabilities of each class outcome
     */
    
    async fit(features: number[][], targets: number[]) {
        await super.fit(features, this.toBinary(targets));
    }

    /**
     * Converts the array of values typically used for regression
     * into an array of values that are all either zero or one
     * @param arr the array to transform
     * @returns an array of all zeros and ones
     */
    private toBinary(arr: number[]): number[] {
        return arr.map(n => +(n > 0));
    }
}
