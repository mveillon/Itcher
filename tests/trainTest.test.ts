/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import {
    allFeatsTargs,
    trainLearner,
    learnerMSE,
    extractFeaturesTargets,
    trainFeatsTargs,
    validFeatsTargs,
    testFeatsTargs,
    completeFeatsTargs
} from "../src/ml/trainTest";
import { 
    allClose, 
    sumList, 
    all, 
    arrGT, 
    arrLT, 
    any,
    ndMap,
    transpose
} from "../src/utils/numJS";
import { defaultTimeout } from "./checkModel";
import { readSpreadSheet, dataPaths } from "../src/utils/files";
import { RegressionFriend } from "./friends";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";

test('features and targets', () => {
    const datasets: [number[][], number[]][] = [
        trainFeatsTargs(),
        validFeatsTargs(),
        testFeatsTargs(),
        completeFeatsTargs()
    ];
    const spreadsheet = readSpreadSheet(dataPaths().train + 'raw.ignore.csv');
    const [trainFeats2, trainTargs2] = allFeatsTargs(
        spreadsheet
    );
    expect(any(ndMap(datasets, isNaN))).toBe(false);
    expect(any(ndMap(trainFeats2, isNaN))).toBe(false);
    expect(allClose(datasets[0][0], trainFeats2)).toBe(true);
    expect(allClose(datasets[0][1], trainTargs2)).toBe(true);

    for (const data of datasets) {
        const [feats, targs] = data;
        expect(feats.length).toBe(targs.length);
        const width = feats[0].length;

        for (const row of feats) {
            expect(row.length).toBe(width);
        }
    }

    expect(
        sumList(datasets.slice(0, -1).map(s => s[0].length))
    ).toBe(datasets[datasets.length - 1][0].length);

    const pitchers = readAllPitchers();
    let trainFeats3: number[][] = [];
    let trainTargs3: number[] = []
    for (let row = 0; row < spreadsheet.length; row++) {
        const [f, t] = extractFeaturesTargets(spreadsheet[row], pitchers);
        if (f.length > 0) {
            trainFeats3.push(f);
            trainTargs3.push(t);
        }
    }
    expect(allClose(
        trainFeats3, 
        trainFeats2
    )).toBe(true);
    expect(allClose(trainTargs3, trainTargs2)).toBe(true);
});

jest.setTimeout(defaultTimeout);
test('train learner', async () => {
    const reg = new RegressionFriend(1);
    await trainLearner(reg);
    expect(typeof reg.w).not.toBe('undefined');

    const [err, preds] = learnerMSE(reg);
    expect(err).toBeLessThan(1);
    expect(all(arrGT(preds, -2.5)));
    expect(all(arrLT(preds, 2.5)));
});
