import ACApplication from "./application.mjs";
import {moduleTemplatePath, Utils} from "../utils/utils.mjs";
import {StoryKitSheet} from "../documents/story-kit-sheet.mjs";
import {StoryKitBrowser} from "./kit-browser.mjs";
import {Settings} from "../utils/settings.mjs";
import {ScreenDataModel} from "../documents/screen-data-model.mjs";
import {StringUtils} from "../utils/string-utils.mjs";
import {Dialogs} from "../dialogs.mjs";
import Sortable from "../../libs/sortable.esm.js";
import {ObjectUtils} from "../utils/object-utils.mjs";

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
        position: {width: 850, height: 800},
        actions: {
            viewStoryKit: this.#viewStoryKit,
            editStoryKit: this.#editStoryKit,
            createPoll: this.#createPoll,
            toggleEvent: this.#toggleEvent,

            addObject: this.#addObject,
            editObject: this.#editObject,
            removeObject: this.#removeObject,
            pinObject: this.#pinObject,
            expandObject: this.#expandObject,
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

    async _onDropJournalEntry(event, entry) {
        await super._onDropJournalEntry(event, entry);
        return this.addDocumentReference(entry, 'JournalEntry');
    }

    /** @override */
    async _prepareContext(options) {
        return await super._prepareContext(options);
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
                const data = await this.loadData();
                context.data = data;
                context.events = data.events;
                context.pinned = await this.getPinnedObjects();
            }
                break;

            case 'planner': {
                {
                    context.data = await this.loadData();
                    context.pinned = await this.getPinnedObjects();
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
    async _attachPartListeners(partId, html, options) {
        await super._attachPartListeners(partId, html, options);
        switch (partId) {
            case 'kits':
                await this.#kitBrowser.attachListeners(html);
                break;

            case 'planner':
                const screen = this;
                Sortable.create(html.querySelector('.events .pending.acc-list'), {
                    onEnd: async (evt) => {
                        ui.notifications.info(`Moved event from ${evt.oldIndex} to ${evt.newIndex}`);
                        await screen.swapArrayElement('events.pending', evt.oldIndex, evt.newIndex);
                    }
                });

                Sortable.create(html.querySelector('.events .resolved.acc-list'), {
                    onEnd: async (evt) => {
                        ui.notifications.info(`Moved event from ${evt.oldIndex} to ${evt.newIndex}`);
                        await screen.swapArrayElement('events.resolved', evt.oldIndex, evt.newIndex);
                    }
                });

                Sortable.create(html.querySelector('.notes .acc-list'), {
                    onEnd: async (evt) => {
                        ui.notifications.info(`Moved note from ${evt.oldIndex} to ${evt.newIndex}`);
                        await screen.swapArrayElement('notes', evt.oldIndex, evt.newIndex);
                    }
                });
                break;
        }
    }

    async swapArrayElement(propertyPath, oldIndex, newIndex) {
        const data = await this.loadData();
        const array = Utils.getProperty(data, propertyPath);
        ObjectUtils.swapArrayElements(array, oldIndex, newIndex);
        await this.saveData(data);
    }

    /**
     * @param {Object} document
     * @param {String} type
     * @returns {Promise<void>}
     */
    async addDocumentReference(document, type) {
        /** @type ScreenDocumentReference **/
        const reference = {
            id: StringUtils.randomID(),
            type: type,
            uuid: document.uuid,
            name: document.name,
            img: document.img,
        }
        const data = await this.loadData();
        if (!data.documents) {
            data.documents = [];
        }
        data.documents.push(reference);
        ui.notifications.info(`Added document reference for ${reference.name}`)
        await this.saveData(data);
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
            // TODO: Add preview text field, custom for each
            switch (pin.type) {
                case 'kit': {
                    const object = kits.find(p => p.id === pin.id);
                    if (object) {
                        objects[pin.id] = {
                            type: pin.type,
                            id: pin.id,
                            object: object,
                            preview: object.system.introduction,
                        };
                    }
                    break;
                }

                case 'note': {
                    const object = data.notes.find(p => p.id === pin.id);
                    if (object) {
                        objects[pin.id] = {
                            type: pin.type,
                            id: pin.id,
                            preview: object.text,
                            object: object,
                            cssClass: '--note'
                        };
                    }
                    break;
                }
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
    static async #toggleEvent(event, target) {
        const {id, status, index} = target.dataset;
        const data = await this.loadData();
        const _index = Number.parseInt(index);
        switch (status) {
            case 'pending': {
                const event = data.events.pending[_index];
                if (event) {
                    data.events.pending.splice(_index, 1);
                    data.events.resolved.push(event);
                    await this.saveData(data);
                    ui.notifications.info(`Resolved event.`)
                }
            }
                break;

            case 'resolved': {
                const event = data.events.resolved[_index];
                if (event) {
                    data.events.resolved.splice(_index, 1);
                    data.events.pending.push(event);
                    await this.saveData(data);
                    ui.notifications.info(`Changed event back to pending.`)
                }
            }
                break;
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #addObject(event, target) {
        const {type} = target.dataset;
        const data = await this.loadData();
        switch (type) {
            case 'kit':
                break;

            case 'event': {
                /** @type ScreenEventData **/
                let event = {
                    id: StringUtils.randomID(),
                    title: "",
                    details: "",
                    status: 'pending'
                };
                const confirm = await GMScreen.#inspectEvent(event);
                if (confirm) {
                    if (!data.events.pending) {
                        data.events = {
                            pending: [],
                            resolved: []
                        }
                    }
                    data.events.pending.push(event);
                    await this.saveData(data);
                    ui.notifications.info(`Added pending event.`)
                }
            }
                break;

            case 'note': {
                /** @type ScreenNoteData **/
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
                break;
        }

    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #removeObject(event, target) {
        const {index, type, status} = target.dataset;
        const data = await this.loadData();
        switch (type) {
            case 'note': {
                const note = data.notes[index];
                if (note) {
                    data.notes.splice(Number.parseInt(index), 1);
                    await this.saveData(data);
                    ui.notifications.info(`Removed note.`)
                }
            }
                break;

            case 'event': {
                switch (status) {
                    case 'pending': {
                        const event = data.events.pending[index];
                        if (event) {
                            data.events.pending.splice(Number.parseInt(index), 1);
                            await this.saveData(data);
                            ui.notifications.info(`Removed pending event.`)
                        }
                    }
                        break;

                    case 'resolved': {
                        const event = data.events.resolved[index];
                        if (event) {
                            data.events.resolved.splice(Number.parseInt(index), 1);
                            await this.saveData(data);
                            ui.notifications.info(`Removed resolved event.`)
                        }
                    }
                        break;
                }

            }
                break;

            case 'document': {
                const reference = data.documents[index];
                if (reference) {
                    data.documents.splice(Number.parseInt(index), 1);
                    await this.saveData(data);
                    ui.notifications.info(`Removed document reference.`)
                }
            }
                break;
        }
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #editObject(event, target) {
        const {index, type} = target.dataset;
        const data = await this.loadData();
        switch (type) {
            case 'note': {
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
                break;

            case 'event': {
                const event = data.events.pending[index];
                if (event) {
                    const confirm = await GMScreen.#inspectEvent(event);
                    if (confirm) {
                        data[index] = event;
                        await this.saveData(data);
                        ui.notifications.info(`Edited GM screen event.`)
                    }
                }
                break;
            }
        }
    }

    /**
     * @param {ScreenEventData} event
     * @returns {Promise<Boolean>}
     */
    static async #inspectEvent(event) {
        /** @type InspectorProperty[] **/
        const properties = [
            {
                label: "Title",
                path: 'title',
                type: 'string',
            },
            {
                label: "Details",
                path: 'details',
                type: 'string',
                options: {
                    style: 'textarea'
                }
            }
        ];
        const confirm = await Dialogs.inspect('Edit Event', event, properties);
        return confirm && event.title;
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
    }

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #expandObject(event, target) {
        const {id, type, index} = target.dataset;

        switch (type) {
            case 'event': {
                const data = await this.loadData();
                const event = data.events.pending[index];
                if (event) {
                    await Dialogs.popupText(event.details)
                }
            }
                break;

            case 'kit': {
                if (this.#kits) {
                    const kit = this.#kits.find(k => k.id === id);
                    if (kit) {
                        const sheetClass = kit._getSheetClass();
                        new sheetClass({document: kit, mode: "view"}).render(true);
                    }
                }
                break;
            }

            case 'note': {
                const data = await this.loadData();
                const note = data.notes[index];
                if (note) {
                    await Dialogs.popupText(note.text)
                }

                break;
            }


        }


    }
}
