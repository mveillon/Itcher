import { MachineLearning } from "./MachineLearning.js";
import { pitchAbbreviations } from "../parseData.js";

export class ModelManager extends MachineLearning {
    models: MachineLearning[];
    numPitches: number;

    /**
     * Manages a different ML model for each pitch type
     * @param modelGen a function that creates an untrained ML model
     */
    constructor(modelGen: () => MachineLearning) {
        super();
        this.models = [];
        this.numPitches = Object.keys(pitchAbbreviations).length;
        for (let i = 0; i < this.numPitches; i++) {
            this.models.push(modelGen());
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
     * @start where to start looking
     * @returns the index of the first nonzero
     */
    private firstOne(arr: number[], start: number): number {
        let i = start - 1;
        while (++i < arr.length && arr[i] === 0) {}
        
        return i - start;
    }
}

