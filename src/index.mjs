import {AzureCampaignCompendia} from "./azure-campaign-compendia.mjs";
import {StoryKitSheet} from "./documents/story-kit-sheet.mjs";
import {StoryKitDataModel} from "./documents/story-kit-data-model.mjs";
import {AzureCampaignCompendiaUtils, AzureCompendiaDialogs} from "./dialogs.mjs";

// Invoked by the foundry system
Hooks.once('init', () => {
    // Register documents
    CONFIG.JournalEntryPage.dataModels[AzureCampaignCompendia.prefixed("storyKit")] = StoryKitDataModel;
    foundry.applications.apps.DocumentSheetConfig.registerSheet(JournalEntryPage, AzureCampaignCompendia.moduleId, StoryKitSheet, {
        types: [AzureCampaignCompendia.prefixed("storyKit")],
        label: 'Story Kit Page',
        makeDefault: false,
    });
    // Register API
    game.modules.get(AzureCampaignCompendia.moduleId).api = {
        dialogs: AzureCompendiaDialogs
    };
    // Emit salutations
    AzureCampaignCompendia.log('Azure Compendia says... hello world!');
});


