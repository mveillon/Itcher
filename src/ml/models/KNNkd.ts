import { KNN } from "./KNN.js";
import { randInt } from "../../utils/random.js";
import { BinaryTree } from "../../utils/BinaryTree.js";

export class KNNkd extends KNN {
    /**
     * Uses a KD tree to organize its features
     */

    protected buildTree(inds: number[]): number[] | BinaryTree<number[]> {
        if (inds.length <= this._k) return inds;
        const crit = this.splitCriterion(inds);

        const splits: [number[], number[]] = [[], []];
        for (const i of inds) {
            splits[+(!crit(this._features[i]))].push(i);
        }

        if (splits[0].length === 0 || splits[1].length === 0) {
            return inds;
        }

        return new BinaryTree<number[]>(
            this.buildTree(splits[0]),
            this.buildTree(splits[1]),
            crit
        );
    }

    /**
     * Computes the criterion used to split the indices into the left and right
     * branches of the KNN tree
     * @param inds the remaining indices into this._features and this._targets
     * @returns how to split the features. Takes one row of features and returns
     * `true` if it should be in the left branch or `false` if it should be in the
     * right branch
     */
    protected splitCriterion(inds: number[]): (vec: number[]) => boolean {
        let splitDim: number;
        let used: Set<number> = new Set();
        let found = false;
        while (!found) {
            if (used.size === this._features[0].length) {
                return (_) => true;
            }
            splitDim = randInt(this._features[0].length);
            if (!used.has(splitDim)) {
                const first = this._features[inds[0]][splitDim];
                for (const i of inds) {
                    if (this._features[i][splitDim] !== first) {
                        found = true;
                        break;
                    }
                }
                used.add(splitDim);
            }
        }

        inds.sort((a, b) => this._features[a][splitDim] - this._features[b][splitDim]);
        
        // if the first half or more of this._features[:, splitDim] are the same,
        // we have to find the first different value
        const smallest = this._features[inds[0]][splitDim];
        let curr = Math.ceil(inds.length / 2);
        while (this._features[inds[curr]][splitDim] === smallest) {
            curr = Math.ceil((inds.length + curr) / 2);
        }
        const medDim = this._features[inds[curr]][splitDim];

        return (vec) => vec[splitDim] < medDim;
    }
}

/**
 * Factory function for a default KNNkd
 * @returns default K-Nearest Neighbors with KD tree
 */
 export const knnKD = (): KNNkd => {
    return new KNNkd(500);
}
