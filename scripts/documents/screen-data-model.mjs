import {VersionedDataModel} from "./versioned-data-model.mjs";

const {ArrayField, StringField, HTMLField} = foundry.applications.fields;

/**
 * @typedef PinReference
 * @property {String} type The type of the object being referenced.
 * @property {String} id The id of the object relative to the document it's on.
 * @property {Object|undefined} object The resolved instance of the object.
 */

/**
 * @typedef BaseScreenData
 * @property {String} id
 */

/**
 * @typedef ScreenNoteData
 * @property {String} id
 * @property {String} text
 */

/**
 * @typedef SceneData
 * @property {String} id
 * @property {String} text
 */

/**
 * @typedef SceneQueue
 * @property {SceneData[]} current
 * @property {SceneData[]} current
 */

/**
 * @property {PinReference[]} pinned
 * @property {ScreenNoteData[]} notes
 */
export class ScreenDataModel extends VersionedDataModel {
    static defineSchema() {
        return Object.assign(super.defineSchema, {
            pinned: new ArrayField(new SchemaField({
                type: new StringField(),
                id: new StringField(),
            })),
            notes: new ArrayField(new SchemaField({
                id: new StringField(),
                text: new HTMLField()
            }))
        })
    }
}
