const {HandlebarsApplicationMixin, Application} = foundry.applications.api;

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
