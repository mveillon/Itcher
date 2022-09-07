import { MachineLearning } from "../src/ml/models/MachineLearning";
import { trainFeatsTargs, validFeatsTargs } from "../src/ml/trainTest";
import { mse } from "../src/ml/calculations";

export const defaultTimeout = 2_147_483_647;
export const training = true;

export const [trainFeats, trainTargs] = trainFeatsTargs();
export const [validFeats, validTargs] = validFeatsTargs();

export const checkModel = async (model: MachineLearning) => {
    if (training) {
        await model.fit(trainFeats, trainTargs);
        const preds = model.predict(validFeats);
        const err = mse(preds, validTargs);
        const minReward = -2.5;
        const maxReward = 2.5;
        for (const p of preds) {
            expect(p).toBeGreaterThanOrEqual(minReward);
            expect(p).toBeLessThanOrEqual(maxReward);
        }
        expect(err).toBeLessThan(1);
    }
}