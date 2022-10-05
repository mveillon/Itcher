/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { 
    pitchAbbreviations,
    aidToPitcher,
    getPlayType,
    playTypes
} from "../src/ml/parseData";
import { allPitchTypes } from "../src/utils/utilities";
import { readAllPitchers } from "../src/baseballLogic/Pitcher";
import { getState } from "../src/baseballLogic/GameState";
import { dispatch } from "../src/baseballLogic/dispatch";

test('pitch types', () => {
    const pitchTypes = allPitchTypes();
    const abbrs = pitchAbbreviations();
    for (const p of pitchTypes) {
        let found = false;
        for (const abb in abbrs) {
            if (p === abbrs[abb]) {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    }

    for (const abb in abbrs) {
        expect(pitchTypes.includes(abbrs[abb]));
    }
});

test('aid to pitcher', () => {
    const pitchers = readAllPitchers();
    const lester = aidToPitcher(2015000001, pitchers);
    const lester2 = pitchers['Jon Lester'];
    expect(JSON.stringify(lester)).toBe(JSON.stringify(lester2));
});

test('get play type', () => {
    let state = getState();
    const plays = playTypes();
    for (const p in plays) {
        // throws an error if result is not allowed
        dispatch(getPlayType(p, 'DP', state));
        state = getState();
        state.undo();
    }

    const hits: { [key: string]: string } = {
        Single: '1b',
        Double: '2b',
        Triple: '3b',
        'Home Run': 'hr',
        'Fielders Choice': '1b',
        'Catcher Interference': '1b',
        'Flyout': 'o'
    };

    for (const h in hits) {
        expect(getPlayType('D', h, state)).toBe(hits[h]);
    }
    state.balls = 3;
    expect(getPlayType('B', 'B', state)).toBe('bb');
    state.strikes = 2;
    expect(getPlayType('S', 'S', state)).toBe('kk');
    state.balls = 2;
    expect(getPlayType('I', 'B', state)).toBe('b');
    expect(getPlayType('X', 'DP', state)).toBe('dp');

    expect(() => getPlayType('fake result', 'B', state)).toThrowError();
    expect(() => getPlayType('D', 'fake event', state)).toThrowError();
});
