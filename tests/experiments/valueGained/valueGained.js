const { nextPitch } = require("../../../dist/ml/nextPitch");
const { getLearner } = require("../../../dist/ml/models/getLearner");
const { getState, setState } = require("../../../dist/baseballLogic/GameState");
const { extractFeaturesTargets, completeFeatsTargs } = require("../../../dist/ml/trainTest");
const { dataPaths, readSpreadSheet, writeFile } = require("../../../dist/utils/files");
const { readAllPitchers } = require("../../../dist/baseballLogic/Pitcher");
const { aidToPitcher } = require("../../../dist/ml/parseData");
const { getFeature } = require("../../../dist/ml/mappings");
const { colAverage } = require("../../../dist/utils/arrayOps");
const { Pitcher } = require("../../../dist/baseballLogic/Pitcher");

/**
 * Updates the global game state based on the feature row
 * @param {number[]} feat the feature row as produced from pitchFeature
 * @param {Pitcher} pitcher the current pitcher
 */
const updateState = (feat, pitcher) => {
    let s = getState();
    s.balls = feat[0];
    s.strikes = feat[1];
    s.lineup[0] = feat[2] ? pitcher.hand : 'Z';
    s.bases = feat.slice(3, 6);
    s.outs = feat[6];
    s.pitcher = pitcher;
    setState(s);
}

let learner;
console.log('Finding pitchers...');
const pitchers = readAllPitchers();
console.log('Pitchers found!\n');

let avgGood = 0;
let avgBad = 0;

/**
 * Figures out what the average wOBA for a good event is
 * and that of a bad event and saves them to avgGood and avgBad
 */
const setAvgs = () => {
    const [feats, targs] = completeFeatsTargs();
    let nums = [0, 0];
    let denoms = [0, 0];
    for (const t of targs) {
        const ind = +(t > 0);
        nums[ind] += t;
        denoms[ind]++;
    }
    avgBad = nums[0] / denoms[0];
    avgGood = nums[1] / denoms[1];
}

/**
 * Returns the wOBA added of the actual pitch, the pitch selected
 * by nextPitch, and the theoretically optimal pitch to throw
 * @param {{[key: string]: string}} row one row from the spreadsheet
 * @returns {[number, number, number]} the wOBA added
 */
const getValue = (row) => {
    const currentPitcher = aidToPitcher(parseInt(row['ab_id']), pitchers);
    const [feat, actual] = extractFeaturesTargets(row, pitchers);
    if (feat.length === 0) {
        return [];
    }
    updateState(feat, currentPitcher);
    const pitches = Object.keys(currentPitcher.pitches);
    let allFeats = [];
    const state = getState();
    for (const p of pitches) {
        allFeats.push(getFeature(p, state));
    }
    const preds = learner.predict(allFeats);

    const toWoba = prob => avgGood * prob + avgBad * (1 - prob);

    const selected = toWoba(preds[pitches.indexOf(nextPitch(learner))]);
    const optimal = toWoba(Math.max(...preds));

    return [actual, selected, optimal];
}

/**
 * Goes through every pitch and finds the difference in wOBA between them
 */
const allValues = async () => {
    console.log('Training learner...');
    learner = await getLearner();
    console.log('Learner trained!\n\nSetting averages...');

    setAvgs();
    console.log('Averages set!\n\nReading spreadsheet...');

    const dPaths = dataPaths();
    const fName = '/raw.ignore.csv';
    const paths = [
        dPaths.train + fName,
        dPaths.valid + fName,
        dPaths.test + fName
    ];

    const sheet = readSpreadSheet(paths[0]);
    console.log('Spreadsheet read!\n\nProcessing spreadsheet...');

    const res = sheet.map(getValue).filter(l => l.length > 0);
    const avgs = colAverage(res);
    console.log('Spreadsheet processed!');

    writeFile(
        './tests/experiments/valueGained/valueGained.txt',
`Average wOBA of good event: ${avgGood}
Average wOBA of bad event: ${avgBad}

Average wOBA of actual pitch: ${avgs[0]}
Average wOBA of selected pitch: ${avgs[1]}
Average wOBA of optimal pitch: ${avgs[2]}`
    );
}

allValues();
