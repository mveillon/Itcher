import { BinaryTree } from "../src/utils/BinaryTree";
import { arange } from "../src/utils/numJS";

test('int tree', () => {
    const nums: number[] = arange(32);
    const buildTree = (vals: number[]): BinaryTree<number> | number => {
        if (vals.length === 0) return -1;
        if (vals.length === 1) return vals[0];
        const med = Math.floor(vals.length / 2);
        return new BinaryTree<number>(
            buildTree(vals.slice(0, med)),
            buildTree(vals.slice(med)),
            (n: number): boolean => n < vals[med]
        );
    }

    const tree = buildTree(nums);
    expect(tree instanceof BinaryTree).toBe(true);
    if (typeof tree === "number") return;
    for (const n of nums) {
        expect(tree.traverse(n)).toBe(n);
    }
    expect(Number.isInteger(tree.height)).toBe(true);
    expect(tree.height).toBeGreaterThanOrEqual(4);
    expect(tree.height).toBeLessThanOrEqual(6);
});

test('tree height', () => {
    const leaf = 0;
    const node1 = new BinaryTree(
        leaf,
        leaf,
        (v) => true
    );
    expect(node1.height).toBe(2);
    const node2 = new BinaryTree(
        node1,
        leaf,
        (v) => false
    );
    expect(node2.height).toBe(3);
    const node3 = new BinaryTree(
        leaf,
        node2,
        (v) => true
    );
    expect(node3.height).toBe(4);
    const node4 = new BinaryTree(
        node3,
        node3,
        (v) => false
    );
    expect(node4.height).toBe(5);
});
