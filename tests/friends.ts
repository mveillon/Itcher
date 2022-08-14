import { DecisionTree } from "../src/ml/models/DecisionTree";
import { MachineLearning } from "../src/ml/models/MachineLearning";
import { Ensemble } from "../src/ml/models/Ensemble";
import { KNNBall } from "../src/ml/models/KNNBall";
import { KNNkd } from "../src/ml/models/KNNkd";
import { Regression } from "../src/ml/models/Regression";
import { Matrix } from "../node_modules/ml-matrix/matrix.js";
import { NeuralNet } from "../src/ml/models/NeuralNet";

export class TreeFriend extends DecisionTree {
    get tree() {
        return this._tree;
    }

    get minCV(): number {
        return this._minCV;
    }

    get minBranchSize() {
        return this._minBranchSize;
    }
}

export class EnsembleFriend extends Ensemble {
    get models() {
        return this._models;
    }

    set models(val: MachineLearning[]) {
        this._models = val;
    }

    static fromEnsemble(ens: Ensemble, converter: (ml: { [key: string]: any }) => MachineLearning): EnsembleFriend {
        let res = new EnsembleFriend([]);
        res.models = ens.toObj()['models'].map(converter);
        return res;
    }
}

export class BallFriend extends KNNBall {
    get features() {
        return this._features;
    }

    get targets() {
        return this._targets;
    }

    get k() {
        return this._k;
    }

    get tree() {
        return this._tree;
    }
}

export class kdFriend extends KNNkd {
    get features() {
        return this._features;
    }

    get targets() {
        return this._targets;
    }

    get k() {
        return this._k;
    }

    get tree() {
        return this._tree;
    }
}

export class RegressionFriend extends Regression {
    get w() {
        return this._w;
    }

    get degree() {
        return this._degree;
    }

    set w(val: Matrix) {
        this._w = val;
    }

    set degree(val: number) {
        this._degree = val;
    }

    static fromRegression(reg: Regression): RegressionFriend {
        let res = new RegressionFriend();
        const o = reg.toObj();
        res.w = o['w'];
        res.degree = o['degree'];
        return res;
    }
}

export class NeuralNetFriend extends NeuralNet {
    get net() {
        return this._net;
    }

    set net(val) {
        this._net = val;
    }
}

