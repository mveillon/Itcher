import { MachineLearning } from "./MachineLearning.js";
import { BinaryTree } from "../../utils/BinaryTree.js";
import { randInt } from "../../utils/random.js";
import { readJSON } from "../../utils/files.js";

export class KNN extends MachineLearning {
    features: number[][];
    targets: number[];
    k: number;
    tree: BinaryTree<number[]>;

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
        const _tree = this.buildTree(inds, 0);
        if (_tree instanceof BinaryTree<number[]>) {
            this.tree = _tree;
        } else {
            throw new Error(`Features too small: ${this.features}`);
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
    private buildTree(inds: number[], indents: number): BinaryTree<number[]> | number[] {
        if (inds.length <= this.k) {
            return inds;
        }
        const splitDim = randInt(this.features[0].length);
        inds.sort((a, b) => this.features[a][splitDim] - this.features[b][splitDim]);

        const med = Math.ceil(inds.length / 2);
        let left: number[] = inds.slice(0, med);
        let right: number[] = inds.slice(med, inds.length);
        return new BinaryTree<number[]>(
            this.buildTree(left, indents + 1),
            this.buildTree(right, indents + 1),
            (val: number[]): boolean => val[splitDim] < this.features[inds[med]][splitDim]
        );
    }

    // Doesn't work because of the functions in the binary tree
    static read(path: string): KNN {
        return readJSON(path) as KNN;
    }
}
