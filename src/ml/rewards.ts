import { GameState } from "../baseballLogic/GameState.js";

/**
 * Finds the reward given the current reward and what happened.
 * Values courtesy of https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values.
 * Higher reward is better
 * @param res what happened
 * @returns the run value of that pitch
 */
export const rewards = (res: string, state: GameState): number => {
    const oldWoba = woba(state);
    let newWoba: number;
    switch (res) {
        case 'k':
            newWoba = getWoba(state.balls, state.strikes + 1);
            break;
        case 'b': 
            newWoba = getWoba(state.balls + 1, state.strikes);
            break;
        case 'f':
            newWoba = getWoba(state.balls, Math.min(state.strikes + 1, 2));
            break;
        case 'kk':
            newWoba = 0;
            break;
        case 'o':
            newWoba = 0;
            break;
        case 'bb':
            newWoba = 0.72;
            break;
        case 'dp':
            newWoba = -oldWoba;
            break;
        case '1b':
            newWoba = 0.892;
            break;
        case '2b':
            newWoba = 1.283;
            break;
        case '3b':
            newWoba = 1.635;
            break;
        case 'hr':
            newWoba = 2.135;
            break;
        default:
            throw new Error(`Unexpected result ${res}`);
    }

    return oldWoba - newWoba;
}

/**
 * Returns the expected weight on base average (wOBA) given the
 * current game state. Also courtesy of 
 * https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values
 * @param balls the number of balls in the count
 * @param strikes the number of strikes in the count
 * @returns the expected wOBA
 */
const getWoba = (balls: number, strikes: number): number => {
    const arr = [
        [0.31,  0.262, 0.196],
        [0.355, 0.293, 0.223],
        [0.436, 0.352, 0.273],
        [0.622, 0.47,  0.384]
    ];
    return arr[balls][strikes];
}

/**
 * Returns the expected weight on base average (wOBA) given the
 * current game state. Also courtesy of 
 * https://www.draysbay.com/platform/amp/2016/4/28/11521790/an-introduction-to-per-pitch-run-values
 * @param state the current game state
 * @returns the expected wOBA
 */
export const woba = (state: GameState): number => {
    return getWoba(state.balls, state.strikes);
}
