import { getLearner } from "../src/ml/models/getLearner";
import { learnerMSE } from "../src/ml/trainTest";

test('get learner', () => {
    const [err, preds] = learnerMSE(getLearner());
    console.log(err);
});