const trainTest = require("../../dist/ml/trainTest");

const AlwaysMean = require("../../dist/ml/models/AlwaysMean");
const DecisionTree = require("../../dist/ml/models/DecisionTree");
const Ensemble = require("../../dist/ml/models/Ensemble");
const KNNBall = require("../../dist/ml/models/KNNBall");
const KNNkd = require("../../dist/ml/models/KNNkd");
const NeuralNet = require("../../dist/ml/models/NeuralNet");
const Regression = require("../../dist/ml/models/Regression");

const fs = require('fs');
const { performance } = require('perf_hooks');

/**
 * Saves the predictions of every ML model available. 
 * To run this code with the Python:
 * `> tsc; node tests/measuringAccuracy/learnerAcc.js; python3 tests/measuringAccuracy/learnerAcc.py`
 */
const learnerPreds = async () => {
    const startTime = performance.now();

    const numChildren = 4;

    const learners = {
        'AlwaysMean': AlwaysMean.alwaysMean(),
        // 'DecisionTree': DecisionTree.decisionTree(),
        'KNNBall': KNNBall.knnBall(),
        'KNNkd': KNNkd.knnKD(),
        'NeuralNet': NeuralNet.neuralNet(),
        'Regression': Regression.regression(),

        'EnsembleAlwaysMean': new Ensemble.Ensemble(AlwaysMean.alwaysMean, numChildren),
        // 'EnsembleDecisionTree': new Ensemble.Ensemble(DecisionTree.decisionTree),
        'EnsembleKNNBall': new Ensemble.Ensemble(KNNBall.knnBall, numChildren),
        'EnsembleKNNkd': new Ensemble.Ensemble(KNNkd.knnKD, numChildren),
        'EnsembleNeuralNet': new Ensemble.Ensemble(NeuralNet.neuralNet, numChildren),
        'EnsembleRegression': new Ensemble.Ensemble(Regression.regression, numChildren),
    };

    const [trainFeats, trainTargs] = trainTest.trainFeatsTargs();
    const [validFeats, validTargs] = trainTest.validFeatsTargs();        
    const root = "./tests/measuringAccuracy/";
    const err = (error) => { if (error) console.log(error); };
    fs.writeFile(root + "targs.txt", validTargs.join(','), err);

    for (const learnerName in learners) {
        let learner = learners[learnerName];

        console.log(`Measuring ${learnerName}...\n\tTraining...`);
        await learner.fit(trainFeats, trainTargs);

        console.log(`\tTesting...`);
        const preds = learner.predict(validFeats);
        
        fs.writeFile(
            `${root}preds/${learnerName}_preds.txt`, 
            preds.join(','), 
            err
        );
    }

    const endTime = performance.now();
    console.log(`\nFinished in ${(endTime - startTime) / 1000} seconds\n`);
    // then go to Python for plots
}

learnerPreds();
