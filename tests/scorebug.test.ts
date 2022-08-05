import { state, resetState } from "../src/baseballLogic/GameState";
import * as bug from "../src/ui/scorebug";

const r = () => resetState(true, true, false);

test('toggleBase', () => {
    r();
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
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            bug.changeCount(b, s);
            expect(state.balls).toBe(b);
            expect(state.strikes).toBe(s);
        }
    }
    r();
    expect(state.strikes).toBe(0);
    expect(state.balls).toBe(0);
    state.strike();
    expect(state.strikes).toBe(1);

    bug.changeCount(0, 0);
    expect(state.strikes).toBe(0);
    state.undo();
    expect(state.strikes).toBe(1);

    state.undo();
    state.single();
    bug.changeCount(0, 0);
    state.undo();
    expect(state.bases).toEqual([false, false, false]);
    
    for (let b = 1; b < 4; b++) {
        for (let s = 1; s < 3; s++) {
            bug.changeCount(b, s);
            state.undo();
            expect(state.strikes).toBe(0);
            expect(state.balls).toBe(0);
        }
    }

    for (let s = 0; s < 2; s++) {
        r();
        bug.changeCount(4, s);
        expect(state.strikes).toBe(0);
        expect(state.balls).toBe(0);
        expect(state.lineSpot).toBe(1);
        expect(state.bases).toEqual([true, false, false]);
        expect(state.outs).toBe(0);
    }

    for (let b = 0; b < 3; b++) {
        r();
        bug.changeCount(b, 3);
        expect(state.strikes).toBe(0);
        expect(state.balls).toBe(0);
        expect(state.lineSpot).toBe(1);
        expect(state.bases).toEqual([false, false, false]);
        expect(state.outs).toEqual(1);
    }

    r();
    state.strike();
    bug.changeCount(4, 3);
    expect(state.strikes).toBe(1);
    expect(state.balls).toBe(0);
    expect(state.bases).toEqual([false, false, false]);
    expect(state.outs).toBe(0);
    expect(state.lineSpot).toBe(0);
    state.undo();
    expect(state.strikes).toBe(0);
});

test('change pitcher', () => {
    resetState(false);
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
    const oldLine = state.lineup;
    const newLine = ['R', 'L', 'S'];
    bug.changeLineup(newLine);
    expect(state.lineup).toEqual(newLine);
    state.undo();
    expect(state.lineup).toEqual(oldLine);
});

test('change linespot', () => {
    resetState();
    bug.changeLineSpot(1);
    expect(state.lineSpot).toBe(1);
    state.undo();
    expect(state.lineSpot).toBe(0);
});

