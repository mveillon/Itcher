import { usingNode } from "../src/utils/usingNode";

test('using node', () => {
    expect(usingNode()).toBe(true);
});