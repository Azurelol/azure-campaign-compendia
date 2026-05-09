import ACApplication from "./application.mjs";
import {moduleTemplatePath} from "../utils/utils.mjs";
import {StoryKitSheet} from "../documents/story-kit-sheet.mjs";
import {StoryKitBrowser} from "./kit-browser.mjs";
import {Settings} from "../utils/settings.mjs";
import {ScreenDataModel} from "../documents/screen-data-model.mjs";
import {StringUtils} from "../utils/string-utils.mjs";
import {Dialogs} from "../dialogs.mjs";

/**
 * @property
 */
export class GMScreen extends ACApplication {

    /**
     * @inheritDoc
     * @override
     */
    static DEFAULT_OPTIONS = {
        window: {
            title: 'GM Screen',
            resizable: true,
            contentClasses: ['acc-screen'],
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
        },
        position: {width: 1024, height: 768},
        actions: {
            viewStoryKit: this.#viewStoryKit,
            editStoryKit: this.#editStoryKit,
            createPoll: this.#createPoll,
            pinObject: this.#pinObject,
            addNote: this.#addNote,
            editNote: this.#editNote,
            removeNote: this.#removeNote
        },
    };

    // TODO: Add widgets

    /**
     * @override
     */
    static PARTS = {
        nav: {
            template: moduleTemplatePath('applications/nav'),
        },
        widgets: {
            template: moduleTemplatePath(`applications/screen/widgets`),
        },
        overview: {
            template: moduleTemplatePath('applications/screen/overview'),
        },
        kits: {
            template: moduleTemplatePath('applications/screen/kits'),
        },
        planner: {
            template: moduleTemplatePath('applications/screen/planner'),
        },
    };

    /** @override
     * @type Record<ApplicationTab>
     * */
    static TABS = {
        primary: {
            tabs: [
                {id: 'overview', label: 'Overview', icon: 'ra ra-double-team'},
                {id: 'kits', label: 'Story Kits', icon: 'fas fa-book'},
                {id: 'planner', label: 'Planner', icon: 'fas fa-notebook'},
            ],
            initial: 'overview',
        },
    };


    /** @type StoryKitBrowser */
    #kitBrowser;

    /** @type JournalEntryPageData[] **/
    #kits;

    constructor(options = {}) {
        super(options)
        this.#kitBrowser = new StoryKitBrowser(this);
    }

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        return context;
    }

    /** @inheritdoc */
    async _preparePartContext(partId, ctx, options) {
        const context = await super._preparePartContext(partId, ctx, options);
        // IMPORTANT: Set the active tab
        if (partId in context.tabs) context.tab = context.tabs[partId];
        switch (partId) {
            case 'tabs':
                context.tabs = this._prepareTabs('primary');
                break;

            case 'overview': {
                context.pinned = await this.getPinnedObjects();
            }
                break;

            case 'planner': {
                {
                    context.data = await this.loadData();

                }
                break;
            }

            case 'kits':
                context.kits = await this.getKits();
                context.pinned = await this.getPinnedObjects();
                context.browser = this.#kitBrowser;
                break;
        }
        return context;
    }

    /**
     * Attach event listeners to rendered template parts.
     * @param {string} partId The id of the part being rendered
     * @param {HTMLElement} html The rendered HTML element for the part
     * @param {ApplicationRenderOptions} options Rendering options passed to the render method
     * @protected
     */
    _attachPartListeners(partId, html, options) {
        super._attachPartListeners(partId, html, options);
        switch (partId) {
            case 'kits':
                this.#kitBrowser.attachListeners(html);
                break;
        }
    }

    /**
     * @returns {Promise<ScreenDataModel>}
     */
    async loadData() {
        let data = await Settings.get(Settings.keys.screenData);
        if (data === undefined) {
            data = new ScreenDataModel();
            await this.saveData(data);
        }
        return data;
    }

    /**
     * @param {ScreenDataModel} data
     * @returns {Promise<void>}
     */
    async saveData(data) {
        await Settings.set(Settings.keys.screenData, data);
        return this.refresh();
    }

    /**
     * @returns {Promise<JournalEntryPageData[]>}
     * @remarks To make sure the latest is always used.
     */
    async getKits() {
        this.#kits = await StoryKitSheet.getStoryKits();
        return this.#kits;
    }

    /**
     * @typedef PinnedObject
     * @property {String} type
     * @property {String} id
     * @property {String} object
     */

    /**
     * @returns {Promise<Record<string, PinnedObject>>}>}
     */
    async getPinnedObjects() {
        /** @type PinnedObject **/
        let objects = {};
        const data = await this.loadData();
        const kits = await this.getKits();
        for (const pin of data.pinned) {
            switch (pin.type) {
                case 'kit': {
                    const object = kits.find(p => p.id === pin.id);
                    if (object) {
                        objects[pin.id] = {
                            type: pin.type,
                            id: pin.id,
                            object: object,
                        };
                    }
                }
                    break;
            }
        }

        return objects;
    }


    // TODO: More themes?
    /**
     * @returns {String}
     */
    get theme() {
        return 'classic';
    }

    /**
     * @returns {JournalEntryPageData[]}
     */
    get kits() {
        return this.#kits;
    }

    /** @inheritDoc */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        // Set current theme classes
        const windowContent = this.element.querySelector('.window-content');
        if (!windowContent) return;
        windowContent.classList.forEach((cls) => {
            if (cls.startsWith('theme-')) windowContent.classList.remove(cls);
        });
        const theme = this.theme;
        windowContent.classList.add(`theme-${theme}`);
    }

    /** @inheritDoc */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.#kitBrowser.refresh(this.element);
    }

    /**
     * @returns {Promise<*>}
     */
    async refresh() {
        return this.render(true);
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #refresh(event, target) {
        return this.refresh();
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #viewStoryKit(event, target) {
        const {id} = target.dataset;
        if (this.#kits) {
            const kit = this.#kits.find(k => k.id === id);
            if (kit) {
                const sheetClass = kit._getSheetClass();
                new sheetClass({document: kit, mode: "view"}).render(true);
            }
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #editStoryKit(event, target) {
        const {id} = target.dataset;
        if (this.#kits) {
            const kit = this.#kits.find(k => k.id === id);
            if (kit) {
                const sheetClass = kit._getSheetClass();
                new sheetClass({document: kit, mode: "edit"}).render(true);
            }
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #createPoll(event, target) {
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #addNote(event, target) {
        const data = await this.loadData();
        let note = {
            id: StringUtils.randomID(),
            text: ""
        };

        const confirm = await GMScreen.#inspectNote(note);
        if (confirm) {
            if (!data.notes) {
                data.notes = [];
            }
            data.notes.push(note);
            await this.saveData(data);
            ui.notifications.info(`Added GM screen note.`)
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #editNote(event, target) {
        const {index} = target.dataset;
        const data = await this.loadData();
        const note = data.notes[index];
        if (note) {
            const confirm = await GMScreen.#inspectNote(note);
            if (confirm) {
                data[index] = note;
                await this.saveData(data);
                ui.notifications.info(`Edited GM screen note.`)
            }
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #removeNote(event, target) {
        const {index} = target.dataset;
        const data = await this.loadData();
        const note = data.notes[index];
        if (note) {
            data.notes.splice(Number.parseInt(index), 1);
            await this.saveData(data);
            ui.notifications.info(`Removed GM screen note.`)
        }
    }

    /**
     * @param {ScreenNoteData} note
     * @returns {Promise<Boolean>}
     */
    static async #inspectNote(note) {
        const confirm = await Dialogs.inspect('Edit Note', note, [{
            label: "Text",
            path: 'text',
            type: 'string',
            options: {
                style: 'textarea'
            }
        }]);
        return confirm && note.text;
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #pinObject(event, target) {
        const {id, type} = target.dataset;
        const data = await this.loadData();

        const currentIndex = data.pinned.findIndex(p => p.id === id);
        if (currentIndex >= 0) {
            data.pinned.splice(currentIndex, 1);
            ui.notifications.info(`Removed pin for ${type} object ${id}`);
        } else {
            data.pinned.push({
                type: type,
                id: id,
            })
            ui.notifications.info(`Added pin for ${type} object ${id}`);
        }

        await this.saveData(data);
        this.render(true);
    }
}
