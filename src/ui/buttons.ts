import { state } from "../baseballLogic/GameState.js";
import { usingNode } from "../utils/usingNode.js";

export const ball = () => {
    state.ball();
}

export const strike = () => {
    state.strike();
}

export const foul = () => {
    state.foul();
}

export const single = () => {
    state.single();
}

export const double = () => {
    state.double();
}

export const triple = () => {
    state.triple();
}

export const homeRun = () => {
    state.homeRun();
}

export const out = () => {
    state.out();
}

export const error = () => {
    state.error();
}

export const doublePlay = () => {
    state.doublePlay();
}

export const groundout = () => {
    state.groundout();
}

export const flyout = () => {
    state.flyout();
}

export const lineout = () => {
    state.lineout();
}

export const undo = () => {
    state.undo();
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
            document.getElementById(id).onclick = buttonFuncs[id];
        }
    }
}
