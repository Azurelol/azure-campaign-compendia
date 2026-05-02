/**
 * @typedef DocumentImageOptions
 * @property {String} type
 * @property {String} label
 * @property {String} classes
 * @property {'xs'|'s'|'m'|'l'|'xl'} size
 */

import {moduleTemplatePath, Utils} from "./utils.mjs";
import {Constants} from "./constants.mjs";

/**
 * @param {Object} document
 * @param {DocumentImageOptions} options
 * @returns {Handlebars.SafeString}
 */
function documentAnchor(document, options) {
    if (!document) {
        console.warn(`Missing document information for rendering. Ignoring...`);
        return '';
    }

    if (options.hash) {
        options = options.hash;
    }

    const size = options.size ?? 's';
    const type = options.type ?? "Item";
    const template = Handlebars.partials[moduleTemplatePath('partials/document-anchor')];
    const html =
        typeof template === 'function'
            ? template({
                name: document.name,
                uuid: document.uuid,
                id: document.id,
                img: document.img,
                pack: document.pack,
                type: type,
                size: size,
                classes: options?.classes,
            })
            : '';
    return new Handlebars.SafeString(html);
}

export const ACHandlebars = Object.freeze({
    loadTemplates: async () => {
        return foundry.applications.handlebars.loadTemplates([
            moduleTemplatePath('partials/document-anchor'),
        ]);
    },
    registerHelpers: () => {
        Handlebars.registerHelper('accFormOptions', function (constant) {
            const record = Utils.getProperty(Constants, constant);
            const options = Utils.getFormSelectOptions(record);
            return options;
        });
        Handlebars.registerHelper('accDocumentAnchor', documentAnchor);
        Handlebars.registerHelper('accIconClass', function (icon) {
            if (!icon) {
                return '';
            }
            return Constants.icons[icon];
        });
    }
});
