import {AzureCampaignCompendia} from "./logger.mjs";
import {StoryKitSheet} from "./documents/story-kit-sheet.mjs";
import {StoryKitDataModel} from "./documents/story-kit-data-model.mjs";
import {Dialogs} from "./dialogs.mjs";
import {modulePrefixed, Utils} from "./utils/utils.mjs";
import {GMScreen} from "./applications/screen.mjs";
import {Constants, moduleId} from "./constants.mjs";
import {ACHandlebars} from "./handlebars.mjs";

// Invoked by the foundry system
Hooks.once('init', async () => {
    // Register documents
    CONFIG.JournalEntryPage.dataModels[modulePrefixed("storyKit")] = StoryKitDataModel;
    foundry.applications.apps.DocumentSheetConfig.registerSheet(JournalEntryPage, moduleId, StoryKitSheet, {
        types: [StoryKitSheet.TYPE],
        label: 'Story Kit Page',
        makeDefault: false,
    });
    // Register helpers
    await ACHandlebars.loadTemplates();
    ACHandlebars.registerHelpers();
    // Register API
    game.modules.get(moduleId).api = {
        constants: Constants,
        dialogs: Dialogs,
        utils: Utils,
    };
    // Register Tools
    Hooks.on("getSceneControlButtons", (controls) => {
        // Add GM Screen to Notes controls
        controls.tokens.tools[`${moduleId}.screen`] = {
            name: `${moduleId}.screen`,
            title: "GM Screen",
            icon: "fa-solid fa-screen-users",
            order: 100,
            button: true,
            visible: game.user.isGM,
            onChange: () => {
                ui.notifications.info("First action triggered!");
                const app = new GMScreen();
                app.render(true);
            }
        };

        // TODO: Provide mechanism implementation?
        // Add Random Target to Token controls
        // controls.tokens.tools[`${moduleId}.randomTarget`] = {
        //     name: `${moduleId}.randomTarget`,
        //     title: "Random Target",
        //     icon: "fa-solid fa-crosshairs",
        //     order: 100,
        //     button: true,
        //     visible: game.user.isGM,
        //     onChange: () => {
        //         ui.notifications.info("Randomly targeting a PC!");
        //     }
        // };
    });
    // Emit salutations
    AzureCampaignCompendia.log('Azure Compendia says... hello world!');
});


