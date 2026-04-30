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
 * @type {string} The unique module identifier used in the package and throughout.
 */
export const moduleId = "azure-campaign-compendia";

/**
 * @param {String} path
 * @returns {string}
 * @remarks File extension already included.
 */
export function moduleTemplatePath(path) {
    return `modules/${moduleId}/templates/${path}.hbs`;
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
 * @returns {Promise<CompendiumIndexEntry[]>}
 */
async function getDocumentsOfType(type, cached = true) {
    if (cached && documentCache[type]) return documentCache[type];

    const worldDocuments = collectionMap[type]?.contents ?? [];

    const packDocuments = (
        await Promise.all(
            game.packs
                .filter(pack => pack.documentName === type)
                .map(pack => pack.getIndex())
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

export const Utils = Object.freeze({
    renderTemplate,
    getPackEntries,
    getDocumentsOfType
})
