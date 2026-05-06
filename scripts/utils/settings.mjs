import {moduleId} from "../constants.mjs";

const {api, fields, handlebars} = foundry.applications;

export class Settings {

    static keys = Object.freeze({
        screenData: 'screenData',
    })


    static register() {
        game.settings.register(moduleId, Settings.keys.screenData, {
            scope: "world",
            config: false,
            restricted: true,
            type: Object,
            default: {
                pinned: []
            },
        });
    }

    static async set(key, value) {
        await game.settings.set(moduleId, key, value);
    }

    static async get(key, defaultValue = undefined) {
        const value = game.settings.get(moduleId, key);
        return value ?? defaultValue;
    }
}
