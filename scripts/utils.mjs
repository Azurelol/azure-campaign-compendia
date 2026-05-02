// This module should have no imports beyond constants
import {moduleId} from "./constants.mjs";

const {api, fields, handlebars} = foundry.applications;

/**
 * @typedef CompendiumIndexEntry
 * @property {string} _id            Document ID within the compendium
 * @property {string} uuid           Fully-qualified UUID
 * @property {string} name           Document name
 * @property {string|null} img       Image path
 * @property {string} type           Document subtype
 * @property {string} pack           Compendium collection key (e.g. "fu.items")
 * @property {Object} [system]       Partial system data (indexed fields only)
 */

/**
 * @typedef CompendiumSourceInfo
 * @property {String} id The package id.
 * @property {'system'|'module'|'world'}  type
 * @property {String} title Human readable name.
 */

/**
 * @typedef JournalEntryPageData
 * @property {string|null} _id            The _id which uniquely identifies this JournalEntryPage embedded document.
 * @property {string} name                The text name of this page.
 * @property {string} type                The type of this page.
 * @property {JournalEntryPageTitleData} title  Data that control's the display of this page's title.
 * @property {JournalEntryPageImageData} image  Data particular to image journal entry pages.
 * @property {JournalEntryPageTextData} text    Data particular to text journal entry pages.
 * @property {JournalEntryPageVideoData} video  Data particular to video journal entry pages.
 * @property {string} [src]               The URI of the image or other external media to be used for this page.
 * @property {object} system              System-specific data.
 * @property {string} [category]          An optional category that this page belongs to.
 * @property {number} sort                The numeric sort value which orders this page relative to its siblings.
 * @property {object} [ownership]         An object which configures the ownership of this page.
 * @property {DocumentFlags} flags        An object of optional key/value flags
 * @property {DocumentStats} _stats       An object of creation and access information
 */

/**
 * @param {String} path
 * @returns {string}
 * @remarks File extension already included.
 */
export function moduleTemplatePath(path) {
    return `modules/${moduleId}/templates/${path}.hbs`;
}

/**
 * @param {String} name
 * @returns {string}
 */
export function modulePrefixed(name) {
    return `${moduleId}.${name}`;
}

/**
 * @description Translates a relative path to a system asset path
 * @param {string} path - A path relative to the root of this repository
 * @returns {string} The path relative to the Foundry data folder
 */
export function moduleAssetPath(path) {
    return `systems/${moduleId}/styles/static/${path}`;
}

/**
 * @param {String} templatePath The relative template path.
 * @param {Object} context Used by the template
 * @returns {Promise<*>}
 */
async function renderTemplate(templatePath, context) {
    return await handlebars.renderTemplate(templatePath, context);
}

/**
 * @param {String} name
 * @param {String} module
 * @returns {Promise<CompendiumIndexEntry[]>}
 */
async function getPackEntries(name, module = moduleId) {
    const pack = game.packs.get(`${module}.${name}`);
    return await pack.getIndex();
}

/**
 * @param {Object} obj The object to resolve the property from
 * @param {String} path The path to the property, in dot notation
 * @returns {undefined|*} The value of the property
 */
function getProperty(obj, path) {
    return foundry.utils.getProperty(obj, path);
}

/**
 * @param {Object} obj The object to set the property on
 * @param {String} path The path to the property, in dot notation
 * @param {*} value The value to set on the property.
 */
function setProperty(obj, path, value) {
    return foundry.utils.setProperty(obj, path, value);
}

const collectionMap = {
    Actor: game.actors,
    Item: game.items,
    JournalEntry: game.journal,
};

/**
 * @type {Record<String, CompendiumIndexEntry[]>}
 */
let documentCache = {};

/**
 * @param {"Actor"|"Item"|"JournalEntry"} type
 * @param {Boolean} cached
 * @param {string[]} fields
 * @returns {Promise<CompendiumIndexEntry[]>}
 */
async function getDocumentsOfType(type, cached = true, fields = []) {
    if (cached && documentCache[type]) return documentCache[type];

    const worldDocuments = collectionMap[type]?.contents ?? [];

    const packDocuments = (
        await Promise.all(
            game.packs
                .filter(pack => pack.documentName === type)
                .map(pack => pack.getIndex({
                    fields: ['name', 'img', 'type'].concat(fields),
                }))
        )
    ).flatMap(index => index.contents);

    const seen = new Set();
    documentCache[type] = [...worldDocuments, ...packDocuments].filter(doc => {
        if (seen.has(doc.uuid)) return false;
        seen.add(doc.uuid);
        return true;
    });

    return documentCache[type];
}

/**
 * @desc Recursively merges source into target, mutating target in place.
 * @param {Object} target The object being merged into.
 * @param {Object} source
 * @returns {boolean} Whether any changes were made.
 */
function mergeRecursive(target, source) {
    let changed = false;

    for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (!(key in target)) {
                target[key] = {};
                changed = true;
            }
            if (mergeRecursive(target[key], value)) changed = true;
        } else if (!(key in target) || target[key] !== value) {
            target[key] = value;
            changed = true;
        }
    }

    return changed;
}

/**
 * Localizes a given key using the game's i18n system.
 * @param {string} key - The localization key to look up.
 * @param {Object} [data] - Optional interpolation data for formatted strings.
 * @returns {string} The localized string, or an empty string if key is absent.
 */
function localize(key, data) {
    if (!key) return '';
    if (data) return game.i18n.format(key, data) || key;
    return (typeof key === 'string' ? game.i18n.localize(key) : key.toString()) || key;
}

/**
 * @typedef FormSelectOption
 * @property {string} [value]
 * @property {string} [label]
 * @property {string} [group]
 * @property {boolean} [disabled]
 * @property {boolean} [selected]
 * @property {boolean} [rule]
 * @property {Record<string, string>} [dataset]
 */

/**
 * @param {Record<String, String>} record
 * @returns {FormSelectOption[]}
 * @remarks To be used with specific records.
 */
function getFormSelectOptions(record) {
    return Object.entries(record).map(([key, value]) => ({
        label: localize(value),
        value: key,
    }));
}

export const Utils = Object.freeze({
    renderTemplate,
    getProperty,
    setProperty,
    mergeRecursive,
    getPackEntries,
    getDocumentsOfType,
    getFormSelectOptions
})
