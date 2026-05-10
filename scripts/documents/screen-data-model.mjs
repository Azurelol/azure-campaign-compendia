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
 * @typedef ScreenEventData
 * @property {String} id
 * @property {String} title The title of the event, fitting one line.
 * @property {String} details Further details of the event.
 * @property {'pending'|'completed'} status Whether the event has been run.
 */

/**
 * @property {PinReference[]} pinned
 * @property {ScreenNoteData[]} notes
 * @property {ScreenEventData[]} events
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
            })),
            events: new ArrayField(new SchemaField({
                id: new StringField(),
                text: new HTMLField()
            }))
        })
    }
}
