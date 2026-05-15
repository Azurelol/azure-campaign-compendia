import {Constants} from "../constants.mjs";

const fields = foundry.data.fields;

const stringOptions = {required: true};

/**
 * @description Acts as a timer, rolled to build escalation and keep things moving
 */
export class PressurePoolDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            label: new fields.StringField({required: true, initial: ""}),
            clock: new fields.StringField({initial: '', blank: true, choices: Object.keys(Constants.clockSize)}),
            event1: new fields.StringField({required: true, initial: ""}),
            event2: new fields.StringField({required: true, initial: ""}),
            event3: new fields.StringField({required: true, initial: ""}),
        };
    }

    static migrateData(source) {
        if (Number.isInteger(source.clock)) {
            source.clock = "";
        }
        return super.migrateData(source);
    }
}

/**
 * Useful pieces, props, NPCs and more that form the backbone.
 */
export class ThreadDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            label: new fields.StringField({required: true, initial: "Label"}),
            description: new fields.StringField({required: true}),
            entry1: new fields.StringField({required: true, initial: ""}),
            entry2: new fields.StringField({required: true, initial: ""}),
            entry3: new fields.StringField({required: true, initial: ""}),
        };
    }
}

export class SetupDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            label: new fields.StringField({required: true, initial: ""}),
            description: new fields.StringField({required: true, initial: ""}),
            extended: new fields.BooleanField({required: true}),
            choices: new fields.ArrayField(new fields.SchemaField({
                text: new fields.StringField({required: true}),
                checked: new fields.BooleanField()
            }), {
                required: true, validate: (value, model) => {
                    if (model.source.extended) {
                        while (value.length < 12) {
                            value.push({text: "", checked: false});
                        }
                    } else {
                        while (value.length < 5) {
                            value.push({text: "", checked: false});
                        }
                        if (value.length > 5) {
                            value.splice(5);
                        }
                    }
                },
            },),
        };
    }
}

export class ChallengeDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            label: new fields.StringField({required: true, initial: ""}),
            clock: new fields.StringField({initial: '', blank: true, choices: Object.keys(Constants.clockSize)}),
            linked: new fields.BooleanField({required: true}),
            traits: new fields.ArrayField(new fields.StringField({required: true}), {
                validate: (value) => {
                    while (value.length < 3) {
                        value.push("");
                    }
                }
            }),
            moves: new fields.ArrayField(new fields.StringField({required: true}), {
                validate: (value) => {
                    while (value.length < 3) {
                        value.push("");
                    }
                }
            }),
            failState: new fields.StringField({required: true}),
            description: new fields.HTMLField({required: true, initial: ""}),
        };
    }

    static migrateData(source) {
        if (Number.isInteger(source.clock)) {
            source.clock = "";
        }
        return super.migrateData(source);
    }

    get valid() {
        return this.label !== ""
    }

    get hasMoves() {
        return this.moves.filter(t => t.length > 0).length > 0;
    }

    get hasFailState() {
        return this.failState !== ""
    }
}

/**
 * @property {string} hook1 - The first story hook.
 * @property {string} hook2 - The second story hook.
 * @property {string} hook3 - The third story hook.
 * @property {string} introduction - HTML introduction blurb for the story kit.
 * @property {PressurePoolDataModel} prelude - Pressure pool for the prelude phase.
 * @property {PressurePoolDataModel} escalation - Pressure pool for the escalation phase.
 * @property {PressurePoolDataModel} climax - Pressure pool for the climax phase.
 * @property {ThreadDataModel} thread1 - The first story thread.
 * @property {ThreadDataModel} thread2 - The second story thread.
 * @property {ThreadDataModel} thread3 - The third story thread.
 * @property {SetupDataModel} setup1 - The first setup.
 * @property {SetupDataModel} setup2 - The second setup.
 * @property {SetupDataModel} setup3 - The third setup.
 * @property {ChallengeDataModel} challenge1 - The first challenge.
 * @property {ChallengeDataModel} challenge2 - The second challenge.
 * @property {ChallengeDataModel} challenge3 - The third challenge.
 * @property {ChallengeDataModel} challenge4 - The fourth challenge.
 * @property {string} twist - A "mix it up" twist for the story.
 * @property {string} author - The author of the story kit.
 * @property {Set<string>} tone - Tone tags associated with the story kit.
 * @property {Set<string>} setting - Setting tags associated with the story kit.
 * @property {Set<string>} theme - Theme tags associated with the story kit.
 */
export class StoryKitDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            // Hooks
            hook1: new fields.StringField(stringOptions),
            hook2: new fields.StringField(stringOptions),
            hook3: new fields.StringField(stringOptions),
            // Introduction blurb
            introduction: new fields.HTMLField({required: true}),
            // Pressure Pools
            prelude: new fields.EmbeddedDataField(PressurePoolDataModel, {}),
            escalation: new fields.EmbeddedDataField(PressurePoolDataModel, {}),
            climax: new fields.EmbeddedDataField(PressurePoolDataModel, {}),
            // Threads
            thread1: new fields.EmbeddedDataField(ThreadDataModel, {}),
            thread2: new fields.EmbeddedDataField(ThreadDataModel, {}),
            thread3: new fields.EmbeddedDataField(ThreadDataModel, {}),
            // Setup
            setup1: new fields.EmbeddedDataField(SetupDataModel, {}),
            setup2: new fields.EmbeddedDataField(SetupDataModel, {}),
            setup3: new fields.EmbeddedDataField(SetupDataModel, {}),
            // Challenges
            challenge1: new fields.EmbeddedDataField(ChallengeDataModel, {}),
            challenge2: new fields.EmbeddedDataField(ChallengeDataModel, {}),
            challenge3: new fields.EmbeddedDataField(ChallengeDataModel, {}),
            challenge4: new fields.EmbeddedDataField(ChallengeDataModel, {}),
            // Mix it up
            twist: new fields.StringField(),
            author: new fields.StringField(),
            // Tags
            tone: new fields.SetField(new fields.StringField({})),
            setting: new fields.SetField(new fields.StringField({})),
            theme: new fields.SetField(new fields.StringField({}))
        };
    }

    /**
     * @returns {String[]}
     */
    get tags() {
        return [...this.tone, ...this.setting, ...this.theme]
    }
}
