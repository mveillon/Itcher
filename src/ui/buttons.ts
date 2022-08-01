import { state } from "../baseballLogic/GameState.js";
import { usingNode } from "../utils/usingNode.js";
import { $ } from "../utils/utilities.js";
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

export const bindButtons = () => {
    if (!usingNode()) {
        const buttonFuncs: { [key: string]: () => void } = {
            'ball': ball,
            'strike': strike,
            'foul': foul,
            '1b': single,
            '2b': double,
            '3b': triple,
            'hr': homeRun,
            'error': error,
            'go': groundout,
            'lo': lineout,
            'fo': flyout,
            'dp': doublePlay,
            'undo': undo,
        }

        for (const id in buttonFuncs) {
            $(id).onclick = buttonFuncs[id];
        }
    }
}
