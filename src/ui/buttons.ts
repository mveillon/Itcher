/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { GameState, getState, setState } from "../baseballLogic/GameState.js";
import { updateBug } from "./scorebug.js";

export const ball = () => {
    const state = getState();
    changeState(state, state.ball);
}

export const strike = () => {
    const state = getState();
    changeState(state, state.strike);
}

export const foul = () => {
    const state = getState();
    changeState(state, state.foul);
}

export const single = () => {
    const state = getState();
    changeState(state, state.single);
}

export const double = () => {
    const state = getState();
    changeState(state, state.double);
}

export const triple = () => {
    const state = getState();
    changeState(state, state.triple);
}

export const homeRun = () => {
    const state = getState();
    changeState(state, state.homeRun);
}

export const out = () => {
    const state = getState();
    changeState(state, state.out);
}

export const error = () => {
    const state = getState();
    changeState(state, state.error);
}

export const doublePlay = () => {
    const state = getState();
    changeState(state, state.doublePlay);
}

export const groundout = () => {
    const state = getState();
    changeState(state, state.groundout);
}

export const flyout = () => {
    const state = getState();
    changeState(state, state.flyout);
}

export const lineout = () => {
    const state = getState();
    changeState(state, state.lineout);
}

export const undo = () => {
    const state = getState();
    changeState(state, state.undo);
}

/**
 * Changes the state and updates the html safely
 * @param state the state to update
 * @param meth which of the state's methods to use
 */
const changeState = (state: GameState, meth: () => void) => {
    meth.bind(state)();
    setState(state);
    updateBug();
}