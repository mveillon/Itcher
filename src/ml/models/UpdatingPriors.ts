import { MachineLearning } from "./MachineLearning.js";
import { stateAttrs } from "../mappings.js";
const ArrayKeyedMap = require('array-keyed-map');
import { readJSON, writeJSON } from "../../utils/files";

export class UpdatingPriors extends MachineLearning {
    protected _models: MachineLearning[];
    protected _generator: () => MachineLearning;
    protected _s2i: any;
    protected _lastInd: number;

    /**
     * Splits the training data based on the game states, collects
     * the means of all those splits, then uses an ML model to predict
     * the difference between the mean and the actual target based on the
     * pitch measures. 
     * 
     * Assumes the first `stateAttrs` attributes in each
     * row are dependent on the game state, not the next pitch, and that
     * each of those game state attributes are integers, not floats
     * @param generator a function to generate a machine learning model
     */
    constructor(generator: () => MachineLearning) {
        super();
        this._models = [];
        this._generator = generator;
        this._s2i = new ArrayKeyedMap();
        this._lastInd = 0;
    }

    async fit(features: number[][], targets: number[]) {
        const [sFeats, pFeats] = this.splitFeats(features);
        let splits: { feats: number[][], targs: number[] }[] = [];
        for (let i = 0; i < sFeats.length; i++) {
            const sInd = this.stateToInd(sFeats[i]);
            while (sInd >= splits.length) {
                splits.push({
                    feats: [],
                    targs: [],
                });
            }
 
            splits[sInd].feats.push(pFeats[i]);
            splits[sInd].targs.push(targets[i]);
        }

        for (let i = 0; i < splits.length; i++) {
            const model = this._generator();
            await model.fit(
                splits[i].feats,
                splits[i].targs
            );
            this._models.push(model);
        }
    }

    predict(features: number[][]): number[] {
        const [sFeats, pFeats] = this.splitFeats(features);
        let splits: { feats: number[][], origInds: number[] }[] = [];
        for (let i = 0; i < sFeats.length; i++) {
            const sInd = this.stateToInd(sFeats[i], false);
            while (sInd >= splits.length) {
                splits.push({
                    feats: [],
                    origInds: []
                });
            }

            splits[sInd].feats.push(pFeats[i]);
            splits[sInd].origInds.push(i);
        }

        let res: number[] = new Array(features.length);
        for (let i = 0; i < splits.length; i++) {
            const preds = this._models[i].predict(splits[i].feats);
            for (let j = 0; j < preds.length; j++) {
                res[splits[i].origInds[j]] = preds[j];
            }
        }

        return res;
    }

    /**
     * Returns the index based on the given state. If addIfMissing (the default), will safely add the state
     * to the model's map before returning the index. Otherwise, it will error if the row is missing
     * @param state the part of the features row dependent on the game state
     * @param addIfMissing whether or not to add the features row if it is not present
     * @returns the index into this._models based on the state
     */
    private stateToInd(state: number[], addIfMissing: boolean = true): number {
        if (this._s2i.has(state)) {
            return this._s2i.get(state);
        } else {
            if (addIfMissing) {
                this._s2i.set(state, this._lastInd);
                return this._lastInd++;
            } else {
                throw new Error(`Missing state ${state} from ${[...this._s2i]}`);
            }
        }
    }

    /**
     * Splits the features in two, with left being the columns before stateAttrs and right
     * being the stateAttrs column and above
     * @param features the features to split
     * @returns the left and right splits
     */
    private splitFeats(features: number[][]): [number[][], number[][]] {
        let left: number[][] = [];
        let right: number[][] = [];
        const ind = stateAttrs();
        for (const row of features) {
            left.push(row.slice(0, ind));
            right.push(row.slice(ind, row.length));
        }
        return [left, right];
    }

    static fromObj(obj: { [key: string]: any }): MachineLearning {
        throw new Error('UpdatingPriors models should use upFromObj');
    }

    toObj(): { [key: string]: any } {
        throw new Error('UpdatingPriors models should use upToObj');
    }

    /**
     * Reads the object as generated from UpdatingPriors.upToObj
     * @param obj the JSON-like object to read
     * @param converter how to convert the object's ML model. Usually just the model type's
     * static fromObj method
     * @returns a pre-trained UpdatingPriors model
     */
    static upFromObj(
        obj: { [key: string]: any }, 
        converter: (model: { [key: string]: any }) => MachineLearning
    ): UpdatingPriors {
        let res = new UpdatingPriors(undefined);
        for (const model of obj.models) {
            res._models.push(converter(model));
        }
        for (const [key, val] of obj.s2i) {
            res._s2i.set(key, val);
        }
        return res;
    }

    /**
     * Converts the UpdatingPriors to a JSON-like model that UpdatingPriors.upFromObj can read
     * @param converter how to convert the ML model
     * @returns a JSON-like object that can be written to disk
     */
    upToObj(
        converter: (model: MachineLearning) => { [key: string]: any }
    ): { [key: string]: any } {
        return {
            models: this._models.map(converter),
            s2i: [...this._s2i]
        };
    }

    static upRead(path: string, converter: (model: { [key: string]: any }) => MachineLearning): UpdatingPriors {
        return UpdatingPriors.upFromObj(readJSON(path), converter);
    }

    upWrite(path: string, converter: (model: MachineLearning) => { [key: string]: any }) {
        writeJSON(path, this.upToObj(converter));
    }
}
