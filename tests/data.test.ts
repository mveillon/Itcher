/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { readFile, dataPaths } from "../src/utils/files";

test('data sensibility', () => {
    const raw = readFile(dataPaths().train + 'raw.ignore.csv', 'utf-8');
    expect(typeof raw).toBe("string");
    expect(raw.length).toBeGreaterThan(0);
    let rows = raw.split('\n').slice(0, -1);
    expect(rows.length).toBeGreaterThan(100);
    const firstLen = rows[0].split(',').length;
    for (const r of rows) {
        expect(r.split(',').length).toBe(firstLen);
    }
});