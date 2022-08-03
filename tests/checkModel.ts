import { MachineLearning } from "../src/ml/models/MachineLearning";
import { trainLearner, learnerMSE } from "../src/ml/trainTest";

export const checkModel = (model: MachineLearning) => {
    trainLearner(model);
    const [err, preds] = learnerMSE(model);
    const minReward = -2;
    const maxReward = 2;
    for (const p of preds) {
        expect(p).toBeGreaterThanOrEqual(minReward);
        expect(p).toBeLessThanOrEqual(maxReward);
    }
    expect(err).toBeLessThan(1);
}