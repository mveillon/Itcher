/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { usingNode } from "../src/utils/usingNode";

test('using node', () => {
    expect(usingNode()).toBe(true);
});