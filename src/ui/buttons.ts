import { state } from "../baseballLogic/GameState.js";
import { updateBug } from "./scorebug.js";

export const ball = () => {
    state.ball();
    updateBug();
}

export const strike = () => {
    state.strike();
    updateBug();
}

export const foul = () => {
    state.foul();
    updateBug();
}

export const single = () => {
    state.single();
    updateBug();
}

export const double = () => {
    state.double();
    updateBug();
}

export const triple = () => {
    state.triple();
    updateBug();
}

export const homeRun = () => {
    state.homeRun();
    updateBug();
}

export const out = () => {
    state.out();
    updateBug();
}

export const error = () => {
    state.error();
    updateBug();
}

export const doublePlay = () => {
    state.doublePlay();
    updateBug();
}

export const groundout = () => {
    state.groundout();
    updateBug();
}

export const flyout = () => {
    state.flyout();
    updateBug();
}

export const lineout = () => {
    state.lineout();
    updateBug();
}

export const undo = () => {
    state.undo();
    updateBug();
}
