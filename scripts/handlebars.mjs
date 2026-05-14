/**
 * @typedef DocumentImageOptions
 * @property {String} type
 * @property {String} label
 * @property {String} classes
 * @property {'xs'|'s'|'m'|'l'|'xl'} size
 */

import {moduleTemplatePath, Utils} from "./utils/utils.mjs";
import {Constants} from "./constants.mjs";
import {StringUtils} from "./utils/string-utils.mjs";

export const ACHandlebars = Object.freeze({
    loadTemplates: async () => {
        return foundry.applications.handlebars.loadTemplates([
            moduleTemplatePath('partials/document-anchor'),
            moduleTemplatePath('components/tag-picker'),
        ]);
    },
    setupComponent: {
        tagPicker: setupTagPicker
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
        Handlebars.registerHelper('accConcat', (...args) => {
            args.pop();
            return args.join('');
        });
        Handlebars.registerHelper('accTagPicker', tagPicker);
        Handlebars.registerHelper('accHumanize', function (str) {
            if (str && typeof str === 'string') {
                return StringUtils.humanize(str);
            }
            return str;
        });
        Handlebars.registerHelper('accContains', function (collection, item) {
            if (Array.isArray(collection)) {
                return collection.includes(item);
            }
            if (collection instanceof Map) {
                return collection.has(item);
            }
            if (collection instanceof Set) {
                return collection.has(item);
            }
            if (collection instanceof Object) {
                return item in collection;
            }
            return false;
        });
    }
});


/**
 * @param {String} label
 * @param {*[]} tags
 * @param {*[]} selected
 * @param {Object} options
 * @returns {Handlebars.SafeString}
 */
function tagPicker(label, tags, selected, options) {
    if (options.hash) {
        options = options.hash;
    }

    const template = Handlebars.partials[moduleTemplatePath('components/tag-picker')];
    const html =
        typeof template === 'function'
            ? template({
                label: label,
                tags: tags,
                selected: selected,
            })
            : '';
    return new Handlebars.SafeString(html);
}


/**
 * @callback TagPickerUpdateCallback
 * @param {string} id - The id of the picker that was updated, from `data-picker-id`
 * @param {string} value - The tag value that was toggled, from `data-tag`
 * @param {boolean} active - Whether the tag is now active or not
 */

/**
 * @param {HTMLElement} html The root element to search for tag pickers
 * @param {object} options
 * @param {String[]} [options.tags] The list of currently selected tags.
 * @param {TagPickerUpdateCallback} [options.onUpdate] - Callback invoked when a tag is toggled
 */
async function setupTagPicker(html, options) {
    html.querySelectorAll('.acc-tag__picker').forEach(picker => {
        const toggle = picker.querySelector('.acc-tag__picker__toggle');
        const popup = picker.querySelector('.acc-tag__picker__popup');
        const count = toggle.querySelector('.acc-tag__picker__count');

        // Initialize count
        const initialCount = popup.querySelectorAll('.acc-tag__filter.active').length;
        count.textContent = `${initialCount}`;
        count.hidden = initialCount === 0;

        // Show tag picker on click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close any other open pickers first
            html.querySelectorAll('.acc-tag__picker__popup.--open').forEach(p => {
                if (p !== popup) p.classList.remove('--open');
            });
            popup.classList.toggle('--open');
        });

        // Toggle tag on click
        popup.querySelectorAll('.acc-tag__filter').forEach((tag) => {
            tag.addEventListener('click', () => {
                const value = tag.dataset.tag;
                tag.classList.toggle('active');

                // Update count badge
                const activeTags = popup.querySelectorAll('.acc-tag__filter.active').length;
                count.textContent = `${activeTags}`;
                count.hidden = activeTags === 0;

                options.onUpdate?.(picker.id, value, tag.classList.contains('active'));
            });
        });
    });

    // Close all pickers when clicking outside
    document.addEventListener('click', () => {
        html.querySelectorAll('.acc-tag__picker__popup.--open').forEach(p => {
            p.classList.remove('--open');
        });
    });
}


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
