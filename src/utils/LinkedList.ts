class ListNode<T> {
    prev: ListNode<T> | undefined;
    val: T;
    next: ListNode<T> | undefined;

    /**
     * One node in a doubly-linked list
     * @param _val the value of the node
     * @param _prev the previous node
     * @param _next the next node
     */
    constructor(_val: T, _prev?: ListNode<T>, _next?: ListNode<T>) {
        this.prev = _prev;
        this.val = _val;
        this.next = _next;
    }
}

export class List<T> {
    private _length: number;
    private _head: ListNode<T> | undefined;
    private _tail: ListNode<T> | undefined;

    /**
     * A doubly linked list capable of pushing and popping
     * from the left and right
     * @param initials optional iterable of initial values
     */
    constructor(initials?: Iterable<T>) {
        this._length = 0;
        this._head = undefined;
        this._tail = undefined;

        if (typeof initials !== 'undefined') {
            for (const item of initials) {
                this.addRight(item);
            }
        }
    }

    get length() {
        return this._length;
    }

    /**
     * Should be called when the first item is added to the list
     * @param val the data to add
     */
    private firstNode(val: T) {
        const newNode = new ListNode<T>(val);
        this._head = newNode;
        this._tail = newNode;
    }

    /**
     * Adds an item to the end of the list
     * @param val the data to add
     */
    addRight(val: T) {
        if (typeof this._head === 'undefined') {
            this.firstNode(val);
        } else {
            if (typeof this._tail === 'undefined') {
                throw new Error('Internal error: tail is undefined when head is not.');
            }

            const newNode = new ListNode<T>(val, this._tail);
            this._tail.next = newNode;
            this._tail = newNode;

            if (typeof this._head.next === 'undefined') {
                this._head.next = newNode;
            }
        }

        this._length++;
    }

    /**
     * Adds an item to the start of the list
     * @param val the data to add
     */
    addLeft(val: T) {
        if (typeof this._tail === 'undefined') {
            this.firstNode(val);
        } else {
            if (typeof this._head === 'undefined') {
                throw new Error('Internal error: head is undefined when tail is not.');
            }

            const newNode = new ListNode<T>(val, undefined, this._head);
            this._head.prev = newNode;
            this._head = newNode;

            if (typeof this._tail.prev === 'undefined') {
                this._tail.prev = newNode;
            }
        }

        this._length++;
    }

    /**
     * Removes an element from the start of the list and returns it
     * @returns the removed element
     */
    popLeft(): T {
        if (typeof this._head === 'undefined') {
            throw new Error('List.popLeft: empty list');
        } else {
            const res = this._head.val;
            if (typeof this._head.next === 'undefined') {
                this._head = undefined;
                this._tail = undefined;
            } else {
                this._head = this._head.next;
                this._head.prev = undefined;
            }

            this._length--;
            return res;
        }
    }

    /**
     * Removes an element from the end of the list and returns it
     * @returns the removed element
     */
    popRight(): T {
        if (typeof this._tail === 'undefined') {
            throw new Error('List.popRight: empty list');
        } else {
            const res = this._tail.val;
            if (typeof this._tail.prev === 'undefined') {
                this._head = undefined;
                this._tail = undefined;
            } else {
                this._tail = this._tail.prev;
                this._tail.next = undefined;
            }

            this._length--;
            return res;
        }
    }

    /**
     * Returns whatever the first value is without removing it
     * @returns the item at the front of the list
     */
    peekLeft(): T {
        if (typeof this._head === 'undefined') {
            throw new Error('List.peekLeft: empty list');
        } else {
            return this._head.val;
        }
    }

    /**
     * Returns whatever the last value is without removing it
     * @returns the item at the end of the list
     */
    peekRight(): T {
        if (typeof this._tail === 'undefined') {
            throw new Error('List.peekRight: empty list');
        } else {
            return this._tail.val;
        }
    }

    [Symbol.iterator]() {
        let current = this._head;

        return {
            next: () => {
                if (typeof current === 'undefined') return { done: true };
                const res = current.val;
                current = current.next;
                return { value: res };
            }
        };
    }

    /**
     * Allows the list to be converted to a readable string
     * @returns a string printout of the list
     */
    toString(): string {
        return `(${[...this].join(', ')})`;
    }
}

