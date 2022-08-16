import { MachineLearning } from "./MachineLearning.js";
import { Matrix, inverse } from "../../../node_modules/ml-matrix/matrix.js";

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

    fit(features: number[][], targets: number[]): void {
        if (features.length === 0) return;
        const tarMat = Matrix.columnVector(targets);
        const zs = this.fitZs(features, targets);

        const zsT = zs.transpose();

        // (zs^T * zs)^-1 * (zs^T * tarMat)
        const left = zsT.mmul(zs)
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

        const res = this.predictZs(features).mmul(this._w);
        return matToArray(res);
    }

    static fromObj(obj: { [key: string]: any; }): Regression {
        let res = new Regression(obj['degree']);
        res._w = obj['w'];
        return res;
    }

    toObj(): { [key: string]: any; } {
        return {
            degree: this._degree,
            w: this._w
        };
    }

    /**
     * Augments the features array to include the polynomial terms
     * @param features the set of attributes
     * @param targets the rewards
     * @returns an augmented feature array to use to find w
     */
    protected fitZs(features: number[][], targets: number[]): Matrix {
        let zs = Matrix.ones(
            features.length, 
            features[0].length * this._degree + 1
        );
        
        for (let i = 0; i < features.length; i++) {
            for (let j = 0; j < features[0].length; j++) {
                const point = features[i][j];
                for (let d = 1; d < this._degree + 1; d++) {
                    zs.set(i, j * this._degree + d, Math.pow(point, d));
                }
            }
        }

        return zs;
    }

    /**
     * Augments the features array to be compatible with w
     * @param features the set of attributes
     * @returns the augmented features
     */
    protected predictZs(features: number[][]): Matrix {
        return this.fitZs(features, []);
    }
}

/**
 * Convers the matrix (vector) to an array of numbers
 * @param mat a matrix. Should really be one-dimensional
 * @returns the vector as an Array
 */
export const matToArray = (mat: Matrix): number[] => {
    let res: number[] = [];
    for (let i = 0; i < mat.rows; i++) {
        res.push(mat.get(i, 0));
    }
    return res;
}

/**
 * Factory function for a default Regression
 * @returns default regression model
 */
export const regression = (): Regression => {
    return new Regression();
}
