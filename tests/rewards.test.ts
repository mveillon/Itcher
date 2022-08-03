import { rewards } from "../src/ml/rewards";
import { state } from "../src/baseballLogic/GameState";

test('rewards', () => {
    for (let b = 0; b < 4; b++) {
        for (let s = 0; s < 3; s++) {
            state.balls = b;
            state.strikes = s;
            const good = ['k', 'kk', 'o', 'dp'];
            const bad = ['b', 'bb', '1b', '2b', '3b', 'hr'];
            for (const g of good) {
                const r = rewards(g);
                expect(r).toBeGreaterThan(0);
                expect(r).toBeLessThan(3);
            }
            for (const b of bad) {
                const r = rewards(b);
                expect(r).toBeLessThan(0);
                expect(r).toBeGreaterThan(-2);
            }
        }
    }
})
