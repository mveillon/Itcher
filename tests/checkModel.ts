import { MachineLearning } from "../src/ml/models/MachineLearning";
import { trainLearner, learnerMSE } from "../src/ml/trainTest";

export const defaultTimeout = 2_147_483_647;
export const training = true;

export const checkModel = async (model: MachineLearning) => {
    if (training) {
        await trainLearner(model);
        const [err, preds] = learnerMSE(model);
        const minReward = -2.5;
        const maxReward = 2.5;
        for (const p of preds) {
            expect(p).toBeGreaterThanOrEqual(minReward);
            expect(p).toBeLessThanOrEqual(maxReward);
        }
        expect(err).toBeLessThan(1);
    }
}