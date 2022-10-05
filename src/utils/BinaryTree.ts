/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

export class BinaryTree<T> {
    left: BinaryTree<T> | T;
    right: BinaryTree<T> | T;
    split: (val: T) => boolean;
    private _height: number;

    /**
     * One node in a binary tree
     * @param _left the left child - can be a leaf
     * @param _right the right child - can be a leaf
     * @param _split how to split the incoming value. 
     * `true` means left, `false` means right
     */
    constructor(
            _left: BinaryTree<T> | T, 
            _right: BinaryTree<T> | T,
            _split: (val: T) => boolean
        ) {
        this.left = _left;
        this.right = _right;
        this.split = _split;
        const getHeight = (node: BinaryTree<T> | T): number => {
            return node instanceof BinaryTree<T> ? node.height : 1;
        }
        this._height = 1 + Math.max(getHeight(_left), getHeight(_right));
    }

    /**
     * Finds the leaf that val belongs to based on the split function
     * @param val the value to search for
     * @returns the relevant leaf
     */
    traverse(val: T): T {
        let current: BinaryTree<T> | T = this;
        while (current instanceof BinaryTree<T>) {
            current = current.split(val) ? current.left : current.right;
        }
        return current;
    }

    get height() {
        return this._height;
    }
}