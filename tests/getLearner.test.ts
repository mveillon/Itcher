import { getLearner } from "../src/ml/models/getLearner";
import { learnerMSE } from "../src/ml/trainTest";
import { defaultTimeout } from "./checkModel";

jest.setTimeout(defaultTimeout)
test('get learner', async () => {
    const [err, preds] = learnerMSE(await getLearner());
    console.log(err);
});