const trainTest = require("../../../dist/ml/trainTest");
const mappings = require("../../../dist/ml/mappings");

const AlwaysMean = require("../../../dist/ml/models/AlwaysMean");
const Ensemble = require("../../../dist/ml/models/Ensemble");
const KNNBall = require("../../../dist/ml/models/KNNBall");
const KNNkd = require("../../../dist/ml/models/KNNkd");
const InteractionRegression = require("../../../dist/ml/models/InteractionRegression");
const NeuralNet = require("../../../dist/ml/models/NeuralNet");
const RandomForest = require("../../../dist/ml/models/RandomForest");
const Regression = require("../../../dist/ml/models/Regression");
const UpdatingPriors = require("../../../dist/ml/models/UpdatingPriors");

const fs = require('fs');
const { performance } = require('perf_hooks');

/**
 * Saves the predictions of every ML model available. 
 * `js plot-models` will run this and the python using the
 * script in `package.json`
 */
const learnerPreds = async () => {
    const startTime = performance.now();

    const numChildren = 4;

    const factories = {
        'AlwaysMean': AlwaysMean.alwaysMean,
        'KNNBall': KNNBall.knnBall,
        'KNNkd': KNNkd.knnKD,
        'InteractionRegression': InteractionRegression.interactionRegression,
        'NeuralNet': NeuralNet.neuralNet,
        'RandomForest': RandomForest.randomForest,
        'Regression': Regression.regression,
    }

    let learners = {};
    for (const name in factories) {
        learners[name] = factories[name]();
        learners['Ensemble' + name] = new Ensemble.Ensemble(factories[name], numChildren);
        learners['UP' + name] = new UpdatingPriors.UpdatingPriors(factories[name]);
    }
    learners['UPNeuralNet'] = new UpdatingPriors.UpdatingPriors(
        () => NeuralNet.neuralNet(mappings.numAttributes() - mappings.stateAttrs())
    );
    delete learners['UPRandomForest'];

    const [trainFeats, trainTargs] = trainTest.trainFeatsTargs();
    const [validFeats, validTargs] = trainTest.validFeatsTargs();  
    const root = "./tests/experiments/measuringAccuracy/";
    const err = (error) => { if (error) console.log(error); };
    fs.writeFile(root + "targs.txt", validTargs.join(','), err);

    for (const learnerName in learners) {
        let learner = learners[learnerName];

        console.log(`Measuring ${learnerName}...\n\tTraining...`);
        await learner.fit(trainFeats, trainTargs);

        console.log(`\tTesting...`);
        const preds = learner.predict(validFeats);
        
        fs.writeFile(
            `${root}preds/${learnerName}.txt`, 
            preds.join(','), 
            err
        );
    }

    const endTime = performance.now();
    console.log(`\nFinished in ${(endTime - startTime) / 60_000} minutes\n`);
    // then go to Python for plots
}

learnerPreds();
