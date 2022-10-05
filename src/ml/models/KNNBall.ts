/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { KNN } from "./KNN.js";
import { arange, squaredMag } from "../../utils/numJS.js";
import { BinaryTree } from "../../utils/BinaryTree.js";

export class KNNBall extends KNN {
    protected _magnitudes: number[];
    protected _sortedInds: number[];
    /**
     * Uses a Ball Tree to organize features
     */

    protected async fitAsync(features: number[][], targets: number[]) {
        this._magnitudes = features.map(squaredMag);
        this._sortedInds = arange(features.length);
        this._sortedInds.sort((a, b) => this._magnitudes[a] - this._magnitudes[b]);

        await super.fitAsync(features, targets);
    }

    protected buildTree(inds: number[]): number[] | BinaryTree<number[]> {
        return this.buildFromSorted(this._sortedInds);
    }

    /**
     * Builds the tree from a pre-sorted array of indices, all sorted based on their
     * distance from the origin
     * @param inds the indices sorted in ascending order based on their distance from
     * the origin
     * @returns a binary ball tree gropuing samples by proximity
     */
    protected buildFromSorted(inds: number[]): number[] | BinaryTree<number[]> {
        if (inds.length <= this._k) return inds;

        const splitInd = Math.ceil(inds.length / 2);
        const splitMag = this._magnitudes[inds[splitInd]];
        const med = Math.ceil(inds.length / 2);

        return new BinaryTree<number[]>(
            this.buildFromSorted(inds.slice(0, med)),
            this.buildFromSorted(inds.slice(med, inds.length)),
            (vec) => squaredMag(vec) < splitMag
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
