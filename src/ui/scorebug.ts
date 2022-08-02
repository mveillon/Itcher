import { state } from "../baseballLogic/GameState.js";
import { allPitchers } from "../baseballLogic/Pitcher.js";
import { usingNode } from "../utils/usingNode.js";
import { $ } from "../utils/utilities.js";

/**
 * Toggles whether the base is occupied or not
 * @param baseInd which base to toggle
 */
export const toggleBase = (baseInd: number) => {
    state.backup();
    state.bases[baseInd] = !state.bases[baseInd];
}

/**
 * Toggles whether there are outInd outs
 * @param outInd which out button was clicked (0, 1, or 2)
 */
export const toggleOuts = (outInd: number) => {
    state.backup();
    if (outInd === 2) {
        if (state.outs === 0) {
            state.undo();
        }
        state.outs = 0;
    } else {
        state.outs = outInd + +(outInd >= state.outs);
    }
}

/**
 * Changes the count to the user's input
 * @param balls how many balls there should be
 * @param strikes how many strikes there should be
 */
export const changeCount = (balls: number, strikes: number) => {
    if (balls > 4 || strikes > 3) return;
    if (balls === 4 && strikes === 3) {
        return;
    } else if (balls !== state.balls || strikes !== state.strikes) {
        state.backup();
        if (strikes < 3) state.balls = balls;
        if (balls < 4) state.strikes = strikes;
    }
}

/**
 * Changes who's throwing
 * @param pitcherName the new pitcher
 */
export const changePitcher = (pitcherName: string) => {
    if (pitcherName !== state.pitcher.name && pitcherName in allPitchers) {
        state.backup();
        state.pitcher = allPitchers[pitcherName];
    }
}

/**
 * Changes the handnedness of the lineup
 * @param newLineup the new lineup
 */
export const changeLineup = (newLineup: string[]) => {
    if (newLineup.length === state.lineup.length) {
        const allowed = ['R', 'L', 'S'];
        let diff = false;
        for (let i = 0; i < newLineup.length; i++) {
            if (!allowed.includes(newLineup[i])) return;

            if (newLineup[i] !== state.lineup[i]) {
                diff = true;
                break;
            }
        }
        if (!diff) return;
    }

    state.backup();
    state.lineup = newLineup;
}

/**
 * Changes where in the order we are
 * @param newSpot the new lineup spot
 */
export const changeLineSpot = (newSpot: number) => {
    if (newSpot >= 0 && newSpot < 9 && newSpot !== state.lineSpot) {
        state.backup();
        state.lineSpot = newSpot;
    }
}

/**
 * Finds the next pitch to throw and updates the html
 * to reflect that
 */
export const updateNext = () => {

}

export const updateBug = () => {
    if (!usingNode()) {
        const baseIds = [
            'first-base',
            'second-base',
            'third-base'
        ];
        for (let i = 0; i < baseIds.length; i++) {
            const file = state.bases[i] ? 'occupied' : 'empty';
            ($(baseIds[i]) as HTMLImageElement).src = `../../assets/${file}.png`;
        }

        const outIds = [
            'one-out',
            'two-out',
        ];
        for (let i = 0; i < outIds.length; i++) {
            const file = state.outs > i ? 'out' : 'no-out';
            ($(outIds[i]) as HTMLImageElement).src = `../../assets/${file}.png`;
        }
    }
}

const updateBases = (baseInd: number) => {
    toggleBase(baseInd);
    updateBug();
}

const updateOut = (outInd: number) => {
    toggleOuts(outInd);
    updateBug();
}

export const bindToggles = () => {
    if (!usingNode()) {
        $('first-base').onclick = () => updateBases(0);
        $('second-base').onclick = () => updateBases(1);
        $('third-base').onclick = () => updateBases(2);
        $('one-out').onclick = () => updateOut(0);
        $('two-out').onclick = () => updateOut(1);
        $('three-out').onclick = () => updateOut(2);
    }
}

