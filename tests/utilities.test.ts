import { nameLT } from "../src/utils/utilities";
import { shuffle } from "../src/utils/random";

test('name LT', () => {
    const names = [
        'John Aaron',
        'Michael Aaron',
        'Sally John Aaron',
        'Barry Barrels',
        'Harry barrels',
        'Michael Daniel Veillon',
        'Michael David Veillon',
        'Michael Veillon'
    ];
    shuffle(names);
    expect(names.sort(nameLT)).toEqual(names);
});