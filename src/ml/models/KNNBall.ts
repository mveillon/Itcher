import { KNN } from "./KNN.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { squareDistance, squaredMag } from "../calculations.js";

export class KNNBall extends KNN {
    /**
     * Uses a Ball Tree to organize features
     */

    protected buildTree(inds: number[]): BinaryTree<number[]> | number[] {
        if (inds.length <= this._k) return inds;

        /* Too expensive to find the two furthest points so we use a heuristic */ 
        inds.sort((a, b) => squaredMag(this._features[a]) - squaredMag(this._features[b]));
        const p1 = inds[0];
        const p2 = inds[inds.length - 1];
        const comp = (vec: number[]): boolean => {
            return (
                squareDistance(vec, this._features[p1]) <
                squareDistance(vec, this._features[p2])
            );
        }
        let left: number[] = [];
        let right: number[] = [];
        for (const i of inds) {
            if (comp(this._features[i])) left.push(i);
            else right.push(i);
        }
        if (left.length <= 1 || right.length <= 1) return inds;

        return new BinaryTree<number[]>(
            this.buildTree(left),
            this.buildTree(right),
            comp
        );
    }
}

/**
 * Factory function for a default KNNBall
 * @returns default K-Nearest Neighbrs with Ball Tree
 */
 export const knnBall = (): KNNBall => {
    return new KNNBall(500);
}
