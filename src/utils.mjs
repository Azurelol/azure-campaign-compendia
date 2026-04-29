const {api, fields, handlebars} = foundry.applications;

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

export const Utils = Object.freeze({
    renderTemplate,
})
