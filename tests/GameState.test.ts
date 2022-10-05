/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { GameState } from '../src/baseballLogic/GameState';
import { Pitcher } from '../src/baseballLogic/Pitcher';

const checkNewBat = (gs: GameState, lastBat: number) => {
    expect(gs.balls).toBe(0);
    expect(gs.strikes).toBe(0);
    expect(gs.lineSpot).toBe((lastBat + 1) % 9);
}

test('platoon', () => {
    let gs = new GameState();
    gs.pitcher = new Pitcher('Luis Castillo', 'R');
    gs.lineup = ['L', 'R', 'S'];
    expect(gs.pitcherPlatoon()).toBe(false);
    gs.lineSpot++;
    expect(gs.pitcherPlatoon()).toBe(true);
    gs.lineSpot++;
    expect(gs.pitcherPlatoon()).toBe(false);
});

test('linespot', () => {
    let gs = new GameState();
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 8; i++) {
            expect(gs.lineSpot).toBe(i);
            gs.single();
        }
        gs.single();
        expect(gs.lineSpot).toBe(0);
    }
});

test('balls', () => {
    let gs = new GameState();
    gs.bases[2] = true;
    for (let i = 0; i < 3; i++) {
        gs.strike();
        expect(gs.strikes).toBe(1);

        for (let b = 0; b < 3; b++) {
            expect(gs.balls).toBe(b);
            gs.ball();
        }
        expect(gs.strikes).toBe(1);
        gs.ball();

        checkNewBat(gs, i);
        expect(gs.outs).toBe(0);
        expect(gs.bases).toEqual([true, i >= 1, true]);
    }
});

test('strikes', () => {
    let gs = new GameState();
    for (let o = 0; o < 3; o++) {
        expect(gs.outs).toBe(o);
        gs.ball()
        expect(gs.balls).toBe(1);

        for (let s = 0; s < 2; s++) {
            expect(gs.strikes).toBe(s);
            gs.strike();
        }
        expect(gs.balls).toBe(1);
        gs.strike();
        checkNewBat(gs, o);
        expect(gs.bases).toEqual([false, false, false]);
    }
    expect(gs.outs).toBe(0);
});

test('foul', () => {
    let gs = new GameState();
    gs.foul();
    expect(gs.strikes).toBe(1);
    gs.foul();
    expect(gs.strikes).toBe(2);
    gs.foul();
    expect(gs.strikes).toBe(2);
});

test('base hits', () => {
    let gs = new GameState();    
    let batter = 0;
    const clearBases = () => {
        gs.foul();
        gs.homeRun();
        checkNewBat(gs, batter++);
        expect(gs.bases).toEqual([false, false, false]);
        batter = 0;
        gs.lineSpot = 0;
    }

    gs.balls = 2;
    gs.strikes = 1;
    gs.single();
    checkNewBat(gs, batter++);
    expect(gs.bases).toEqual([true, false, false]);

    gs.ball();
    gs.single();
    checkNewBat(gs, batter++);
    expect(gs.bases).toEqual([true, true, false]);
    clearBases();

    for (let m = 1; m < 3; m++) {
        for (let i = 0; i < 2; i++) {
            gs.ball();
            if (m === 1) gs.double();
            else gs.triple();

            checkNewBat(gs, batter++);
            const trueBases = [false, false, false];
            trueBases[m] = true;
            expect(gs.bases).toEqual(trueBases);
        }
        clearBases();
    }

    gs.error();
    expect(gs.bases).toEqual([true, false, false]);
    expect(gs.outs).toBe(0);
    checkNewBat(gs, batter++);
});

test('outs', () => {
    for (let t = 0; t < 4; t++) {
        let gs = new GameState();
        for (let o = 0; o < 4; o++) {
            gs.ball();
            gs.strike();
            if (t === 0) gs.out();
            else if (t === 1) gs.groundout();
            else if (t === 2) gs.flyout();
            else if (t === 3) gs.lineout();
            checkNewBat(gs, o);
            expect(gs.outs).toBe((o + 1) % 3);
        }
    }
});

test('undo', () => {
    let gs = new GameState();
    gs.undo();
    gs.lineup = ['L', 'R', 'S'];
    gs.ball();
    expect(gs.balls).toBe(1);
    gs.undo();
    expect(gs.balls).toBe(0);

    gs.strike();
    expect(gs.strikes).toBe(1);
    gs.undo();
    expect(gs.strikes).toBe(0);

    for (let i = 0; i < 8; i++) {
        expect(gs.lineSpot).toBe(i);
        gs.single();
    }

    for (let i = 8; i >= 0; i--) {
        expect(gs.lineSpot).toBe(i);
        gs.undo();
    }
    expect(gs.bases).toEqual([false, false, false]);

    gs.backup();
    gs.lineup[0] = 'R';
    expect(gs.lineup).toEqual(['R', 'R', 'S']);

    gs.undo();
    expect(gs.lineup).toEqual(['L', 'R', 'S']);

    gs.pitcher.name = 'original name';
    gs.backup();
    gs.pitcher.name = 'other name';
    gs.undo();
    expect(gs.pitcher.name).toBe('original name');
});

test('backups', () => {
    let gs = new GameState();

    for (let i = 0; i < GameState.maxBackups; i++) {
        gs.strike();
        expect(gs.strikes).toBe((i + 1) % 3);
    }

    expect(gs.lastStates.length).toBe(GameState.maxBackups);
    gs.ball();
    expect(gs.lastStates.length).toBe(GameState.maxBackups);
    expect(gs.balls).toBe(1);
    gs.undo();
    expect(gs.balls).toBe(0);
    gs.ball();

    for (let i = 0; i < GameState.maxBackups; i++) {
        const oldBalls = gs.balls;
        gs.undo()
        gs.ball();
        expect(gs.balls).toBe(oldBalls);
    }

    for (let i = 0; i < GameState.maxBackups; i++) {
        expect(gs.lastStates.length).toBe(GameState.maxBackups - i);
        gs.undo();
    }
});

test('count incrementing', () => {
    let gs = new GameState();
    gs.strikes = 3;
    expect(gs.strikes).toBe(0);
    expect(gs.outs).toBe(1);
    gs.balls = 10;
    expect(gs.balls).toBe(0);
    expect(gs.bases).toEqual([true, false, false]);

    gs.strikes = -1;
    expect(gs.strikes).toBe(0);
    expect(gs.outs).toBe(1);
    gs.balls = -1;
    expect(gs.balls).toBe(0);
    expect(gs.bases).toEqual([true, false, false]);
})
