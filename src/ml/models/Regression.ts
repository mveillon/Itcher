/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { MachineLearning } from "./MachineLearning.js";
import { Matrix, inverse } from "ml-matrix";

export class Regression extends MachineLearning {
    protected _degree: number;
    protected _w: number[];
    protected _fixSingular: boolean;

    /**
     * Finds a line of best fit of nth degree to make predictions
     * @param degree the degree of the polynomial describing the trendline
     * @param fixSingular whether to change the features to try and make them
     * not singular. This also scales the features to have a mean of zero and
     * a standard deviation of one
     */
    constructor(degree: number = 2, fixSingular: boolean = true) {
        super();
        this._degree = degree;
        this._fixSingular = fixSingular;
    }

    protected async fitAsync(features: number[][], targets: number[]) {
        if (features.length === 0) return;
        // if (this._fixSingular) {
        //     features = standardScale(features, true) as number[][];
        // }
        // const zs = this.fillZs(features);
        // const zsT = transpose(zs);
        const zs = new Matrix(this.fillZs(features));
        const zsT = zs.transpose();

        // (zs^T * zs)^-1 * (zs^T * tarMat)
        // const left: number[][] = matMul(zsT, zs) as number[][];
        // const inv = invert(left);
        // const right = matMul(zsT, targets);
        // this._w = matMul(inv, right) as number[];
        const left = zsT.mmul(zs);
        const inv = inverse(left, true);
        const right = zsT.mmul(Matrix.columnVector(targets));
        this._w = inv.mmul(right).to1DArray();
    }

    predict(features: number[][]): number[] {
        if (features.length === 0) return [];
        // if (this._fixSingular) {
        //     features = standardScale(features, false) as number[][];
        // }
        // return matMul(this.fillZs(features), this._w) as number[];
        return (
            new Matrix(this.fillZs(features))
                .mmul(Matrix.columnVector(this._w))
                .to1DArray()
        );
    }

    /**
     * Fills out the features array to include the additional terms required to make
     * this model better than just linear regression
     * @param features the 2D array of features
     * @returns a matrix with all terms to use in training
     */
    protected fillZs(features: number[][]): number[][] {
        let res: number[][] = [];
        for (let i = 0; i < features.length; i++) {
            let row: number[] = [1];
            for (let j = 0; j < features[i].length; j++) {
                const point = features[i][j];
                let current = point;
                for (let d = 0; d < this._degree; d++) {
                    row.push(current);
                    current *= point;
                }
            }
            res.push(row);
        }

        return res;
    }
}

/**
 * Factory function for a default Regression
 * @returns default regression model
 */
export const regression = (): Regression => {
    return new Regression();
}
