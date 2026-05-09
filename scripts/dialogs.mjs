import {moduleTemplatePath, Utils} from "./utils/utils.mjs";

const {api, fields, handlebars} = foundry.applications;

/**
 * @typedef FormSelectOption
 * @property {string} [value]
 * @property {string} [label]
 * @property {string} [group]
 * @property {boolean} [disabled]
 * @property {boolean} [selected]
 * @property {boolean} [rule]
 * @property {String} img (Custom for PFU dialogs)
 * @property {Record<string, string>} [dataset]
 */

/**
 * @callback DialogV2ButtonCallback
 * @param {PointerEvent|SubmitEvent} event        The button click event, or a form submission event if the dialog was
 *                                                submitted via keyboard.
 * @param {HTMLButtonElement} button              If the form was submitted via keyboard, this will be the default
 *                                                button, otherwise the button that was clicked.
 * @param {DialogV2} dialog                       The DialogV2 instance.
 * @returns {Promise<any>}
 */

/**
 * @typedef DialogV2Button
 * @property {string} action                      The button action identifier.
 * @property {string} label                       The button label. Will be localized.
 * @property {string} [icon]                      FontAwesome icon classes.
 * @property {string} [class]                     CSS classes to apply to the button.
 * @property {Record<string, string>} [style]     CSS style to apply to the button.
 * @property {string} [type="submit"]             The button type.
 * @property {boolean} [disabled]                 Whether the button is disabled
 * @property {boolean} [default]                  Whether this button represents the default action to take if the user
 *                                                submits the form without pressing a button, i.e. with an Enter
 *                                                keypress.
 * @property {DialogV2ButtonCallback} [callback]  A function to invoke when the button is clicked. The value returned
 *                                                from this function will be used as the dialog's submitted value.
 *                                                Otherwise, the button's identifier is used.
 */

/**
 * @typedef SelectInputConfig
 * @property {FormSelectOption[]} options
 * @property {string[]} [groups]        An option to control the order and display of optgroup elements. The order of
 *                                      strings defines the displayed order of optgroup elements.
 *                                      A blank string may be used to define the position of ungrouped options.
 *                                      If not defined, the order of groups corresponds to the order of options.
 * @property {string} [blank]
 * @property {string} [valueAttr]       An alternative value key of the object passed to the options array
 * @property {string} [labelAttr]       An alternative label key of the object passed to the options array
 * @property {boolean} [localize=false] Localize value labels
 * @property {boolean} [sort=false]     Sort options alphabetically by label within groups
 * @property {"single"|"multi"|"checkboxes"} [type] Customize the type of select that is created
 */

const DIALOG_CLASSES = ['acc-form']

/**
 * @typedef AzureDialogOptions
 * @property title
 * @property message
 */

/**
 * @param {AzureDialogOptions} options
 * @returns {Promise<*|boolean|boolean>}
 */
async function confirm(options) {
    return foundry.applications.api.DialogV2.confirm({
        window: {
            title: options.title,
            icon: 'fas fa-comment',
        },
        classes: DIALOG_CLASSES,
        content: await Utils.renderTemplate(moduleTemplatePath('dialogs/common'), {
            message: options.message,
        }),
        rejectClose: false,
        yes: {
            label: 'FU.Confirm',
        },
        no: {
            label: 'FU.Cancel',
        },
    });
}

/**
 * @param {String} title
 * @param content
 * @param {Object} options
 * @returns {Promise<*>}
 */
async function input(title, content, options = {}) {
    const defaultOptions = {
        window: {title: title, icon: 'fas fa-comment'},
        content: content,
        classes: DIALOG_CLASSES,
        rejectClose: false,
        ok: {
            label: 'FU.Confirm',
        },
        actions: {
            // Image Picker: Browse
            browseImage: (event, target) => {
                const {name} = target.dataset;
                const imagePicker = event.currentTarget.querySelector('.image-picker');
                if (!imagePicker) {
                    return;
                }
                const preview = imagePicker.querySelector('img');
                const input = imagePicker.querySelector(`input[name="${name}"]`);
                new FilePicker({
                    type: 'image',
                    current: input?.value,
                    callback: (path) => {
                        if (input) {
                            input.value = path;
                            preview.src = path;
                        }
                    },
                }).render(true);
            },
            // Generic File
            browse: (event, target, dialog) => {
                const {name, type} = target.dataset;
                const input = event.currentTarget.querySelector(`input[name="${name}"]`);
                new FilePicker({
                    type: type,
                    current: input?.value,
                    callback: (path) => {
                        if (input) input.value = path;
                    },
                }).render(true);
            },
            toggleTag: (event, target) => {
                if (!options.context) {
                    return;
                }
                const {path, tag} = target.dataset;
                const tags = ObjectUtils.getProperty(options.context, path);
                if (!tags) {
                    return;
                }

                const index = tags.indexOf(tag);
                if (index === -1) {
                    tags.push(tag);
                    target.classList.add('active');
                } else {
                    tags.splice(index, 1);
                    target.classList.remove('active');
                }
            },
        },
    };
    Utils.mergeRecursive(defaultOptions, options);
    return await foundry.applications.api.DialogV2.input(defaultOptions);
}

/**
 * @param {String} title
 * @param {String} content
 * @param {Object} options
 * @returns {Promise}
 */
async function popout(title, content, options = {}) {
    const defaultOptions = {
        window: {title, icon: 'fas fa-eye', resizable: true},
        classes: DIALOG_CLASSES,
        rejectClose: false,
        content,
        buttons: [{label: 'Close', action: 'close'}],
    };
    Utils.mergeRecursive(defaultOptions, options);
    await foundry.applications.api.DialogV2.wait(defaultOptions);
}

/**
 * @typedef {'string'|'number'} InspectorPropertyType
 */

/**
 * @typedef InspectedPropertyOptions
 * @property {String} style
 */

/**
 * @typedef InspectorProperty
 * @property {String} label The display name of the property.
 * @property {String} path
 * @property {InspectorPropertyType} type
 * @property {InspectedPropertyOptions} options
 */

/**
 * @param {String} title
 * @param {Object} object
 * @param {InspectorProperty[]} properties
 * @returns {Promise<boolean>}
 */
async function inspect(title, object, properties) {
    const content = await Utils.renderTemplate(moduleTemplatePath('dialogs/inspector'), {
        object: object,
        properties: properties,
    });
    const options = {};
    const result = await input(title, content, options);
    return result !== undefined && result !== null;
}

export const Dialogs = {
    confirm,
    input,
    popout,
    inspect
};
