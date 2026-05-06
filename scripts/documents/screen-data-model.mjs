import {VersionedDataModel} from "./versioned-data-model.mjs";

const {ArrayField, StringField} = foundry.applications.fields;

/**
 * @typedef PinReference
 * @property {String} type The type of the object being referenced.
 * @property {String} id The id of the object relative to the document it's on.
 */

/**
 * @property {PinReference[]} pinned
 */
export class ScreenDataModel extends VersionedDataModel {
    static defineSchema() {
        return Object.assign(super.defineSchema, {
            pinned: new ArrayField(new SchemaField({
                type: StringField,
                id: StringField,
            }))
        })
    }
}
