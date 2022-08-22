import { Regression } from "./Regression.js";
import { correlation } from "../calculations.js";
import { Matrix } from "../../../node_modules/ml-matrix/matrix.js";
import { arange, copyArr } from "../../utils/arrayOps.js";

export class InteractionRegression extends Regression {
    protected _terms: number[][];
    protected _minCorr: number;

    /**
     * Like polynomial regression but also multiplies different attributes together, 
     * automatically pruning which combinations to use based on their correlation with 
     * targets
     * @param degree the maximum number of attributes to be used in any one term
     * @param minCorr the minimum correlation allowed for any given term to be selected
     */
    constructor(degree: number = 2, minCorr: number = 0.1) {
        super(degree);
        this._minCorr = minCorr;
    }

    protected fillZs(features: number[][], targets?: number[]): Matrix {
        this.getTerms(features, targets);

        let res: number[][] = [];
        for (const row of features) {
            let currRow: number[] = [];
            for (const c of this._terms) {
                let prod = 1;
                for (const t of c) {
                    prod *= row[t];
                }
                currRow.push(prod);
            }

            res.push(currRow);
        }

        return new Matrix(res);
    }

    /**
     * Computes the correlations of all combinations of terms with degree
     * less than or equal to this._degree and saves them to this._terms
     * @param features the features to compute from
     * @param targets the targets to use for correlations
     */
    private getTerms(features: number[][], targets: number[]) {
        if (typeof this._terms !== 'undefined') return;
        this._terms = [[]];

        const combos = this.allCombos(arange(features[0].length));
        for (const c of combos) {
            let trimmed: number[] = [];
            for (const row of features) {
                let prod = 1;
                for (const t of c) {
                    prod *= row[t];
                }
                trimmed.push(prod);
            }

            // console.log(`${c} => ${trimmed} (${Math.abs(correlation(trimmed, targets))})`);
            if (Math.abs(correlation(trimmed, targets)) > this._minCorr) {
                this._terms.push(c);
            }
        }
    }

    static fromObj(obj: { [key: string]: any }): InteractionRegression {
        let res = new InteractionRegression(obj['degree']);
        res._w = obj['w'];
        res._terms = obj['terms'];
        return res;
    }

    toObj(): { [key: string]: any } {
        let obj = super.toObj();
        obj['terms'] = this._terms;
        return obj;
    }

    /**
     * Finds all possible combinations of the given indices of length equal to
     * size
     * @param inds the array to select elements from
     * @param size the max size of each combination. Defaults to this._degree
     * @returns all combinations of the elements of inds
     */
    private allCombos(inds: number[], size: number = this._degree): number[][] {
        if (size === 0) return [[]];
        const smaller = this.allCombos(inds, size - 1);
        let res: number[][] = copyArr(smaller) as number[][];

        for (const i of inds) {
            for (const s of smaller) {
                if (s.length === size - 1) {
                    res.push([i].concat(s));
                }
            }
        }

        return res;
    }
}

/**
 * Factory function for a default InteractionRegression
 * @returns a default interaction regression
 */
export const interactionRegression = () => {
    return new InteractionRegression(2, 0.005);
}

