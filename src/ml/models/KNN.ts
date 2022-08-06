import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { average } from "../metrics.js"

export abstract class KNN extends MachineLearning {
    features: number[][];
    targets: number[];
    k: number;
    tree: BinaryTree<number[]>;

    /**
     * Aggregates predictions from the k nearest neighbors to
     * each of the features of the testing set.
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
        for (const f of features) {
            const inds = this.tree.traverse(f);
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
