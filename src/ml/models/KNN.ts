import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { arange, mean, mode, median } from "../../utils/numJS.js";
import { standardScale } from "../standardScale.js";

export abstract class KNN extends MachineLearning {
    protected _features: number[][];
    protected _targets: number[];
    protected _k: number;
    protected _tree: BinaryTree<number[]>;
    protected _agg: 'mean' | 'mode' | 'median';

    /**
     * Aggregates predictions from the k nearest neighbors to
     * each of the features of the testing set.
     * @param k how many neighbors to consider
     */
    constructor(k: number, agg: 'mean' | 'mode' | 'median' = 'mean') {
        super()
        this._k = k;
        this._agg = agg;
    }

    protected async fitAsync(features: number[][], targets: number[]) {
        features = standardScale(features, false) as number[][];
        this._features = features;
        this._targets = targets;

        let inds: number[] = arange(this._features.length);
        const _tree = this.buildTree(inds);
        if (Array.isArray(_tree)) {
            this._tree = new BinaryTree<number[]>(
                inds,
                [],
                (_) => true
            );
        } else {
            this._tree = _tree;
        }
    }

    predict(features: number[][]): number[] {
        features = standardScale(features, false) as number[][];
        const agg: (arr: number[]) => number = {
            'mean': mean,
            'median': median,
            'mode': mode
        }[this._agg];
        const m = (ind: number): number => this._targets[ind];
        return features.map(f => agg(this._tree.traverse(f).map(m)));
    }

    /**
     * Builds a tree of inds into this.features and this.targets
     * @param inds the remaining indices
     * @returns the binary tree, or the leaf node
     */
    protected abstract buildTree(inds: number[]): BinaryTree<number[]> | number[];
}
