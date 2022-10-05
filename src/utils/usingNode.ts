/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

/**
 * Checks whether the code is running on the command line (true)
 * or through the browser (false)
 * @returns whether the code is running through node
 */
export const usingNode = (): boolean => {
    return (
        typeof process !== 'undefined' &&
        typeof process.release !== 'undefined' &&
        process.release.name.search(/node|io.js/) !== -1
    );
}