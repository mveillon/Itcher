export class BinaryTree<T> {
    left: BinaryTree<T> | T;
    right: BinaryTree<T> | T;
    split: (val: T) => boolean;

    /**
     * One node in a binary tree
     * @param _left the left child - can be a leaf
     * @param _right the right child - can be a leaf
     * @param _split how to split the incoming value. True means left, false means right
     */
    constructor(
            _left: BinaryTree<T> | T, 
            _right: BinaryTree<T> | T,
            _split: (val: T) => boolean
        ) {
        this.left = _left;
        this.right = _right;
        this.split = _split;
    }

    /**
     * Finds the leaf that val belongs to based on the split function
     * @param val the value to search for
     * @returns the relevant leaf
     */
    traverse(val: T): T {
        const rel: BinaryTree<T> | T = this.split(val) ? this.left : this.right;
        if (rel instanceof BinaryTree<T>) {
            return rel.traverse(val);
        }
        return rel;
    }
}