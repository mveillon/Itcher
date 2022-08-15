import { dispatch } from "../src/baseballLogic/dispatch";
import { getState, resetState } from "../src/baseballLogic/GameState";

test('dispatch', () => {
    resetState(false, false, false);
    let state = getState();
    expect(state.strikes).toBe(0);
    dispatch('k');
    state = getState();
    expect(state.strikes).toBe(1);
    dispatch('f');
    state = getState();
    expect(state.strikes).toBe(2);
    dispatch('f');
    state = getState();
    expect(state.strikes).toBe(2);

    expect(state.balls).toBe(0);
    dispatch('b');
    state = getState();
    expect(state.balls).toBe(1);
    dispatch('b');
    state = getState();
    expect(state.balls).toBe(2);

    dispatch('k');
    state = getState();
    expect(state.strikes).toBe(0);
    expect(state.balls).toBe(0);
    expect(state.outs).toBe(1);

    dispatch('b');
    state = getState();
    expect(state.balls).toBe(1);
    dispatch('bb');
    state = getState();
    expect(state.balls).toBe(0);
    expect(state.bases).toEqual([true, false, false]);
    dispatch('undo');
    state = getState();
    expect(state.bases).toEqual([false, false, false]);
    expect(state.balls).toBe(1);

    dispatch('kk');
    state = getState();
    expect(state.outs).toBe(2);
    expect(state.strikes).toBe(0);
    expect(state.balls).toBe(0);

    const hits = ['1b', '2b', '3b'];
    for (const h of hits) {
        dispatch('k');
        state = getState();
        expect(state.strikes).toBe(1);
        dispatch(h);
        state = getState();
        expect(state.strikes).toBe(0);
        expect(state.bases).not.toEqual([false, false, false]);
        dispatch('undo');
        state = getState();
        expect(state.bases).toEqual([false, false, false]);
        dispatch('undo');
        state = getState();
    }

    expect(state.outs).toBe(2);
    dispatch('o');
    state = getState();
    expect(state.outs).toBe(0);
    dispatch('dp');
    state = getState();
    expect(state.outs).toBe(2);
});