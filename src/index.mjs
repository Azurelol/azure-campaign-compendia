import {AzureCompendia} from "./azure-compendia.mjs";
import {StoryKitSheet} from "./documents/story-kit-sheet.mjs";
import {StoryKitDataModel} from "./documents/story-kit-data-model.mjs";

// Invoked by the foundry system
Hooks.once('init', () => {
    // Register documents
    CONFIG.JournalEntryPage.dataModels[AzureCompendia.prefixed("storyKit")] = StoryKitDataModel;
    foundry.applications.apps.DocumentSheetConfig.registerSheet(JournalEntryPage, AzureCompendia.id, StoryKitSheet, {
        types: [AzureCompendia.prefixed("storyKit")],
        label: 'Story Kit Page',
        makeDefault: false,
    });
    // Emit salutations
    AzureCompendia.log('Azure Compendia says... hello world!');
});


