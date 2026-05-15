export class ObjectUtils {

    /**
     * @desc Swaps two array elements.
     * @param {*[]} array
     * @param {Number} a
     * @param {Number} b
     * @returns {*}
     */
    static swapArrayElements(array, a, b) {
        [array[a], array[b]] = [array[b], array[a]];
        return array;
    }

    constructor() {
        throw new Error("This is a static class and not meant to be instantiated.");
    }
}
