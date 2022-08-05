import { MachineLearning } from "./MachineLearning.js";
import { pitchAbbreviations } from "../parseData.js";
import { readJSON } from "../../utils/files.js";

export class ModelManager extends MachineLearning {
    private models: MachineLearning[];
    private numPitches: number;

    /**
     * Manages a different ML model for each pitch type
     * @param models either a function that creates an untrained ML model or a precreated list of untrained models
     */
    constructor(models: (() => MachineLearning) | MachineLearning[]) {
        super();
        this.numPitches = Object.keys(pitchAbbreviations).length;
        if (typeof models === 'function') {
            this.models = [];
            for (let i = 0; i < this.numPitches; i++) {
                this.models.push(models());
            }
        } else {
            this.models = models;
        }
    }

    fit(features: number[][], targets: number[]): void {
        const endInd = features[0].length - this.numPitches;
        
        const splitFeats: number[][][] = [];
        const splitTargs: number[][] = [];
        for (let i = 0; i < this.numPitches; i++) {
            splitFeats.push([]);
            splitTargs.push([]);
        }

        for (let i = 0; i < features.length; i++) {
            const p_ind = this.firstOne(features[i], endInd);
            if (p_ind < 0 || p_ind >= this.numPitches) {
                throw new Error(`p_ind of ${p_ind} with arr ${features[i]}`);
            }

            splitFeats[p_ind].push(features[i].slice(0, endInd));
            splitTargs[p_ind].push(targets[i]);
        }
        
        for (let i = 0; i < this.models.length; i++) {
            this.models[i].fit(splitFeats[i], splitTargs[i]);
        }
    }

    predict(features: number[][]): number[] {
        const endInd = features[0].length - this.numPitches;

        let res: number[] = [];
        for (const row of features) {
            const p_ind = this.firstOne(row, endInd);
            res.push(this.models[p_ind].predict([row.slice(0, endInd)])[0]);
        }

        return res;
    }

    /**
     * Returns the index of the first nonzero value in arr
     * @param arr the array to look at
     * @param start where to start looking
     * @returns the index of the first nonzero
     */
    private firstOne(arr: number[], start: number): number {
        let i = start - 1;
        while (++i < arr.length && arr[i] === 0) {}
        
        return i - start;
    }

    static fromObj(obj: { [key: string]: any; }): MachineLearning {
        throw new Error('Model Manager clients must use the static readMM method instead!');
    }

    /**
     * Reads the list of models from path, using the converter to read each model
     * @param path the location of the model
     * @param converter how to read each child model. Typically this is the relevant 
     * class' static fromObj method
     */
    static readMM(path: string, converter: (obj: { [key: string]: any}) => MachineLearning): ModelManager {
        return this.fromObjMM(readJSON(path), converter);
    }

    /**
     * Converts the object from the JSON file to a Model Manager
     * The object is assumed to have been saved by the toObj method of ModelManager
     * @param obj the object as read from the JSON file
     * @param converter how to read each child model. Typically this is the relevant 
     * class' static fromObj method
     */
    static fromObjMM(obj: { [key: string]: any }, converter: (obj: { [key: string]: any }) => MachineLearning): ModelManager {
        let models: MachineLearning[] = [];
        for (const m of obj['models']) {
            models.push(converter(m));
        }
        return new ModelManager(models);
    }

    toObj(): { [key: string]: any } {
        let res: { [key: string]: any } = {
            models: []
        };
        for (const model of this.models) {
            res.models.push(model.toObj());
        }

        return res;
    }
}
