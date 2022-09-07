import { MachineLearning } from "./MachineLearning.js";
import { Ensemble } from "./Ensemble.js";
import { regToClf } from "./RegToClf.js";

export class EnsembleClassifier extends Ensemble {
    /**
     * A model that uses children all trained to be binary
     * classifiers to make predictions that are then aggregated
     * and interpreted as probabilities of each class outcome
     * @param models either a function that generates a new untrained ML model or a list of untrained models
     * @param numModels how many models to use. Not necessary if models is an array
     */
    constructor(
        models: (() => MachineLearning) | MachineLearning[], 
        numModels?: number
    ) {
        super(models, numModels);
        this._models = this._models.map(regToClf);
    }
}
