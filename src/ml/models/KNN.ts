import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { randInt } from "../../utils/random.js";

export class KNN extends MachineLearning {
    features: number[][];
    targets: number[];
    k: number;
    tree: BinaryTree<number[]>;

    /**
     * Aggregates predictions from the k nearest neighbors to
     * each of the features of the testing set.
     * Uses a KD tree
     * @param _k how many neighbors to consider
     */
    constructor(_k: number) {
        super()
        this.k = _k;
        this.features = undefined;
        this.targets = undefined;
        this.tree = undefined;
    }

    fit(features: number[][], targets: number[]): void {
        this.features = features;
        this.targets = targets;

        let inds: number[] = [...new Array(this.features.length).keys()]
        const _tree = this.buildTree(inds);
        if (_tree instanceof BinaryTree<number[]>) {
            this.tree = _tree;
        } else {
            this.tree = new BinaryTree<number[]>(
                inds,
                [],
                (val) => true
            );
        }
    }

    predict(features: number[][]): number[] {
        let preds: number[] = [];
        const m = (ind: number): number => this.targets[ind];
        const r = (a: number, b: number): number => a + b;
        for (const f of features) {
            const inds = this.tree.traverse(f);
            const targs = inds.map(m);
            preds.push(targs.reduce(r, 0) / targs.length);
        }

        return preds;
    }

    /**
     * Builds a tree of inds into this.features and this.targets
     * @param inds the remaining indices
     * @returns the binary tree, or the leaf node
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

    static fromObj(obj: { [key: string]: any }): KNN {
        throw new Error(
            'KNN saving and loading currently not supported due to difficulty of converting functions to strings and back.'
        );
    }

    toObj(): { [key: string]: any } {
        throw new Error(
            'KNN saving and loading currently not supported due to difficulty of converting functions to strings and back.'
        );
    }
}


/**
 * Factory function for a default KNN
 * @returns default K-Nearest Neighbors
 */
 export const knn = (): KNN => {
    return new KNN(8);
}
