/**
 * Returns a random integer in between min (inclusive) and max (exclusive)
 * @param min the lower bound
 * @param max the upper bound. If not provided, the number will be between 0 and min
 * @returns a random integer in the provided range
 */
 export const randInt = (min: number, max?: number): number => {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min) + min - 1e-9); // 1e-9 is just in case Math.random returns 1.0
}

/**
 * Returns a randomly selected element of the array
 * @param arr the array to select an element from 
 * @param ws optional cumulative weights for each element in arr
 * @returns one choice from the array
 */
export const choice = <T>(arr: T[], ws?: number[]): T => {
    if (arr.length === 0) {
        throw new Error('Empty array not allowed in choice function');
    }

    if (typeof ws === 'undefined') {
        ws = [];
        for (let i = 0; i < arr.length; i++) {
            ws.push(i);
        }
    }

    if (ws.length !== arr.length) {
        throw new Error(
            `Incompatible sizes between ${arr} and ${ws}: ${arr.length} vs ${ws.length}`
        );
    }

    const seed = Math.random() * ws[ws.length - 1];
    for (let i = 0; i < arr.length; i++) {
        if (ws[i] > seed) {
            return arr[i];
        }
    }
    return arr[arr.length - 1];
}

/**
 * Shuffles the array in place, using Fisher-Yates
 * O(arr.length)
 * @param arr the array to shuffle
 */
export const shuffle = <T>(arr: T[]) => {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = randInt(i + 1);
        var temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
}

/**
 * Returns n randomly selected elements from arr
 * O(arr.length)
 * @param arr the array to select the elements from
 * @param n how many elements to select
 * @returns n random elements from arr
 */
export const choices = <T>(arr: T[], n: number): T[] => {
    var arrCopy = [...arr];
    shuffle(arrCopy);
    return arrCopy.slice(0, n);
}
