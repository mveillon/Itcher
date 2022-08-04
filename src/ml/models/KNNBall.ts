import { KNN } from "./KNN.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { squareDistance, squaredMag } from "../metrics.js";

export class KNNBall extends KNN {
    /**
     * Same API as KNN but uses a Ball Tree instead of a KD tree.
     * Slower than KNN but more accurate with higher-dimensionality features
     */

    protected override buildTree(inds: number[]): BinaryTree<number[]> | number[] {
        if (inds.length <= this.k) return inds;

        /* Too expensive to find the two furthest points so we use a heuristic */ 
        inds.sort((a, b) => squaredMag(this.features[a]) - squaredMag(this.features[b]));
        const p1 = inds[0];
        const p2 = inds[inds.length - 1];
        const comp = (vec: number[]): boolean => {
            return (
                squareDistance(vec, this.features[p1]) <
                squareDistance(vec, this.features[p2])
            );
        }
        let left: number[] = [];
        let right: number[] = [];
        for (const i of inds) {
            if (comp(this.features[i])) left.push(i);
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
