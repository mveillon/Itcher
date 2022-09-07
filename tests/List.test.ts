import { List } from '../src/utils/LinkedList';

const checkEmpty = (lst: List<any>) => {
    expect(lst.length).toBe(0);
    expect(() => lst.popLeft()).toThrow(Error);
    expect(() => lst.popRight()).toThrow(Error);
    expect(() => lst.peekLeft()).toThrow(Error);
    expect(() => lst.peekRight()).toThrow(Error);
}

test('Adding and peeking left and right', () => {
    let l = new List<number>();
    for (let i = 0; i < 10; i++) {
        expect(l.length).toBe(i);
        l.addRight(i);
        expect(l.peekRight()).toBe(i);
        expect(l.peekLeft()).toBe(0);
    }

    let l2 = new List<number>();
    for (let i = 0; i < 10; i++) {
        expect(l2.length).toBe(i);
        l2.addLeft(i);
        expect(l2.peekLeft()).toBe(i);
        expect(l2.peekRight()).toBe(0);
    }

    let ind = 0;
    for (const val of l) {
        expect(val).toBe(ind++);
    }

    for (const val of l2) {
        expect(val).toBe(--ind);
    }

    const vals = [
        10,
        5, 
        15,
        5.5,
        8,
        -3,
        40
    ];
    let l3 = new List<number>(vals);
    expect(l3.length).toBe(vals.length);

    ind = 0;
    for (const val of l3) {
        expect(val).toBe(vals[ind++]);
    }
});

test('Popping left and right', () => {
    let l = new List<string>();
    const s = 'The string to add';

    for (const c of s) {
        l.addRight(c);
        expect(l.length).toBe(1);
        expect(l.popRight()).toBe(c);
        checkEmpty(l);

        l.addLeft(c);
        expect(l.length).toBe(1);
        expect(l.popLeft()).toBe(c);
        checkEmpty(l);
    }

    l = new List<string>(s);
    let ind = 0;
    for (const c of s) {
        expect(l.length).toBe(s.length - ind++);
        expect(l.popLeft()).toBe(c);
    }
    checkEmpty(l);

    for (const c of s) {
        l.addLeft(c);
    }

    ind = 0;
    for (const c of s) {
        expect(l.length).toBe(s.length - ind++);
        expect(l.popRight()).toBe(c);
    }
    checkEmpty(l);
});

test('string', () => {
    const l = new List([1, 2, 3]);
    expect(l.toString()).toBe('(1, 2, 3)');
});
