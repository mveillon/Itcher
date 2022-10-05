/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { MachineLearning } from "../src/ml/models/MachineLearning";
import { Ensemble } from "../src/ml/models/Ensemble";
import { KNNBall } from "../src/ml/models/KNNBall";
import { KNNkd } from "../src/ml/models/KNNkd";
import { Regression } from "../src/ml/models/Regression";
import { NeuralNet } from "../src/ml/models/NeuralNet";
import { RegToClf } from "../src/ml/models/RegToClf";
import { numArray, arrGT, toNum } from "../src/utils/numJS";
import { BinaryTree } from "../src/utils/BinaryTree";
import { Sequential } from "@tensorflow/tfjs-node";

export class EnsembleFriend extends Ensemble {
    get models(): MachineLearning[] {
        return this._models;
    }

    set models(val: MachineLearning[]) {
        this._models = val;
    }
}

export class BallFriend extends KNNBall {
    get features(): number[][] {
        return this._features;
    }

    get targets(): number[] {
        return this._targets;
    }

    get k(): number {
        return this._k;
    }

    get tree(): BinaryTree<number[]> {
        return this._tree;
    }
}

export class kdFriend extends KNNkd {
    get features(): number[][] {
        return this._features;
    }

    get targets(): number[] {
        return this._targets;
    }

    get k(): number {
        return this._k;
    }

    get tree(): BinaryTree<number[]> {
        return this._tree;
    }
}

export class RegressionFriend extends Regression {
    get w(): number[] {
        return this._w;
    }

    get degree(): number {
        return this._degree;
    }

    set w(val: number[]) {
        this._w = val;
    }

    set degree(val: number) {
        this._degree = val;
    }

    getZs(features: number[][]): number[][] {
        return this.fillZs(features);
    }

    get fixSingular(): boolean {
        return this._fixSingular;
    }

    set fixSingular(val: boolean) {
        this._fixSingular = val;
    }
}

export class NeuralNetFriend extends NeuralNet {
    get net(): Sequential {
        return this._net;
    }

    set net(val: Sequential) {
        this._net = val;
    }
}

export class RegToClfFriend extends RegToClf {
    eqClasses(features: number[][], targets: number[]): [number[][], number[]] {
        return this.equalClasses(features, targets);
    }

    binarize = (arr: numArray, threshold: number = 0): numArray => {
        return toNum(arrGT(arr, threshold));
    }
}
