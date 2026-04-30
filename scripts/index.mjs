import {AzureCampaignCompendia} from "./azure-campaign-compendia.mjs";
import {StoryKitSheet} from "./documents/story-kit-sheet.mjs";
import {StoryKitDataModel} from "./documents/story-kit-data-model.mjs";
import {Dialogs} from "./dialogs.mjs";
import {moduleId, Utils} from "./utils.mjs";
import {GMScreen} from "./applications/screen.mjs";

// Invoked by the foundry system
Hooks.once('init', () => {
    // Register documents
    CONFIG.JournalEntryPage.dataModels[AzureCampaignCompendia.prefixed("storyKit")] = StoryKitDataModel;
    foundry.applications.apps.DocumentSheetConfig.registerSheet(JournalEntryPage, AzureCampaignCompendia.moduleId, StoryKitSheet, {
        types: [StoryKitSheet.TYPE],
        label: 'Story Kit Page',
        makeDefault: false,
    });
    // Register API
    game.modules.get(AzureCampaignCompendia.moduleId).api = {
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


