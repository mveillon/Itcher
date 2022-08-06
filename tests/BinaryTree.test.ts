import { BinaryTree } from "../src/utils/BinaryTree";
import { upTo } from "../src/utils/utilities";

test('int tree', () => {
    const nums: number[] = upTo(32);
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
});