import { learner } from "./ReinforcementLearning";
import { readSpreadSheet, sheetRow, dataPaths, writeJSON, pitcherPath } from "../utils/files";
import { Pitcher } from "../baseballLogic/Pitcher";

/**
 * Parses one play (row) and updates the weights accordingly
 * @param play the play to review
 */
const parsePlay = (play: sheetRow) => {
    
}

/**
 * Trains the model based on all pitches in the dataset
 */
export const trainAllPitches = () => {

}

/**
 * Goes through the data and records all pitchers in it
 */
export const findAllPitchers = () => {
    let names = readSpreadSheet(dataPaths.playerNames);
    let idToName = new Map<number, string>();
    for (const player of names) {
        idToName.set(parseInt(player['id']), `${player['first_name']} ${player['last_name']}`);
    }
    names = undefined; // free up memory hopefully

    let abs = readSpreadSheet(dataPaths.atBats);
    let abToPitcher = new Map<number, number>();
    let idToHand = new Map<number, string>();
    for (const ab of abs) {
        const pid = parseInt(ab['pitcher_id']);
        abToPitcher.set(parseInt(ab['ab_id']), pid);
        idToHand.set(pid, ab['p_throw']);
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
    H: 'bb'
};
