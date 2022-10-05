/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { getState, resetState } from "../src/baseballLogic/GameState";
import * as buttons from "../src/ui/buttons";

test('buttons', () => {
    let state = getState();
    for (let b = 0; b < 4; b++) {
        expect(state.balls).toBe(b);
        buttons.ball();
        state = getState();
    }
    expect(state.balls).toBe(0);
    for (let s = 0; s < 3; s++) {
        expect(state.strikes).toBe(s);
        buttons.strike();
        state = getState();
    }
    expect(state.strikes).toBe(0);

    for (let f = 0; f < 2; f++) {
        expect(state.strikes).toBe(f);
        buttons.foul();
        state = getState();
    }
    expect(state.strikes).toBe(2);
    buttons.foul();
    state = getState();
    expect(state.strikes).toBe(2);
    buttons.homeRun();
    state = getState();

    const baseHits = [
        buttons.single,
        buttons.double,
        buttons.triple,
        buttons.homeRun
    ];
    for (let i = 0; i < baseHits.length; i++) {
        const bases = [false, false, false];
        if (i < bases.length) bases[i] = true;
        baseHits[i]();
        state = getState();
        expect(state.bases).toEqual(bases);
        buttons.undo();
        state = getState();
        expect(state.bases).toEqual([false, false, false]);
    }
    buttons.error();
    state = getState();
    expect(state.bases).toEqual([true, false, false]);
    expect(state.outs).toBe(1);
    buttons.undo();
    state = getState();

    const outs = [
        buttons.out,
        buttons.flyout,
        buttons.groundout,
        buttons.lineout
    ];
    for (let i = 0; i < outs.length; i++) {
        outs[i]();
        expect(state.bases).toEqual([false, false, false]);
        expect(state.outs).toBe((2 + i) % 3);
    }

    resetState();
    state = getState();
    buttons.doublePlay();
    state = getState();
    expect(state.outs).toBe(2);
});