import ACApplication from "./application.mjs";
import {moduleTemplatePath} from "../utils.mjs";
import {StoryKitSheet} from "../documents/story-kit-sheet.mjs";

export class GMScreen extends ACApplication {

    /**
     * @inheritDoc
     * @override
     */
    static DEFAULT_OPTIONS = {
        classes: ['acc-screen'],
        window: {
            title: 'GM Screen',
            resizable: true,
        },
        position: {width: 750, height: 'auto'},
        actions: {},
    };

    /**
     * @override
     */
    static PARTS = {
        main: {
            template: moduleTemplatePath('applications/screen'),
        },
    };

    /** @override */
    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        const storyKits = await StoryKitSheet.getStoryKits()
        return context;
    }
}
