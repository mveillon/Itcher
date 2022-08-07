import { readSpreadSheet, dataPaths, pitcherPath, writeJSON } from "../utils/files.js";
import { Pitch } from "../baseballLogic/Pitch.js";
import { Pitcher } from "../baseballLogic/Pitcher.js";
import { state } from "../baseballLogic/GameState.js";

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
 * @returns the play type as a key into rewards
 */
export const getPlayType = (result: string, event: string): string => {
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
        (event.includes('DP') || event.includes('Double Play'))) {
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
        if (typeof playerName === 'undefined') {
            continue;
        }

        if (!(playerName in pitchers)) {
            pitchers[playerName] = new Pitcher(playerName, idToHand.get(pid));
        }

        const pitchName = pitchAbbreviations[p['pitch_type']];
        if (typeof pitchName !== 'undefined') {
            if (!(pitchName in pitchers[playerName].pitches)) {
                pitchers[playerName].pitches[pitchName] = new Pitch(pitchName);
            }
            const sRate = parseFloat(p['spin_rate']);
            const sDirec = parseFloat(p['spin_dir']);
            if (isNaN(sRate) || isNaN(sDirec)) continue;

            const pitchObj = pitchers[playerName].pitches[pitchName];
            pitchObj.timesThrown += 1;
            pitchObj.spinRate += sRate;
            pitchObj.spinDirection += sDirec;
        }
    }
    pitches = undefined;

    for (const player in pitchers) {
        let total = 0;
        for (const p in pitchers[player].pitches) {
            const pitchO = pitchers[player].pitches[p];
            total += pitchO.timesThrown;
            pitchO.spinRate /= pitchO.timesThrown;
            pitchO.spinDirection /= pitchO.spinDirection;
        }

        for (const p in pitchers[player].pitches) {
            pitchers[player].pitches[p].timesThrown /= total;
        }
    }

    writeJSON(pitcherPath, pitchers);    
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
