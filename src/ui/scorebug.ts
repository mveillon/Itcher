import { getState, setState } from "../baseballLogic/GameState.js";
import { readAllPitchers } from "../baseballLogic/Pitcher.js";
import { usingNode } from "../utils/usingNode.js";
import { $ } from "../utils/utilities.js";
import { nextPitch } from "../ml/nextPitch.js";
import { getLearner } from "../ml/models/getLearner.js";
import { MachineLearning } from "../ml/models/MachineLearning.js";

/**
 * Toggles whether the base is occupied or not
 * @param baseInd which base to toggle
 */
export const toggleBase = (baseInd: number) => {
    const state = getState();
    state.backup();
    state.bases[baseInd] = !state.bases[baseInd];
    setState(state);
    updateBug();
}

/**
 * Toggles whether there are outInd outs
 * @param outInd which out button was clicked (0, 1, or 2)
 */
export const toggleOuts = (outInd: number) => {
    const state = getState();
    state.backup();
    if (outInd === 2) {
        if (state.outs === 0) {
            state.undo();
        }
        state.outs = 0;
    } else {
        state.outs = outInd + +(outInd >= state.outs);
    }
    setState(state);
    updateBug();
}

/**
 * Changes the count to the user's input
 * @param balls how many balls there should be
 * @param strikes how many strikes there should be
 */
export const changeCount = (balls: number, strikes: number) => {
    const state = getState();
    if (
        (balls < 4 || strikes < 3) &&
        (balls !== state.balls || strikes !== state.strikes)
    ) {
        state.backup();
        if (strikes < 3) state.balls = balls;
        if (balls < 4) state.strikes = strikes;
        setState(state);
        updateBug();
    }
}

/**
 * Changes who's throwing
 * @param pitcherName the new pitcher
 */
export const changePitcher = (pitcherName: string) => {
    const state = getState();
    const allPitchers = readAllPitchers();
    if (pitcherName !== state.pitcher.name && pitcherName in allPitchers) {
        state.backup();
        state.pitcher = allPitchers[pitcherName];
    }
    setState(state);
    updateBug();
}

/**
 * Changes the handnedness of the lineup
 * @param newLineup the new lineup
 */
export const changeLineup = (newLineup: string[]) => {
    const state = getState()
    if (newLineup.length === state.lineup.length) {
        const allowed = ['R', 'L', 'S'];
        let diff = false;
        for (let i = 0; i < newLineup.length; i++) {
            if (!allowed.includes(newLineup[i])) return;
            diff ||= newLineup[i] !== state.lineup[i];
        }
        if (!diff) return;
    }

    state.backup();
    state.lineup = newLineup;
    setState(state);
    updateBug();
}

/**
 * Changes where in the order we are
 * @param newSpot the new lineup spot
 */
export const changeLineSpot = (newSpot: number) => {
    const state = getState();
    if (newSpot >= 0 && newSpot < 9 && newSpot !== state.lineSpot) {
        state.backup();
        state.lineSpot = newSpot;
    }
    setState(state);
    updateBug();
}

let learner: MachineLearning;

/**
 * Finds the next pitch to throw and updates the html
 * to reflect that
 */
export const updateNext = () => {
    if (typeof learner === 'undefined') {
        console.log('Still waiting for learner...');
        return;
    }
    const next = nextPitch(learner);
    console.log(next);
}

/**
 * Updates the scorebug based on the current state
 */
export const updateBug = () => {
    if (!usingNode()) {
        const state = getState();
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

        ($('strikes') as HTMLInputElement).value = state.strikes.toString();
        ($('balls') as HTMLInputElement).value = state.balls.toString();

        updateNext();

        console.log(`${state.balls}-${state.strikes}`);
    }
}

/**
 * Retrieves the values for the ball and strike fields and updates the count
 */
export const getUpdateCount = () => {
    if (!usingNode()) {
        let balls: number;
        let strikes: number;
        try {
            balls = parseInt(($('balls') as HTMLInputElement).value);
            strikes = parseInt(($('strikes') as HTMLInputElement).value);
        } catch {
            console.log('Invalid ball or strike input!');
            return;
        }
        changeCount(balls, strikes);
    }
}

/**
 * Creates and trains the machine learning model responsible for choosing
 * the next pitch
 */
export const initBug = async () => {
    learner = await getLearner();
}
