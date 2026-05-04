export class HTMLUtils {
    constructor() {
        throw new Error("This is a static class and not meant to be instantiated.");
    }

    /**
     * @param fn A function
     * @param ms The time in milliseconds.
     * @returns {(function(...[*]): void)|*}
     */
    static debounce(fn, ms) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        }
    }

}
