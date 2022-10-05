/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { readSpreadSheet, dataPaths, pitcherPath, writeJSON, readJSON } from "../utils/files.js";
import { Pitch, heatmapSize } from "../baseballLogic/Pitch.js";
import { Pitcher, pitcherJSON } from "../baseballLogic/Pitcher.js";
import { GameState } from "../baseballLogic/GameState.js";
import { usingNode } from "../utils/usingNode.js";
import { oneHotHeatmap } from "./mappings.js";
import { addArrays, scalarMul, any } from "../utils/numJS.js";

export let idToEvent = new Map<number, string>();
export let abToPlat = new Map<number, boolean>();
let abToPitcher = new Map<number, number>();
let idToName = new Map<number, string>();

/**
 * Returns the pitcher of a given at bat
 * @param aid the at bat id
 * @returns the pitcher object
 */
export const aidToPitcher = (aid: number, allPitchers: { [key: string]: Pitcher }): Pitcher => {
    return allPitchers[idToName.get(abToPitcher.get(aid))];
}

/**
 * Returns a key into rewards based on the play type
 * @param result the result from the pitches sheet
 * @param event the event from the at bat spreadsheet
 * @param state the current game state
 * @returns the play type as a key into rewards
 */
export const getPlayType = (result: string, event: string, state: GameState): string => {
    const pTypes = playTypes();
    if (!(result in pTypes)) {
        throw new Error(`Unexpected result: ${result}`);
    }

    result = pTypes[result];
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
        'Batter Interference',
    ]);

    if (result === 'ibb') {
        return 'bb';
    } else if (result === 'b' && state.balls === 3) {
        return 'bb';
    } else if (result === 'k' && state.strikes === 2) {
        return 'kk';
    } else if (
        (result === 'o' || result === 'h') && 
        (event.includes('DP') || event.includes('Double Play'))) {
        return 'dp';
    } else if (result === 'h') {
        if (outTypes.has(event)) {
            return 'o';
        } else {
            switch (event) {
                case 'Single':
                    return '1b';
                case 'Double':
                    return'2b';
                case 'Triple':
                    return '3b';
                case 'Home Run':
                    return 'hr';
                case 'Fielders Choice':
                    return '1b';
                case 'Catcher Interference':
                    return '1b';
                default:
                    throw new Error(`Unexpected hit type ${event}`);
            }
        }   
    }

    return result;
}

/**
 * Goes through the train, validation, and testing sets and finds all pitchers present
 */
export const findAllPitchers = ()  => {
    if (usingNode()) {
        let accum: { [key: string]: Pitcher } = {}; 
        const dPaths = dataPaths();
        const rawName = 'raw.ignore.csv';
        const paths = [
            dPaths.train + rawName,
            dPaths.valid + rawName,
            dPaths.test + rawName
        ];

        for (const pth of paths) {
            pitchersInSheet(pth, accum);
        }
        
        for (const player in accum) {
            let total = 0;
            for (const p in accum[player].pitches) {
                const pitchO = accum[player].pitches[p];
                total += pitchO.timesThrown;
                pitchO.velo /= pitchO.timesThrown;
                pitchO.spinRate /= pitchO.timesThrown;
                pitchO.spinDirection /= pitchO.timesThrown;
                pitchO.heatmap = scalarMul(pitchO.heatmap, 1 / pitchO.timesThrown) as number[][];
            }

            for (const p in accum[player].pitches) {
                accum[player].pitches[p].timesThrown /= total;
            }
        }

        let toWrite: { [key: string]: pitcherJSON } = {};
        for (const p in accum) {
            toWrite[p] = accum[p].toObj();
        }

        writeJSON(pitcherPath(), toWrite);
    } else {
        localStorage.setItem(
            'pitchers.json', 
            JSON.stringify(readJSON(pitcherPath()))
        )
    }
}

/**
 * Goes through the data at path and records all pitchers in it
 * @param path where to find the spreadsheet of all pitches to read
 * @param pitchers the JSONs read thus far. This will be updated by the function
 */
const pitchersInSheet = (path: string, pitchers: { [key: string]: Pitcher }) => {
    const dPaths = dataPaths();
    let names = readSpreadSheet(dPaths.playerNames);
    for (const player of names) {
        idToName.set(parseInt(player['id']), `${player['first_name']} ${player['last_name']}`);
    }
    names = undefined; // free up memory hopefully

    let abs = readSpreadSheet(dPaths.atBats);
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

    let pitches = readSpreadSheet(path);
    const abbrs = pitchAbbreviations();
    for (const p of pitches) {
        const pid = abToPitcher.get(parseInt(p['ab_id']));
        const playerName = idToName.get(pid);
        if (typeof playerName === 'undefined') {
            continue;
        }

        if (!(playerName in pitchers)) {
            pitchers[playerName] = new Pitcher(playerName, idToHand.get(pid));
        }

        const pitchName = abbrs[p['pitch_type']];
        if (typeof pitchName !== 'undefined') {
            if (!(pitchName in pitchers[playerName].pitches)) {
                pitchers[playerName].pitches[pitchName] =  new Pitch(pitchName);
            }
            const sRate = parseFloat(p['spin_rate']);
            const sDirec = parseFloat(p['spin_dir']);
            const velo = parseFloat(p['start_speed']);
            const x = parseFloat(p['px']);
            const z = parseFloat(p['pz']);
            if (any([sRate, sDirec, velo, x, z].map(isNaN))) continue;

            const pitchObj = pitchers[playerName].pitches[pitchName];
            pitchObj.timesThrown += 1;
            pitchObj.velo += velo;
            pitchObj.spinRate += sRate;
            pitchObj.spinDirection += sDirec;
            pitchObj.heatmap = addArrays(pitchObj.heatmap, oneHotHeatmap(
                x,
                z,
                heatmapSize()
            )) as number[][];
        }
    }
}

/**
 * Maps the pitch abbreviations found in the spreadsheets into a full pitch name
 * @returns a mapping from abbreviation to pitch name
 */
export const pitchAbbreviations = (): { [key: string]: string } => {
    return {
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
};

/**
 * Returns a mapping from the play abbreviations the spreadsheet uses to play types
 * used by dispatch
 * @returns a mapping from spreadsheet abbreviations to ones used by this code
 */
export const playTypes = (): { [key: string]: string } => {
    return {
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
}
