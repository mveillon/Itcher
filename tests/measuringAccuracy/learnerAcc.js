const getLearner = require("../../dist/ml/models/getLearner");
const metrics = require("../../dist/ml/metrics");
const trainTest = require("../../dist/ml/trainTest");
const fs = require('fs');

const learnerAcc = async () => {
    const learner = await getLearner.getLearner();
    const [feats, targs] = trainTest.validFeatsTargs();
    const preds = learner.predict(feats);
    const err = metrics.mse(preds, targs);

    console.log(err);
    
    const root = "./tests/measuringAccuracy/"
    const error = (err) => {
        if (err) console.error(err);
    }
    fs.writeFile(root + "targs.txt", targs.join(','), error);
    fs.writeFile(root + "preds.txt", preds.join(','), error);
    // then go to Python for plots
}

learnerAcc();
