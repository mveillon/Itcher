import { shuffle } from "../../utils/random.js";
import { MachineLearning } from "./MachineLearning.js";
import { readJSON } from "../../utils/files.js";
import { colAverage, arange } from "../../utils/arrayOps.js";

export class Ensemble extends MachineLearning {
    protected _models: MachineLearning[];

    /**
     * A model that combines the predictions of several different models to make its predictions
     * @param models either a function that generates a new untrained ML model or a list of untrained models
     * @param numModels how many models to use. Not necessary if _models is an array
     */
    constructor(
        models: (() => MachineLearning) | MachineLearning[], 
        numModels?: number
    ) {
        super();
        if (typeof models === 'function') {
            if (typeof numModels === 'undefined') {
                throw new Error('numModels must be specified when constructor is passed a generator function');
            }

            this._models = [];
            for (let i = 0; i < numModels; i++) {
                this._models.push(models());
            }

        } else {
            this._models = models;
        }
    }

    async fit(features: number[][], targets: number[]) {
        const inds: number[] = arange(features.length);
        shuffle(inds);
        const perModel = Math.floor(inds.length / this._models.length);

        for (let m = 0; m < this._models.length; m++) {
            const start = m * perModel;
            const end = m === this._models.length - 1 ? inds.length : start + perModel;
            let featureCut: number[][] = [];
            let targetCut: number[] = [];
            for (let i = start; i < end; i++) {
                featureCut.push(features[inds[i]]);
                targetCut.push(targets[inds[i]]);
            }

            await this._models[m].fit(featureCut, targetCut);
        }
    }

    predict(features: number[][]): number[] {
        return colAverage(this._models.map((m) => m.predict(features)));
    }

    /**
     * Reads the machine learning model from the given path
     * Allows for more efficient creation than training
     * @param path the location of the saved model
     * @param converter how to convert the submodels into child models. Usually just the static
     * fromObj method of the appropriate class
     * @returns the pre-trained model
     */
    static readEnsemble(path: string, converter: convertFunc): Ensemble {
        return Ensemble.fromObjEnsemble(readJSON(path), converter); 
    }

    static fromObjEnsemble(obj: { [key: string]: any }, converter: convertFunc): Ensemble {
        return new Ensemble(obj['models'].map(converter));
    }
 
    static fromObj(obj: { [key: string]: any }): Ensemble {
        throw new Error(`Ensemble models should use the readEnsemble method, not the read method`);
    }

    toObj(): { [key: string]: any } {
        const objs: { [key: string]: any }[] = [];
        for (const m of this._models) {
            objs.push(m.toObj());
        }
        return { models: objs };
    }
}

type convertFunc = (obj: { [key: string]: any }) => MachineLearning;
