import { learner } from "./ReinforcementLearning";
import { readSpreadSheet, sheetRow, dataPaths, writeJSON, pitcherPath } from "../utils/files";
import { Pitcher } from "../baseballLogic/Pitcher";
import { state } from "../baseballLogic/GameState";
import { allPitchers } from "../baseballLogic/Pitcher";

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

/**
 * Parses one play (row) and updates the weights accordingly
 * @param play the play to review
 */
const parsePlay = (play: sheetRow) => {
    const aid = parseInt(play['ab_id']);
    if (typeof aid === 'undefined' || isNaN(aid)) return;

    let result = playTypes[play['code']];
    const event = idToEvent.get(aid);
    if (typeof event === 'undefined') {
        throw new Error(`Unidentified ab_id ${aid}`);
    }

    if (typeof result === 'undefined') {
        throw new Error(
            `Unknown result type with at bat ${aid}, event ${event}, and code ${play['code']}`
        );
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
        return;
    } else if (result === 'b' && state.balls === 3) {
        result = 'bb';
    } else if (result === 'k' && state.strikes === 2) {
        result = 'kk';
    } else if (
        (result === 'o' || result === 'h') && 
        (event === 'Grounded Into DP' || event.includes('Double Play'))) {
        result = 'dp';
    } else if (result === 'h') {
        if (outTypes.has(event)) {
            result = 'o';
        } else {
            switch (event) {
                case 'Single':
                    result = '1b';
                    break;
                case 'Double':
                    result = '2b';
                    break;
                case 'Triple':
                    result = '3b';
                    break;
                case 'Home Run':
                    result = 'hr';
                    break;
                case 'Fielders Choice':
                    result = '1b';
                    break;
                case 'Catcher Interference':
                    result = '1b';
                    break;
                default:
                    throw new Error(`Unexpected hit type ${event} with at bat ${aid}`);
                    break;
            }
        }   
    }

    learner.trainWeights(
        pitchAbbreviations[play['pitch_type']],
        result
    );
}

/**
 * Trains the model based on all pitches in the dataset
 */
export const trainAllPitches = () => {
    const pitches = readSpreadSheet(dataPaths.pitches);
    for (const row of pitches) {
        parsePlay(row);
    }
    learner.saveWeights();
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

    writeJSON(pitchers, pitcherPath);    
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
