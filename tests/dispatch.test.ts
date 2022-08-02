import { dispatch } from "../src/baseballLogic/dispatch";
import { state, resetState } from "../src/baseballLogic/GameState";

test('dispatch', () => {
    resetState(false, false, false);
    expect(state.strikes).toBe(0);
    dispatch('k');
    expect(state.strikes).toBe(1);
    dispatch('f');
    expect(state.strikes).toBe(2);
    dispatch('f');
    expect(state.strikes).toBe(2);

    expect(state.balls).toBe(0);
    dispatch('b');
    expect(state.balls).toBe(1);
    dispatch('b');
    expect(state.balls).toBe(2);

    dispatch('k');
    expect(state.strikes).toBe(0);
    expect(state.balls).toBe(0);
    expect(state.outs).toBe(1);

    dispatch('b');
    expect(state.balls).toBe(1);
    dispatch('bb');
    expect(state.balls).toBe(0);
    expect(state.bases).toEqual([true, false, false]);
    dispatch('undo');
    expect(state.bases).toEqual([false, false, false]);
    expect(state.balls).toBe(1);

    dispatch('kk');
    expect(state.outs).toBe(2);
    expect(state.strikes).toBe(0);
    expect(state.balls).toBe(0);

    const hits = ['1b', '2b', '3b'];
    for (const h of hits) {
        dispatch('k');
        expect(state.strikes).toBe(1);
        dispatch(h);
        expect(state.strikes).toBe(0);
        expect(state.bases).not.toEqual([false, false, false]);
        dispatch('undo');
        expect(state.bases).toEqual([false, false, false]);
        dispatch('undo');
    }

    expect(state.outs).toBe(2);
    dispatch('o');
    expect(state.outs).toBe(0);
    dispatch('dp');
    expect(state.outs).toBe(2);
});