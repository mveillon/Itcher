/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

const { trainFeatsTargs, validFeatsTargs } = require("../../../dist/ml/trainTest");

const { alwaysMean } = require("../../../dist/ml/models/AlwaysMean");
const { Ensemble } = require("../../../dist/ml/models/Ensemble");
const { knnBall } = require("../../../dist/ml/models/KNNBall");
const { knnKD } = require("../../../dist/ml/models/KNNkd");
const { neuralNet } = require("../../../dist/ml/models/NeuralNet");
const { regression } = require("../../../dist/ml/models/Regression");

const { writeFile } = require('fs');
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
        'AlwaysMean': alwaysMean,
        'KNNBall': knnBall,
        'KNNkd': knnKD,
        'NeuralNet': neuralNet,
        'Regression': regression,
    }

    let learners = {};
    for (const name in factories) {
        learners[name] = factories[name]();
        learners['Ensemble' + name] = new Ensemble(factories[name], numChildren);
    }

    const [trainFeats, trainTargs] = trainFeatsTargs();
    const [validFeats, validTargs] = validFeatsTargs();  
    const root = "./tests/experiments/measuringAccuracy/";
    const err = (error) => { if (error) console.log(error); };
    writeFile(root + "targs.txt", validTargs.join(','), err);

    for (const learnerName in learners) {
        let learner = learners[learnerName];

        console.log(`Measuring ${learnerName}...\n\tTraining...`);
        await learner.fit(trainFeats, trainTargs);

        console.log(`\tTesting...`);
        const preds = learner.predict(validFeats);
        
        writeFile(
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
