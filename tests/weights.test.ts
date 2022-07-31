import { learner } from "../src/ml/ReinforcementLearning";
import { stateToInd, pitchToInd, numStates, numActions } from "../src/ml/mappings";
import { state } from "../src/baseballLogic/GameState";

test('weight shapes', () => {
    learner.resetWeights();

    expect(learner.weights.q.length).toBe(numStates);
    expect(learner.weights.n.length).toBe(numStates);

    for (let r = 0; r < learner.weights.q.length; r++) {
        for (let c = 0; c < learner.weights.q[r].length; c++) {
            expect(learner.weights.q[r].length).toBe(numActions);
            expect(learner.weights.n[r].length).toBe(numActions);
            expect(learner.weights.q[r][c]).toBe(1);
            expect(learner.weights.n[r][c]).toBe(0);
        }
    }
});

test('training', () => {
    learner.resetWeights();

    let row = stateToInd(state);
    learner.trainWeights('4-seam', 'k');
    let col = pitchToInd['4-seam'];
    expect(learner.weights.q[row][col]).toBeGreaterThan(1);
    expect(learner.weights.n[row][col]).toBe(1);

    row = stateToInd(state);
    learner.trainWeights('4-seam', 'kk');
    expect(learner.weights.q[row][col]).toBeGreaterThan(1);
    expect(learner.weights.n[row][col]).toBe(1);

    state.strike();
    row = stateToInd(state);
    col = pitchToInd['2-seam'];
    learner.trainWeights('2-seam', 'b');
    expect(learner.weights.q[row][col]).toBeLessThan(1);
    expect(learner.weights.n[row][col]).toBe(1);

    learner.resetWeights();
});