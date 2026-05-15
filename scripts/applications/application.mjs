const {HandlebarsApplicationMixin, Application} = foundry.applications.api;
const {DragDrop} = foundry.applications.ux;

/**
 * @property {HTMLElement} element
 */
export default class ACApplication extends HandlebarsApplicationMixin(Application) {

    /** @inheritdoc */
    static DEFAULT_OPTIONS = {
        classes: ['acc'],
        form: {
            submitOnChange: true,
            closeOnSubmit: true,
        },
        position: {
            width: 450,
            height: 'auto',
        },
        tag: 'form',
        actions: {
            filePicker: ACApplication.filePicker,
        },
    };

    constructor(options = {}) {
        super(options)
    }

    _canDragStart(selector) {
        return true;
    }

    _canDragDrop(selector) {
        return true;
    }

    getItem(itemId) {
        return undefined;
    }

    // Set drag data on dragstart
    _onDragStart(event) {
        const target = event.currentTarget;
        if ("link" in event.target.dataset) return;
        let dragData;

        // Owned Items
        if (target.dataset.itemId) {
            const item = this.getItem(target.dataset.itemId);
            if (item) {
                dragData = item.toDragData();
            }
        }

        // Set data transfer
        if (!dragData) return;
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    // Optional: visual feedback while dragging over
    _onDragOver(event) {
        event.preventDefault(); // required to allow dropping
    }

    // Handle the actual drop
    async _onDrop(event) {
        const data = TextEditor.implementation.getDragEventData(event);

        // Dropped Documents
        const documentClass = foundry.utils.getDocumentClass(data.type);
        if (documentClass) {
            const document = await documentClass.fromDropData(data);
            await this._onDropDocument(event, document);
        }
    }

    /**
     * @template {Document} TDocument
     * @param {DragEvent} event         The initiating drop event
     * @param {TDocument} document       The resolved Document class
     * @returns {Promise<TDocument|null>} A Document of the same type as the dropped one in case of a successful result,
     *                                    or null in case of failure or no action being taken
     * @protected
     */
    async _onDropDocument(event, document) {
        switch (document.documentName) {
            case "Actor":
                return (await this._onDropActor(event, document)) ?? null;
            case "Item":
                return (await this._onDropItem(event, document)) ?? null;
            case 'JournalEntry':
                return (await this._onDropJournalEntry(event, document)) ?? null;
            case 'JournalEntryPage':
                return (await this._onDropJournalEntryPage(event, document)) ?? null;
            case 'Folder':
                return (await this._onDropFolder(event, document)) ?? null;
            default:
                return null;
        }
    }

    /**
     * @param {DragEvent} event     The initiating drop event
     * @param {Actor} actor           The dropped Item document
     * @returns {Promise<Actor|null|undefined>}
     * @protected
     */
    async _onDropActor(event, actor) {
    }

    /**
     * @param {DragEvent} event     The initiating drop event
     * @param {Item} item           The dropped Item document
     * @returns {Promise<Item|null|undefined>}
     * @protected
     */
    async _onDropItem(event, item) {
    }

    /**
     * @param {DragEvent} event     The initiating drop event
     * @param {JournalEntry} entry
     * @returns {Promise<JournalEntry|null|undefined>}
     * @protected
     */
    async _onDropJournalEntry(event, entry) {
    }

    /**
     * @param {DragEvent} event     The initiating drop event
     * @param {JournalEntryPage} page
     * @returns {Promise<JournalEntryPage|null|undefined>}
     * @protected
     */
    async _onDropJournalEntryPage(event, page) {
    }


    /**
     * Handle a dropped Folder on the Actor Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Folder} folder       The dropped Folder document
     * @returns {Promise<Folder|null|undefined>}
     * @protected
     */
    async _onDropFolder(event, folder) {
        return null;
    }


    /** @inheritDoc */
    async _onRender(context, options) {
        await super._onRender(context, options);
        new DragDrop.implementation({
            dragSelector: ".draggable",
            dropSelector: ".window-content",
            permissions: {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            },
            callbacks: {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
        }).bind(this.element);
    }

    /**
     * @desc Re-renders the application.
     * @returns {Promise<*>}
     */
    async refresh() {
        return this.render(true);
    }

    static async filePicker(event, target) {
        const field = target.dataset.target;
        const current = this.element.querySelector(`[name="${field}"]`)?.value ?? '';

        new FilePicker({
            type: 'image',
            current,
            callback: (path) => {
                const input = this.element.querySelector(`[name="${field}"]`);
                if (input) {
                    input.value = path;
                    input.dispatchEvent(new Event('change'));
                }
            },
        }).browse();
    }
}
