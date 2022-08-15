import { getState, setState } from "../baseballLogic/GameState.js";
import { updateBug } from "./scorebug.js";

export const ball = () => {
    const state = getState();
    state.ball();
    setState(state);
    updateBug();
}

export const strike = () => {
    const state = getState();
    state.strike();
    setState(state);
    updateBug();
}

export const foul = () => {
    const state = getState();
    state.foul();
    setState(state);
    updateBug();
}

export const single = () => {
    const state = getState();
    state.single();
    setState(state);
    updateBug();
}

export const double = () => {
    const state = getState();
    state.double();
    setState(state);
    updateBug();
}

export const triple = () => {
    const state = getState();
    state.triple();
    setState(state);
    updateBug();
}

export const homeRun = () => {
    const state = getState();
    state.homeRun();
    setState(state);
    updateBug();
}

export const out = () => {
    const state = getState();
    state.out();
    setState(state);
    updateBug();
}

export const error = () => {
    const state = getState();
    state.error();
    setState(state);
    updateBug();
}

export const doublePlay = () => {
    const state = getState();
    state.doublePlay();
    setState(state);
    updateBug();
}

export const groundout = () => {
    const state = getState();
    state.groundout();
    setState(state);
    updateBug();
}

export const flyout = () => {
    const state = getState();
    state.flyout();
    setState(state);
    updateBug();
}

export const lineout = () => {
    const state = getState();
    state.lineout();
    setState(state);
    updateBug();
}

export const undo = () => {
    const state = getState();
    state.undo();
    setState(state);
    updateBug();
}
