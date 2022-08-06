import { KNN } from "./KNN.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { randInt } from "../../utils/random.js";

export class KNNkd extends KNN {
    /**
     * Uses a KD tree to organize its features
     */

    protected buildTree(inds: number[]): BinaryTree<number[]> | number[] {
        if (inds.length <= this.k) return inds;

        const splitDim = randInt(this.features[0].length);
        inds.sort((a, b) => this.features[a][splitDim] - this.features[b][splitDim]);

        const med = Math.ceil(inds.length / 2);
        let left: number[] = inds.slice(0, med);
        let right: number[] = inds.slice(med, inds.length);
        const medDim = this.features[inds[med]][splitDim];

        return new BinaryTree<number[]>(
            this.buildTree(left),
            this.buildTree(right),
            (val: number[]): boolean => val[splitDim] < medDim
        );
    }
}

/**
 * Factory function for a default KNNkd
 * @returns default K-Nearest Neighbors with KD tree
 */
 export const knnKD = (): KNNkd => {
    return new KNNkd(8);
}
