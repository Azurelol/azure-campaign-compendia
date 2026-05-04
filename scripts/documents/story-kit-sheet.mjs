import {modulePrefixed, moduleTemplatePath, Utils} from "../utils/utils.mjs";
import {Constants} from "../constants.mjs";

export class StoryKitSheet extends foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet {

    static TYPE = modulePrefixed("storyKit");

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["azure-compendia", "acc-story-kit_frame"],
        viewClasses: ["azure-compendia", "acc-story-kit"],
        window: {
            icon: "fa-brands fa-markdown",
            contentClasses: ['acc-story-kit']
        },
        position: {width: 885, height: 1080},
        form: {
            submitOnChange: false,
        },
    };

    /** @inheritDoc */
    static EDIT_PARTS = {
        header: super.EDIT_PARTS.header,
        content: {
            template: moduleTemplatePath("journal/pages/story-kit-edit"),
            templates: [
                moduleTemplatePath("partials/pressure-pool-edit"),
                moduleTemplatePath("partials/thread-edit"),
                moduleTemplatePath("partials/setup-edit"),
                moduleTemplatePath("partials/challenge-edit"),
            ],
            classes: ['scrollable']
        },
        footer: super.EDIT_PARTS.footer
    };

    /** @override */
    static VIEW_PARTS = {
        content: {
            template: moduleTemplatePath("journal/pages/story-kit-view"),
            templates: [
                moduleTemplatePath("partials/pressure-pool-view"),
                moduleTemplatePath("partials/thread-view"),
                moduleTemplatePath("partials/setup-view"),
                moduleTemplatePath("partials/challenge-view"),
            ],
            classes: ["acc-story-kit"],
            root: true
        }
    };

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        /** @type StoryKitDataModel **/
        context.system = this.document.system;
        context.enrichedIntroduction = await TextEditor.enrichHTML(context.system.introduction, {async: true});
        context.constants = Constants;
        context.toneOptions = Utils.getFormSelectOptions(Constants.story.tone);
        return context;
    }

    /**
     * @description Allow subclasses to dynamically configure render parts.
     * @param {HandlebarsRenderOptions} options
     * @returns {Record<string, HandlebarsTemplatePart>}
     * @protected
     */
    _configureRenderParts(options) {
        const parts = super._configureRenderParts(options);
        Object.entries(parts).forEach(([partId, config]) => {
            if (!['header', 'tabs'].includes(partId)) {
                config.scrollable ??= [''];
            }
        });
        return parts;
    }

    /**
     * @inheritDoc
     * @override
     */
    _attachFrameListeners() {
        super._attachFrameListeners();
        const html = this.element;
    }

    /**
     * @type {JournalEntryPageData[]}
     */
    static #storyKits;

    /**
     * @type {[string]}
     */
    static storyKitFields = ['system.tags']

    /**
     * @returns {Promise<JournalEntryPageData[]>}
     */
    static async getStoryKits(cached = true) {
        if (!cached || StoryKitSheet.#storyKits === undefined) {
            const journalEntries = await Utils.getDocumentsOfType('JournalEntry', true, StoryKitSheet.storyKitFields)
            StoryKitSheet.#storyKits = (
                await Promise.all(
                    journalEntries.map(entry => fromUuid(entry.uuid))
                )
            ).flatMap(entry => entry?.pages.filter(page => page.type === StoryKitSheet.TYPE) ?? []);
        }
        return StoryKitSheet.#storyKits;
    }
}
