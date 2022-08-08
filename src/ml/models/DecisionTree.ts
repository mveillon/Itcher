import { BinaryTree } from "../../utils/BinaryTree.js";
import { MachineLearning } from "./MachineLearning.js";
import { avgVar, variance, average } from "../calculations.js";
import { upTo } from "../../utils/utilities.js";

export class DecisionTree extends MachineLearning {
    protected _tree: BinaryTree<number[]>;
    protected _minCV: number;
    protected _minBranchSize: number;

    /**
     * A decision tree that splits each feature based on a selected attribute
     * @param minCV the minimum coefficient of variance to use before 
     * stopping splitting
     * @param minBranchSize the minimum length of features in each branch.
     * In practice this will end up equaling:
     * `max(_minBranchSize, log2(trainTargs.length) / trainFeatures[0].length)`
     */
    constructor(minCV: number = 0.1, minBranchSize: number = 8) {
        super();
        this._tree = undefined;
        this._minCV = minCV;
        this._minBranchSize = minBranchSize;
    }

    fit(features: number[][], targets: number[]): void {
        if (features.length === 0) return;

        const tempTree = this.buildTree(
            features, 
            targets, 
            new Set<number>(upTo(features[0].length)),
        );

        if (tempTree instanceof BinaryTree) {
            this._tree = tempTree;
        } else {
            this._tree = new BinaryTree<number[]>(
                targets,
                [],
                (arr) => true
            );
        }
    }

    predict(features: number[][]): number[] {
        let res: number[] = [];
        for (const f of features) {
            const leaf = this._tree.traverse(f);
            res.push(average(leaf));
        }

        return res;
    }

    /**
     * Recursively builds the decision tree
     * @param features the independent variables
     * @param targets the dependent variables
     * @param remainingAttrs indices of usable attributes to split on
     */
    private buildTree(
        features: number[][], 
        targets: number[], 
        remainingAttrs: Set<number>,
    ): BinaryTree<number[]> | number[] {
        if (
            this.cv(targets) < this._minCV || 
            features.length <= this._minBranchSize ||
            remainingAttrs.size === 0
        ) {
            return targets;
        }

        const getter = (i: number): number => targets[i];
        let bestVar = Infinity;
        let bestFunc: splitFunc;
        let bestI: number;

        for (const i of remainingAttrs) {
            let inds = upTo(features.length);
            inds.sort((a, b) => features[a][i] - features[b][i]);
            const med = features[inds[Math.floor(inds.length / 2)]][i];

            const funcs: splitFunc[] = [
                (arr) => arr[i] < med
            ];
            if (Number.isInteger(features[0][i])) {
                funcs.push(arr => arr[i] === med);
            }

            for (const f of funcs) {
                const [left, right] = this.split(features, f);
                const leftVar = variance(left.map(getter));
                const rightVar = variance(right.map(getter));
                const total = leftVar + rightVar;
                if (total < bestVar) {
                    bestVar = total;
                    bestFunc = f;
                    bestI = i;
                }
            }
        }

        const [left, right] = this.split(features, bestFunc);
        let leftFeats: number[][] = [];
        let rightFeats: number[][] = [];
        let leftTargs: number[] = [];
        let rightTargs: number[] = [];
        for (const l of left) {
            leftFeats.push(features[l]);
            leftTargs.push(targets[l]);
        }
        for (const r of right) {
            rightFeats.push(features[r]);
            rightTargs.push(targets[r]);
        }

        let newAttrs = new Set<number>(remainingAttrs);
        newAttrs.delete(bestI);
        return new BinaryTree<number[]>(
            this.buildTree(leftFeats, leftTargs, newAttrs),
            this.buildTree(rightFeats, rightTargs, newAttrs),
            bestFunc
        );
    }

    /**
     * Splits the features into groups based on criterion
     * @param features the features to split
     * @param criterion how to split them
     * @returns the left and right splits, each an array of indices into features
     */
    private split(features: number[][], criterion: splitFunc): [number[], number[]] {
        let res: [number[], number[]] = [[], []];
        for (let i = 0; i < features.length; i++) {
            res[+(!criterion(features[i]))].push(i);
        }
        return res;
    }

    /**
     * Returns the coefficient of variation of targets
     * @param targets the array to measure
     * @returns the CV of targets
     */
    private cv(targets: number[]): number {
        const [mean, variance] = avgVar(targets);
        const stdDev = Math.sqrt(variance);
        if (mean === 0) return stdDev;
        return stdDev / mean;
    }

    static fromObj(obj: { [key: string]: any; }): MachineLearning {
        throw new Error(
            `Saving and loading Decision Trees not supported due to 
            difficulty with serializing functions`
        );
    }

    toObj(): { [key: string]: any; } {
        throw new Error(
            `Saving and loading Decision Trees not supported due to 
            difficulty with serializing functions`
        );
    }
}

type splitFunc = (arr: number[]) => boolean;

/**
 * Factory function for a default DecisionTree
 * @returns default decision tree
 */
export const decisionTree = (): DecisionTree => {
    return new DecisionTree();
}
