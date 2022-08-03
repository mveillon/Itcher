import { MachineLearning } from "./MachineLearning.js";
import { Matrix, inverse } from "../../../node_modules/ml-matrix/matrix.js";

export class Regression extends MachineLearning {
    degree: number;
    w: Matrix;

    constructor(_degree: number = 2) {
        super();
        this.degree = _degree;
        this.w = undefined;
    }

    fit(features: number[][], targets: number[]): void {
        const featMat = new Matrix(features);
        const tarMat = Matrix.columnVector(targets);
        const dims = [
            features.length,
            features[0].length
        ];

        let zs = Matrix.ones(dims[0], dims[1] * this.degree + 1);
        for (let i = 0; i < dims[0]; i++) {
            for (let j = 0; j < dims[1]; j++) {
                const point = featMat.get(i, j);
                for (let d = 1; d < this.degree + 1; d++) {
                    zs.set(i, j * this.degree + d, Math.pow(point, d));
                }
            }
        }

        const zsT = zs.transpose();

        // (zs^T * zs)^-1 * (zs^T * tarMat)
        const left = zsT.mmul(zs)
        let inv: Matrix;
        try {
            inv = inverse(left);
        } catch (e) {
            inv = inverse(left, true);
        }
        this.w = inv.mmul(zsT.mmul(tarMat));
    }

    predict(features: number[][]): number[] {
        if (!(this.w instanceof Matrix)) {
            throw new Error(`Cannot predict before fitting!`);
        }

        const featMat = new Matrix(features);
        const dims = [features.length, features[0].length];
        let preds = Matrix.mul(Matrix.ones(dims[0], 1), this.w.get(0, 0));

        for (let i = 0; i < dims[0]; i++) {
            for (let j = 0; j < dims[1]; j++) {
                const point = featMat.get(i, j);
                for (let d = 1; d < this.degree + 1; d++) {
                    const toAdd = this.w.get(j * this.degree + d, 0) * Math.pow(point, d);
                    preds.set(i, 0, preds.get(i, 0) + toAdd);
                }
            }
        }

        return matToArray(preds);
    }
}

/**
 * Convers the matrix (vector) to an array of numbers
 * @param mat a matrix. Should really be one-dimensional
 * @returns the vector as an Array
 */
export const matToArray = (mat: Matrix): number[] => {
    let res = [];
    for (let i = 0; i < mat.rows; i++) {
        res.push(mat.get(i, 0));
    }
    return res;
}
