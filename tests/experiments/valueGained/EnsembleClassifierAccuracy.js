const { EnsembleClassifier } = require("../../../dist/ml/models/EnsembleClassifier");
const { Regression } = require("../../../dist/ml/models/Regression");
// const { KNNBall } = require("../../../dist/ml/models/KNNBall");
const { trainFeatsTargs, validFeatsTargs } = require("../../../dist/ml/trainTest");
const { ensembleChildren } = require("../../../dist/ml/models/getLearner");
const { arrEqual, sumList, arrGT, toNum } = require("../../../dist/utils/numJS");
const { writeFile } = require("../../../dist/utils/files");

class EnsembleClassifierFriend extends EnsembleClassifier {
    get models() {
        return this._models;
    }

    set models(val) {
        this._models = val; 
    }
}

/**
 * Finds the average accuracy of each child model of the ensemble classifier
 * @returns the average accuracy of the child models
 */
const getAccuracy = () => {
    const learner = new EnsembleClassifierFriend(
        () => new Regression(2), 
        ensembleChildren
    );
    console.log('Starting training...');
    learner.fit(...trainFeatsTargs());
    console.log('Training complete!\n\nStarting predicting...');

    const [validFeats, validTargs] = validFeatsTargs();
    const bin = toNum(arrGT(validTargs, 0));
    let dots = 0;
    const numDots = 20;
    const perDot = Math.round(learner.models.length / numDots);
    const numCorrect = learner.models.reduce(
        (total, m, ind) => {
            if (ind % perDot === 0) {
                process.stdout.write(
                    `\rProgress: [${'.'.repeat(dots)}${' '.repeat(numDots - dots++)}]`
                );
            }
            return (
                total + 
                sumList(toNum(arrEqual(bin, m.predict(validFeats))))
            );
        },
        0
    );

    console.log('\nPredicting complete!');

    return numCorrect / (learner.models.length * bin.length);
}

const writeAccuracy = () => {
    const acc = getAccuracy();
    writeFile(
        "tests/experiments/valueGained/accuracy.txt",
        `Average classifier accuracy: ${acc}`
    );
}

writeAccuracy();

