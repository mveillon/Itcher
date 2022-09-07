import { getState, resetState } from "../src/baseballLogic/GameState";
import * as bug from "../src/ui/scorebug";

const r = () => resetState(true, true, false);

test('toggleBase', () => {
    r();
    const state = getState();
    for (let i = 0; i < state.bases.length; i++) {
        let trueBases = [false, false, false];
        trueBases[i] = true;

        bug.toggleBase(i);
        expect(state.bases).toEqual(trueBases);
        bug.toggleBase(i);
        expect(state.bases).toEqual([false, false, false]);
        state.undo();
        expect(state.bases).toEqual(trueBases);
        state.undo();
        expect(state.bases).toEqual([false, false, false]);
    }
});

test('toggleOuts', () => {
    r();
    let state = getState();
    bug.toggleOuts(0);
    expect(state.outs).toBe(1);
    bug.toggleOuts(0);
    expect(state.outs).toBe(0);
    state.undo();
    expect(state.outs).toBe(1);
    state.undo();
    expect(state.outs).toBe(0);

    bug.toggleOuts(0);
    expect(state.outs).toBe(1);
    bug.toggleOuts(1);
    expect(state.outs).toBe(2);
    bug.toggleOuts(1);
    expect(state.outs).toBe(1);
    state.undo();
    expect(state.outs).toBe(2);
    state.undo();
    expect(state.outs).toBe(1);

    bug.toggleOuts(0);
    expect(state.outs).toBe(0);
    bug.toggleOuts(1);
    expect(state.outs).toBe(2);
    state.undo();
    expect(state.outs).toBe(0);

    bug.toggleOuts(2);
    expect(state.outs).toBe(0);
    for (let i = 0; i < 2; i++) {
        bug.toggleOuts(i);
        bug.toggleOuts(2);
        expect(state.outs).toBe(0);
    }

    r();
    state = getState();
    state.strike();
    bug.toggleOuts(2);
    state.undo(); // undoes strike
    expect(state.strikes).toBe(0);

    bug.toggleOuts(1);
    expect(state.outs).toBe(2);
    bug.toggleOuts(0);
    expect(state.outs).toBe(0);
});

test('change count', () => {
    r();
    let state = getState();
    for (let s = 0; s < 2; s++) {
        expect(state.strikes).toBe(s);
        bug.addStrike(1);
    }
    bug.addStrike(1);
    expect(state.strikes).toBe(0);
    expect(state.outs).toBe(1);
    state.undo();
    expect(state.strikes).toBe(2);
    expect(state.outs).toBe(0);

    for (let s = 0; s < 2; s++) {
        bug.addStrike(-1);
        expect(state.strikes).toBe(1 - s);
    }

    expect(state.strikes).toBe(0);
    bug.addStrike(-1);
    expect(state.strikes).toBe(0);
    state.undo();
    expect(state.strikes).toBe(1);

    for (let b = 0; b < 3; b++) {
        expect(state.balls).toBe(b);
        bug.addBall(1);
    }
    bug.addBall(1);
    expect(state.balls).toBe(0);
    expect(state.bases).toEqual([true, false, false]);
    state.undo();
    expect(state.balls).toBe(3);
    expect(state.bases).toEqual([false, false, false]);

    for (let b = 0; b < 3; b++) {
        bug.addBall(-1);
        expect(state.balls).toBe(2 - b);
    }

    expect(state.balls).toBe(0);
    bug.addBall(-1);
    expect(state.balls).toBe(0);
    state.undo();
    expect(state.balls).toBe(1);
});

test('change pitcher', () => {
    resetState(false);
    const state = getState();
    const oldName = state.pitcher.name;
    const newName = 'Felix Hernandez';
    bug.changePitcher(newName);
    expect(state.pitcher.name).toBe(newName);
    expect(state.pitcher.hand).toBe('R');

    state.undo();
    expect(state.pitcher.name).toBe(oldName);
});

test('change lineup', () => {
    resetState(false, false);
    const state = getState();
    const oldLine = state.lineup;
    const newLine = Array(oldLine.length).fill('R');
    bug.changeLineup(newLine);
    expect(state.lineup).toEqual(newLine);
    state.undo();
    expect(state.lineup).toEqual(oldLine);
});

test('change linespot', () => {
    resetState();
    const state = getState();
    bug.changeLineSpot(1);
    expect(state.lineSpot).toBe(1);
    state.undo();
    expect(state.lineSpot).toBe(0);
});

