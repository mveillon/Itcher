export const usingNode = (): boolean => {
    return (
        typeof process !== 'undefined' &&
        process.release.name.search(/node|io.js/) !== -1
    );
}