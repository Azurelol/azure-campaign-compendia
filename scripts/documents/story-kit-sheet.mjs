import {AzureCampaignCompendia} from "../azure-campaign-compendia.mjs";
import {Utils} from "../utils.mjs";

export class StoryKitSheet extends foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet {

    static TYPE = AzureCampaignCompendia.prefixed("storyKit");

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["azure-compendia", "acc-story-kit"],
        viewClasses: ["azure-compendia", "acc-story-kit"],
        window: {
            icon: "fa-brands fa-markdown",
            contentClasses: ['acc-story-kit']
        },
        form: {
            submitOnChange: false,
        },
    };

    /** @inheritDoc */
    static EDIT_PARTS = {
        header: super.EDIT_PARTS.header,
        content: {
            template: AzureCampaignCompendia.getTemplatePath("journal/pages/story-kit-edit"),
            templates: [
                AzureCampaignCompendia.getTemplatePath("partials/pressure-pool-edit"),
                AzureCampaignCompendia.getTemplatePath("partials/thread-edit"),
                AzureCampaignCompendia.getTemplatePath("partials/setup-edit"),
                AzureCampaignCompendia.getTemplatePath("partials/challenge-edit"),
            ],
            classes: ['scrollable']
        },
        footer: super.EDIT_PARTS.footer
    };

    /** @override */
    static VIEW_PARTS = {
        content: {
            template: AzureCampaignCompendia.getTemplatePath("journal/pages/story-kit-view"),
            templates: [
                AzureCampaignCompendia.getTemplatePath("partials/pressure-pool-view"),
                AzureCampaignCompendia.getTemplatePath("partials/thread-view"),
                AzureCampaignCompendia.getTemplatePath("partials/setup-view"),
                AzureCampaignCompendia.getTemplatePath("partials/challenge-view"),
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
     * @returns {Promise<JournalEntryPageData[]>}
     */
    static async getStoryKits(cached = true) {
        if (!cached || StoryKitSheet.#storyKits === undefined) {
            const journalEntries = await Utils.getDocumentsOfType('JournalEntry')
            StoryKitSheet.#storyKits = (
                await Promise.all(
                    journalEntries.map(entry => fromUuid(entry.uuid))
                )
            ).flatMap(entry => entry?.pages.filter(page => page.type === StoryKitSheet.TYPE) ?? []);
        }
        return StoryKitSheet.#storyKits;
    }
}
