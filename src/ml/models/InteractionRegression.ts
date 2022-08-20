import { Regression } from "./Regression.js";
import { correlation } from "../calculations.js";
import { Matrix } from "../../../node_modules/ml-matrix/matrix.js";
import { arange } from "../../utils/arrayOps.js";

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

    protected fitZs(features: number[][], targets: number[]): Matrix {
        const left = this.fitInteraction(features, targets);
        return this.combine(left, super.fitZs(features, targets));
    }

    protected predictZs(features: number[][]): Matrix {
        const left = this.predictInteraction(features);
        return this.combine(left, super.predictZs(features));
    }

    /**
     * Appends mat1 to mat2
     * @param mat1 the left matrix
     * @param mat2 the right matrix
     * @returns the concatenated 2D matrix
     */
    private combine(mat1: Matrix, mat2: Matrix): Matrix {
        let res: number[][] = [];
        const both = [mat1, mat2];
        for (let i = 0; i < Math.min(mat1.rows, mat2.rows); i++) {
            let row: number[] = [];
            for (const m of both) {
                for (let j = 0; j < m.columns; j++) {
                    row.push(m.get(i, j));
                }
            }

            res.push(row);
        }

        return new Matrix(res);
    }

    /**
     * Helper for fitZs. 
     * Finds all the interaction terms but not any of the single variate polynomials
     * @param features the independent variables
     * @param targets the dependent variables
     * @returns the left half of the augmented features array
     */
    private fitInteraction(features: number[][], targets: number[]): Matrix {
        this._terms = [];
        const combos = this.allCombos(arange(features[0].length));

        for (const c of combos) {
            if (c.length <= 1) continue;

            let x: number[] = [];
            for (let i = 0; i < features.length; i++) {
                let total = 0;
                for (const j of c) {
                    total += features[i][j];
                }
                x.push(total);
            }

            if (Math.abs(correlation(x, targets)) > this._minCorr) {
                this._terms.push(c);
            }
        }

        return this.predictInteraction(features);
    }

    /**
     * Helper for predictZs. 
     * Finds all the interaction terms but not any of the single variate polynomials
     * @param features the independent variables
     * @returns the left half of the augmented features array
     */
    private predictInteraction(features: number[][]): Matrix {
        let res: number[][] = [];
        for (let i = 0; i < features.length; i++) {
            let row: number[] = [];
            for (const c of this._terms) {
                let total = 0;
                for (const j of c) {
                    total += features[i][j];
                }
                row.push(total);
            }
            res.push(row);
        }

        return new Matrix(res);
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
     * Finds all possible combinations of the given indices
     * https://www.techiedelight.com/find-distinct-combinations-of-given-length/
     * @param inds the array to select elements from
     * @returns all combinations of the elements of inds
     */
    private allCombos(inds: number[]): number[][] {
        const helper = (
            k: number, 
            subarrays: Set<number[]>, 
            out: number[], 
            i: number
        ) => {
            if (k === 0) {
                subarrays.add(out);
                return;
            }

            for (let j = i; j < inds.length; j++) {
                helper(k - 1, subarrays, out.concat(inds[j]), j + 1);
            }
        }

        let res = new Set<number[]>();
        helper(this._degree, res, [], 0);
        return [...res];
    }
}

/**
 * Factory function for a default InteractionRegression
 * @returns a default interaction regression
 */
export const interactionRegression = () => {
    return new InteractionRegression(2, 0.005);
}

