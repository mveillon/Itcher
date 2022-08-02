import { readSpreadSheet, sheetRow, dataPaths, pitcherPath, writeJSON } from "../utils/files.js";
import { Pitcher } from "../baseballLogic/Pitcher.js";
import { state } from "../baseballLogic/GameState.js";
import { allPitchers } from "../baseballLogic/Pitcher.js";
import { rewards } from "./rewards.js"
import { dispatch } from "../baseballLogic/dispatch.js";
import { getFeature } from "./mappings.js";
import { usingNode } from "../utils/usingNode.js";
import { MachineLearning } from "./MachineLearning.js";

let idToEvent = new Map<number, string>();
let abToPitcher = new Map<number, number>();
let idToName = new Map<number, string>();
let abToPlat = new Map<number, boolean>();

/**
 * Returns the pitcher of a given at bat
 * @param aid the at bat id
 * @returns the pitcher object
 */
const aidToPitcher = (aid: number): Pitcher => {
    return allPitchers[idToName.get(abToPitcher.get(aid))];
}

const getPlayType = (result: string, event: string): string => {
    result = playTypes[result];
    const outTypes = new Set([
        'Flyout', 
        'Groundout', 
        'Lineout', 
        'Pop Out',
        'Fielders Choice Out',
        'Sac Fly',
        'Field Error',
        'Forceout',
        'Sac Bunt',
        'Fan Interference',
    ]);

    if (result === 'ibb') {
        return 'bb';
    } else if (result === 'b' && state.balls === 3) {
        return 'bb';
    } else if (result === 'k' && state.strikes === 2) {
        return 'kk';
    } else if (
        (result === 'o' || result === 'h') && 
        (event === 'Grounded Into DP' || event.includes('Double Play'))) {
        return 'dp';
    } else if (result === 'h') {
        if (outTypes.has(event)) {
            return 'o';
        } else {
            switch (event) {
                case 'Single':
                    return '1b';
                    break;
                case 'Double':
                    return'2b';
                    break;
                case 'Triple':
                    return '3b';
                    break;
                case 'Home Run':
                    return 'hr';
                    break;
                case 'Fielders Choice':
                    return '1b';
                    break;
                case 'Catcher Interference':
                    return '1b';
                    break;
                default:
                    throw new Error(`Unexpected hit type ${event}`);
                    break;
            }
        }   
    }

    return result;
}

/**
 * Extracts the set of features and the target from one row
 * @param play one row of data
 * @returns the features of that row and the target
 */
export const extractFeaturesTargets = (play: sheetRow): [number[], number] => {
    const aid = parseInt(play['ab_id']);
    let result = play['code'];
    let event = idToEvent.get(aid);
    if (isNaN(aid)) {
        return [[], 0];
    } 
    if (typeof result === 'undefined') {
        throw new Error(`Undefined result with event ${event} and aid ${aid}`);
    }
    if (typeof event === 'undefined') {
        throw new Error(`Undefined event with result ${result} and aid ${aid}`);
    }

    state.pitcher = aidToPitcher(aid);
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
    const pitch = play['pitch_type'];

    result = getPlayType(result, event);
    const target = rewards[result];
    const features = getFeature(pitch);
    
    dispatch(result);
    return [features, target];
}

/**
 * Goes through the data and records all pitchers in it
 */
export const findAllPitchers = () => {
    let names = readSpreadSheet(dataPaths.playerNames);
    for (const player of names) {
        idToName.set(parseInt(player['id']), `${player['first_name']} ${player['last_name']}`);
    }
    names = undefined; // free up memory hopefully

    let abs = readSpreadSheet(dataPaths.atBats);
    let idToHand = new Map<number, string>();
    const allowed = ['R', 'L', 'S'];
    for (const ab of abs) {
        const pid = parseInt(ab['pitcher_id']);
        const aid = parseInt(ab['ab_id']);
        if (isNaN(aid)) continue;
        
        const pHand = ab['p_throws'];
        const hHand = ab['stand'];
        if (!allowed.includes(pHand) || !allowed.includes(hHand)) {
            throw new Error(`Unknown handedness of aid ${aid}. Pitcher: ${pHand}, Hitter: ${hHand}`);
        }

        abToPitcher.set(aid, pid);
        idToHand.set(pid, pHand);
        idToEvent.set(aid, ab['event']);
        abToPlat.set(aid, pHand === 'S' || pHand === hHand);
    }
    abs = undefined;

    let pitches = readSpreadSheet(dataPaths.pitches);
    let pitchers: { [key: string]: Pitcher } = {};
    for (const p of pitches) {
        const pid = abToPitcher.get(parseInt(p['ab_id']));
        const playerName = idToName.get(pid);

        if (!(playerName in pitchers)) {
            pitchers[playerName] = new Pitcher(playerName, idToHand.get(pid));
        }

        const pitchName = pitchAbbreviations[p['pitch_type']];
        if (typeof pitchName !== 'undefined') {
            if (!(pitchName in pitchers[playerName].pitches)) {
                pitchers[playerName].pitches[pitchName] = 0;
            }
            pitchers[playerName].pitches[pitchName]++;
        }
    }
    pitches = undefined;

    for (const player in pitchers) {
        let total = 0;
        for (const p in pitchers[player].pitches) {
            total += pitchers[player].pitches[p];
        }

        for (const p in pitchers[player].pitches) {
            pitchers[player].pitches[p] /= total;
        }
    }

    writeJSON(pitchers, pitcherPath);    
}

/**
 * Trains the learner on the appropriate dataset
 */
export const trainLearner = (learner: MachineLearning) => {
    findAllPitchers();
    const trainData = usingNode() ? dataPaths.train : dataPaths.pitches;
    const allData = readSpreadSheet(trainData);
    let features: number[][] = [];
    let targets: number[] = [];

    for (const row of allData) {
        const [f, t] = extractFeaturesTargets(row);
        if (f.length === 0) continue;
        features.push(f);
        targets.push(t);
    }

    learner.fit(features, targets);
}

/**
 * Returns the mean squared error of learner on the validation set
 * @returns the mse
 */
export const learnerMSE = (learner: MachineLearning): number => {
    const validData = readSpreadSheet(dataPaths.valid);
    let features: number[][] = [];
    let targets: number[] = [];

    for (const row of validData) {
        const [f, t] = extractFeaturesTargets(row);
        if (f.length === 0) continue;
        features.push(f);
        targets.push(t);
    }

    const preds = learner.predict(features);
    let mse = 0;
    for (let i = 0; i < preds.length; i++) {
        mse += Math.pow(preds[i] - targets[i], 2);
    }

    return mse;
}

export const pitchAbbreviations: { [key: string]: string } = {
    CH: 'changeup',
    CU: 'curveball',
    EP: 'eephus',
    FC: 'cutter',
    FF: '4-seam',
    FO: 'pitchout',
    PO: 'pitchout',
    FS: 'splitter',
    FT: '2-seam',
    IN: 'intentional ball',
    KC: 'knuckle-curve',
    KN: 'knuckleball',
    SC: 'screwball',
    SI: 'sinker',
    SL: 'slider',
    UN: 'unknown'
};

const playTypes: { [key: string]: string } = {
    B: 'b',
    '*B': 'b', 
    S: 'k',
    C: 'k',
    F: 'f',
    T: 'k',
    L: 'f', 
    I: 'b',
    W: 'k',
    M: 'k',
    P: 'b',
    Q: 'k',
    R: 'f',
    X: 'o',
    D: 'h',
    E: 'h',
    H: 'bb',
    V: 'ibb',
    O: 'dp',
};
