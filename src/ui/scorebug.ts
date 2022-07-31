import { state } from "../baseballLogic/GameState";
import { allPitchers } from "../baseballLogic/Pitcher";

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
        if (outInd >= state.outs) {
            state.outs = outInd + 1;
        } else if (outInd === 0) {
            state.outs = 0;
        } else {
            state.outs = 1;
        }
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
        const allowed = ['r', 'l', 's'];
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

