export class StringUtils {

    constructor() {
        throw new Error("This is a static class and not meant to be instantiated.");
    }

    /**
     * Converts a kebab-case, camelCase, snake_case, or PascalCase string into a
     * human-readable label with capitalized words.
     * @param {string} value
     * @returns {string}
     */
    static humanize(value) {
        return (
            value
                // Insert space before uppercase letters in camelCase/PascalCase
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                // Replace kebab and snake separators with spaces
                .replace(/[-_]+/g, ' ')
                // Capitalize the first letter of each word
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .trim()
        );
    }

    /**
     * Localizes a given key using the game's i18n system.
     * @param {string} key - The localization key to look up.
     * @param {Object} [data] - Optional interpolation data for formatted strings.
     * @returns {string} The localized string, or an empty string if key is absent.
     */
    static localize(key, data) {
        if (!key) return '';
        if (data) return game.i18n.format(key, data) || key;
        return (typeof key === 'string' ? game.i18n.localize(key) : key.toString()) || key;
    }

    /**
     * @returns {String} a 16-char random hex string e.g. "a3f8c2e1b4d7f9a2"
     */
    static randomID() {
        return foundry.utils.randomID();
    }

    /**
     * @param {String} text
     * @param {EnrichmentOptions} options
     * @returns {Promise<string>}
     */
    static async enrichText(text, options) {
        return TextEditor.implementation.enrichHTML(text, options);
    }
}
