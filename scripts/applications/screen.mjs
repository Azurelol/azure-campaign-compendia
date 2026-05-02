import ACApplication from "./application.mjs";
import {moduleTemplatePath} from "../utils.mjs";
import {StoryKitSheet} from "../documents/story-kit-sheet.mjs";

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
        position: {width: 800, height: 600},
        actions: {
            viewStoryKit: this.#viewStoryKit
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
        // widgets: {
        //     template: moduleTemplatePath(`applications/screen/widgets`),
        // },
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

    /** JournalEntryPage[] **/
    #kits;

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
                break;
        }
        return context;
    }

    // TODO: More themes?
    /**
     * @returns {String}
     */
    get theme() {
        return 'classic';
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

    /**
     * @this GMScreen
     * @param {PointerEvent} event   The originating click event
     * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
     * @returns {Promise<void>}
     */
    static async #viewStoryKit(event, target) {
        const {id} = target.dataset;
        // TODO: Reference
        if (this.#kits) {
            const kit = this.#kits.find(k => k.id === id);
            if (kit) {
                const sheet = kit.sheet;
                if (sheet) {
                    sheet.render({
                        force: true,
                        mode: "view",
                    });
                }
            }
        }
    }
}
