import { aidToPitcher, getPlayType, abToPlat, idToEvent } from "./parseData.js";
import { MachineLearning } from "./models/MachineLearning.js";
import { readAllPitchers, Pitcher } from "../baseballLogic/Pitcher.js";
import { dataPaths, readSpreadSheet, sheet, sheetRow } from "../utils/files.js";
import { GameState } from "../baseballLogic/GameState.js";
import { rewards } from "./rewards.js";
import { pitchFeature, oneHotHeatmap } from "./mappings.js";
import { mse } from "./calculations.js";
import { heatmapSize } from "../baseballLogic/Pitch.js";

/**
 * Splits the spreadsheet into features and targets
 * @param data the read spreadsheet
 * @returns the features of data and the targets
 */
const allFeatsTargs = (data: sheet): [number[][], number[]] => {
    const allPitchers = readAllPitchers();
    let features: number[][] = [];
    let targets: number[] = [];
    for (const row of data) {
        const [f, t] = extractFeaturesTargets(row, allPitchers);
        if (f.length > 0) {
            features.push(f);
            targets.push(t);
        }
    }

    return [features, targets];
}

/**
 * Trains the learner on the appropriate dataset
 */
 export const trainLearner = async (learner: MachineLearning) => {
    // const trainData = usingNode() ? dataPaths.train : dataPaths.pitches;
    const trainData = dataPaths().train;
    const allData = readSpreadSheet(trainData);
    const [features, targets] = allFeatsTargs(allData);

    await learner.fit(features, targets);
}

/**
 * Returns the mean squared error and the predictions of learner on the validation set
 * @returns the mse
 */
export const learnerMSE = (learner: MachineLearning): [number, number[]] => {
    const validData = readSpreadSheet(dataPaths().valid);
    const [features, targets] = allFeatsTargs(validData);
    
    const preds = learner.predict(features);
    return [mse(preds, targets), preds];
}

/**
 * Extracts the set of features and the target from one row
 * @param play one row of data
 * @returns the features of that row and the target
 */
export const extractFeaturesTargets = (
    play: sheetRow, 
    allPitchers: { [key: string]: Pitcher }
    ): [number[], number] => {

    const aid = parseInt(play['ab_id']);
    let result = play['code'];
    let event = idToEvent.get(aid);    
    const x = parseFloat(play['px']);
    const z = parseFloat(play['pz']);   

    if (
        isNaN(aid) || 
        result === '' ||
        isNaN(x) || 
        isNaN(z)
    ) {
        return [[], 0];
    } 
    if (typeof result === 'undefined') {
        throw new Error(`Undefined result with event ${event} and aid ${aid}`);
    }
    if (typeof event === 'undefined') {
        throw new Error(`Undefined event with result ${result} and aid ${aid}`);
    }
    
    let state = new GameState();
    state.pitcher = aidToPitcher(aid, allPitchers); 
    if (typeof state.pitcher === 'undefined') {
        return [[], 0];
    }

    state.bases = [
        !!parseInt(play['on_1b']),
        !!parseInt(play['on_2b']),
        !!parseInt(play['on_3b'])
    ];
    state.lineSpot = 0;
    if (abToPlat.get(aid)) {
        state.lineup = [state.pitcher.hand];
    } else {
        state.lineup = ['Z'];
    }
    state.balls = parseInt(play['b_count']);
    state.strikes = parseInt(play['s_count']);
    state.outs = parseInt(play['outs']);

    result = getPlayType(result, event, state);
    const target = rewards(result, state);
    const features = pitchFeature(
        state,
        parseFloat(play['start_speed']),
        parseFloat(play['spin_rate']),
        parseFloat(play['spin_dir']),
        oneHotHeatmap(
            x,
            z, 
            heatmapSize()
        )
    );
    
    return [features, target];
}

/**
 * Returns all the features and targets for validating an ML model
 * @returns the features and the targets from 'valid.csv'
 */
export const validFeatsTargs = (): [number[][], number[]] => {
    return allFeatsTargs(readSpreadSheet(dataPaths().valid));
}

/**
 * Returns all the features and targets for training an ML model
 * @returns the features and targets from 'train.csv'
 */
export const trainFeatsTargs = (): [number[][], number[]] => {
    return allFeatsTargs(readSpreadSheet(dataPaths().train));
}
