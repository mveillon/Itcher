import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { arange, mean, mode, median } from "../../utils/numJS.js";

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
        this._features = features;
        this._targets = targets;

        let inds: number[] = arange(this._features.length);
        const _tree = this.buildTree(inds);
        if (_tree instanceof BinaryTree<number[]>) {
            this._tree = _tree;
        } else {
            this._tree = new BinaryTree<number[]>(
                inds,
                [],
                (val) => true
            );
        }
    }

    predict(features: number[][]): number[] {
        let preds: number[][] = [];
        const m = (ind: number): number => this._targets[ind];
        for (const f of features) {
            preds.push(this._tree.traverse(f).map(m));
        }

        const aggs: { [key: string]: (arr: number[]) => number } = {
            'mean': mean,
            'median': median,
            'mode': mode
        };

        return preds.map(aggs[this._agg]);
    }

    /**
     * Builds a tree of inds into this.features and this.targets
     * @param inds the remaining indices
     * @returns the binary tree, or the leaf node
     */
    protected abstract buildTree(inds: number[]): BinaryTree<number[]> | number[];
}
