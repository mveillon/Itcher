/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import * as bug from "../src/ui/scorebug";
import * as buttons from "../src/ui/buttons";
import { getState } from '../src/baseballLogic/GameState';

test('interaction', () => {
    expect(getState().balls).toBe(0);
    expect(getState().strikes).toBe(0);
    bug.addBall(1);
    expect(getState().balls).toBe(1);
    expect(getState().strikes).toBe(0);
    buttons.undo();
    expect(getState().balls).toBe(0);
    bug.addBall(1);
    expect(getState().balls).toBe(1);
    buttons.ball();
    expect(getState().balls).toBe(2);
    buttons.undo();
    expect(getState().balls).toBe(1);
    buttons.ball();
    bug.addBall(1);
    expect(getState().balls).toBe(3);
});