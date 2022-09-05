import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { average } from "../calculations.js"
import { arange } from "../../utils/numJS.js";

export abstract class KNN extends MachineLearning {
    protected _features: number[][];
    protected _targets: number[];
    protected _k: number;
    protected _tree: BinaryTree<number[]>;

    /**
     * Aggregates predictions from the k nearest neighbors to
     * each of the features of the testing set.
     * @param k how many neighbors to consider
     */
    constructor(k: number) {
        super()
        this._k = k;
        this._features = undefined;
        this._targets = undefined;
        this._tree = undefined;
    }

    fit(features: number[][], targets: number[]): void {
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
        let preds: number[] = [];
        const m = (ind: number): number => this._targets[ind];
        for (const f of features) {
            const inds = this._tree.traverse(f);
            const targs = inds.map(m);
            preds.push(average(targs));
        }

        return preds;
    }

    /**
     * Builds a tree of inds into this.features and this.targets
     * @param inds the remaining indices
     * @returns the binary tree, or the leaf node
     */
    protected abstract buildTree(inds: number[]): BinaryTree<number[]> | number[];
        
    static fromObj(obj: { [key: string]: any }): KNN {
        throw new Error(
            'KNN saving and loading currently not supported due to difficulty of serializing functions.'
        );
    }

    toObj(): { [key: string]: any } {
        throw new Error(
            'KNN saving and loading currently not supported due to difficulty of serializing functions.'
        );
    }
}
