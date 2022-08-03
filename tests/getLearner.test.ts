import { getLearner } from "../src/ml/models/getLearner";
import { learnerMSE } from "../src/ml/trainTest";

test('get learner', async () => {
    const [err, preds] = learnerMSE(await getLearner());
    console.log(err);
});