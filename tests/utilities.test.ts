import { upTo } from "../src/utils/utilities";

test('up to', () => {
    expect(upTo(0)).toEqual([]);
    const ten = upTo(10);
    expect(ten.length).toBe(10);
    for (let i = 0; i < 10; i++) {
        expect(ten[i]).toBe(i);
    }
});
