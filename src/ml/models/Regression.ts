import { MachineLearning } from "./MachineLearning.js";
import { Matrix, inverse } from "ml-matrix";

export class Regression extends MachineLearning {
    protected _degree: number;
    protected _w: Matrix;

    /**
     * Finds a line of best fit of nth degree to make predictions
     * @param degree the degree of the polynomial describing the trendline
     */
    constructor(degree: number = 2) {
        super();
        this._degree = degree;
        this._w = undefined;
    }

    protected async fitAsync(features: number[][], targets: number[]) {
        if (features.length === 0) return;
        const tarMat = Matrix.columnVector(targets);
        const zs = this.fillZs(features);

        const zsT = zs.transpose();

        // (zs^T * zs)^-1 * (zs^T * tarMat)
        const left = zsT.mmul(zs);
        let inv: Matrix;
        try {
            inv = inverse(left);
        } catch (e) {
            inv = inverse(left, true);
        }
        this._w = inv.mmul(zsT.mmul(tarMat));
    }

    predict(features: number[][]): number[] {
        if (features.length === 0) return [];

        const res = this.fillZs(features).mmul(this._w);
        return res.to1DArray();
    }

    /**
     * Fills out the features array to include the additional terms required to make
     * this model better than just linear regression
     * @param features the 2D array of features
     * @returns a matrix with all terms to use in training
     */
    private fillZs(features: number[][]): Matrix {
        let res: number[][] = [];
        for (let i = 0; i < features.length; i++) {
            let row: number[] = [];
            for (let j = 0; j < features[i].length; j++) {
                const point = features[i][j];
                let current = 1;
                for (let d = 0; d < this._degree + 1; d++) {
                    row.push(current);
                    current *= point;
                }
            }
            res.push(row);
        }

        return new Matrix(res);
    }
}

/**
 * Factory function for a default Regression
 * @returns default regression model
 */
export const regression = (): Regression => {
    return new Regression();
}
