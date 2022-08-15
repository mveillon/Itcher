import { getState, setState } from "../baseballLogic/GameState.js";

/**
 * Updates state based on the result
 * @param result a string representation of what happened
 */
export const dispatch = (result: string) => {
    const state = getState();
    switch (result) {
        case 'k':
            state.strike();
            break;
        case 'kk':
            state.backup();
            state.strikeout();
            break;
        case 'f':
            state.foul();
            break;
        case 'b':
            state.ball();
            break;
        case 'bb':
            state.backup();
            state.walk();
            break;
        case '1b':
            state.single();
            break;
        case '2b':
            state.double();
            break;
        case '3b':
            state.triple();
            break;
        case 'hr':
            state.homeRun();
            break;
        case 'dp':
            state.doublePlay();
            break;
        case 'o':
            state.out();
            break;
        case 'undo':
            state.undo();
            break;
        default:
            throw new Error(`Unexpected result ${result}`);
            break;
    }
    setState(state);
}