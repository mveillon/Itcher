import { 
    trainFeatsTargs,
    validFeatsTargs,
    testFeatsTargs
} from "../src/ml/trainTest";
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

    const datasets = [
        trainFeatsTargs(),
        validFeatsTargs(),
        testFeatsTargs()
    ];

    for (const data of datasets) {
        const [feats, targs] = data;
        expect(feats.length).toBe(targs.length);
        const width = feats[0].length;

        for (const row of feats) {
            expect(row.length).toBe(width);
            for (const cell of row) {
                expect(typeof cell).toBe('number');
                expect(cell).not.toBeNaN();
            }
        }
    }
});