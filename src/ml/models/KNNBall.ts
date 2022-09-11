import { KNN } from "./KNN.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { squareDistance, squaredMag } from "../../utils/numJS.js";

export class KNNBall extends KNN {
    /**
     * Uses a Ball Tree to organize features
     */

    protected buildTree(inds: number[]): BinaryTree<number[]> | number[] {
        if (inds.length <= this._k) return inds;

        /* Too expensive to find the two furthest points so we use a heuristic */ 
        inds.sort((a, b) => squaredMag(this._features[a]) - squaredMag(this._features[b]));
        const p1 = inds[0];
        let p2: number;
        let bestDistance = -Infinity;
        for (const i of inds) {
            const newDist = squareDistance(this._features[p1], this._features[i])
            if (newDist > bestDistance) {
                p2 = i;
                bestDistance = newDist;
            }
        }

        const comp = (vec: number[]): boolean => {
            return (
                squareDistance(vec, this._features[p1]) <
                squareDistance(vec, this._features[p2])
            );
        }
        let splits: [number[], number[]] = [[], []];
        for (const i of inds) {
            splits[+(!comp(this._features[i]))].push(i);
        }

        if (splits[0].length <= 1 || splits[1].length <= 1) return inds;

        return new BinaryTree<number[]>(
            this.buildTree(splits[0]),
            this.buildTree(splits[1]),
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
