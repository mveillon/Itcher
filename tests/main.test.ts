import * as main from "../src/main";
import { getState, resetState } from "../src/baseballLogic/GameState";

test('main exports correctly', () => {
    resetState(false, false, false);
    main.ball();
    expect(getState().balls).toBe(1);
});

test('init', () => {
    main.init();
});
