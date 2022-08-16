import { GameState, getState, setState } from "../baseballLogic/GameState.js";
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

        $('count-text').innerHTML = `${state.balls}-${state.strikes}`;

        updateNext();
    }
}

/**
 * Adds toAdd to the global state's strike count
 * @param toAdd how much to add. Can be negative
 */
export const addStrike = (toAdd: number) => {
    const state = getState();
    const newS = state.strikes + toAdd;
    if (newS >= 0) {
        state.backup();
        state.strikes = newS;
        setState(state);
        updateBug();
    }
}

/**
 * Adds toAdd to the global state's ball count
 * @param toAdd how much to add. Can be negative
 */
export const addBall = (toAdd: number) => {
    const state = getState();
    const newB = state.balls + toAdd;
    if (newB >= 0) {
        state.backup();
        state.balls = newB;
        setState(state);
        updateBug();
    }
}

/**
 * Creates and trains the machine learning model responsible for choosing
 * the next pitch
 */
export const initBug = async () => {
    setState(new GameState());
    // learner = await getLearner();
    updateBug();
}
