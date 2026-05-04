import ACApplication from "./application.mjs";
import {moduleTemplatePath} from "../utils/utils.mjs";
import {StoryKitSheet} from "../documents/story-kit-sheet.mjs";
import {StoryKitBrowser} from "./kit-browser.mjs";

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
    };

    /** @override
     * @type Record<ApplicationTab>
     * */
    static TABS = {
        primary: {
            tabs: [
                {id: 'overview', label: 'Overview', icon: 'ra ra-double-team'},
                {id: 'kits', label: 'Story Kits', icon: 'fas fa-book'},
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
            case 'kits':
                this.#kits = await StoryKitSheet.getStoryKits()
                context.kits = this.#kits;
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
}
