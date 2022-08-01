import { weightPath, readJSON, writeJSON } from "../utils/files";
import { numStates, numActions, stateToInd, pitchToInd } from "./mappings";
import { state } from "../baseballLogic/GameState";

export type weightSet = {
    q: number[][], 
    n: number[][]
};

class ReinforcementLearning {
    weights: weightSet;

    static rewards: { [key: string]: number } = {
        k: 0.5,
        kk: 1.46,
        f: 0.44,
        b: -0.4,
        bb: -1.69,
        '1b': -1.89,
        '2b': -2.27,
        '3b': -2.62,
        hr: -3.1,
        dp: 1.5,
        o: 1.0
    };
    static discount = 0.9;

    constructor() {
        this.weights = this.readWeights();
    }

    /**
     * Reads the data from data.json
     * @returns the parsed data
     */
    readWeights(): weightSet {
        return readJSON(weightPath) as weightSet;
    }
    
    /**
     * Saves the weights for later use without having 
     * to train everytime
     */
    saveWeights() {
        writeJSON(this.weights, weightPath);
    }

    /**
     * Resets weights.json to its initial values
     */
    resetWeights() {
        let def: weightSet = {
            q: [],
            n: []
        };

        for (let row = 0; row < numStates; row++) {
            let qRow = [];
            let nRow = [];
            for (let col = 0; col < numActions; col++) {
                qRow.push(1);
                nRow.push(0);
            }
            def.q.push(qRow);
            def.n.push(nRow);
        }

        writeJSON(def, weightPath);
        this.weights = this.readWeights();
    }

    /**
     * Updates data.json and the global state based on the given result
     * @param pitch what pitch was thrown
     * @param result the result of the pitch
     */
    trainWeights(pitch: string, result: string) {
        if (!(result in ReinforcementLearning.rewards)) {
            throw new Error(`Unknown result ${result}`);
        }
        const oldState = stateToInd(state);
        this.dispatch(result);
        const observation = stateToInd(state);
        const action = pitchToInd[pitch];

        this.weights.n[oldState][action] = Math.max(
            this.weights.n[oldState][action] + 1, 
            1
        );
        this.weights.q[oldState][action] += (
            (
                ReinforcementLearning.rewards[result] -
                this.weights.q[oldState][action] + 
                ReinforcementLearning.discount *
                Math.max(...this.weights.q[observation])
            ) /
            this.weights.n[oldState][action]
        );
    }

    /**
     * Updates state based on the result
     * @param result a string representation of what happened
     */
    dispatch(result: string) {
        switch (result) {
            case 'k':
                state.strike();
                break;
            case 'kk':
                state.backup();
                state.strikeout();
                break;
            case 'f':
                state.foul();
                break;
            case 'b':
                state.ball();
                break;
            case 'bb':
                state.backup();
                state.walk();
                break;
            case '1b':
                state.single();
                break;
            case '2b':
                state.double();
                break;
            case '3b':
                state.triple();
                break;
            case 'hr':
                state.homeRun();
                break;
            case 'dp':
                state.doublePlay();
                break;
            case 'o':
                state.out();
                break;
            default:
                state.undo();
                throw new Error(`Unexpected result ${result}`);
                break;
        }
    }
}

export const learner = new ReinforcementLearning();

