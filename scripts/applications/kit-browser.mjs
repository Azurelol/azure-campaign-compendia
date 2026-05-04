import {Constants} from "../constants.mjs";
import {HTMLUtils} from "../utils/html-utils.mjs";

export class StoryKitBrowser {
    /** @type GMScreen **/
    sheet;
    /** @type String[] **/
    tags;
    /** @type String **/
    nameFilter;

    constructor(sheet) {
        this.sheet = sheet;
        this.tags = [];
    }

    /**
     * @param {HTMLElement} html
     */
    attachListeners(html) {
        const controls = html.querySelector('.acc-browser__controls');
        const toolbar = controls.querySelector('.acc-browser__toolbar');
        const searchInput = toolbar.querySelector('.acc-browser__toolbar__search').querySelector('input');
        if (searchInput) {
            requestAnimationFrame(() => searchInput.removeAttribute('disabled'));
            searchInput.addEventListener(
                'input',
                HTMLUtils.debounce(() => {
                    this.nameFilter = searchInput.value.toLowerCase() || '';
                    this.#updateEntries();
                }, 150),
            );
        }

        controls.querySelectorAll('.acc-tag__group .acc-tag__filter').forEach((tag) => {
            tag.addEventListener('click', () => {
                const value = tag.dataset.tag;

                if (this.tags.includes(value)) {
                    this.tags = this.tags.filter((t) => t !== value);
                    tag.classList.remove('active');
                } else {
                    this.tags.push(value);
                    tag.classList.add('active');
                }

                this.#updateEntries();
            });
        });

    }

    /**
     * @param {HTMLElement} element
     */
    refresh(element) {
        if (element) {
            this.#sortEntries(element);
        }
    }

    /**
     * @return {String[]}
     */
    get tones() {
        return Object.keys(Constants.story.tone);
    }

    /**
     * @return {String[]}
     */
    get themes() {
        return Object.keys(Constants.story.theme);
    }

    /**
     * @return {String[]}
     */
    get settings() {
        return Object.keys(Constants.story.setting);
    }

    /**
     * @param {HTMLElement} element
     */
    #sortEntries(element) {
        const entries = element.querySelector('.acc-browser__content');
        if (entries) {
            const items = [...entries.querySelectorAll('li.acc-browser__entry')];
            const kits = this.sheet.kits;
            items
                .sort((a, b) => {
                    const indexA = Number(a.dataset.index);
                    const indexB = Number(b.dataset.index);
                    const entryA = kits[indexA];
                    const entryB = kits[indexB];
                    if (!entryA || !entryB) return 0;
                    return entryA.name.localeCompare(entryB.name);
                })
                .forEach((li) => entries.appendChild(li));
        }
    }

    /**
     * @desc Updates entry visibility based on filtering.
     */
    #updateEntries() {
        const element = this.sheet.element;
        const entries = element.querySelector('.acc-browser__content');
        if (entries) {
            const tagFilter = new Set(this.tags);
            const nameFilter = this.nameFilter ? this.nameFilter.toLowerCase() : '';
            const kits = this.sheet.kits;

            for (const li of entries.querySelectorAll('li.acc-browser__entry')) {
                const index = li.dataset.index;
                const entry = kits[index];
                if (!entry) {
                    return;
                }

                let visible = true;
                if (entry.hidden && !game.user.isGM) {
                    visible = false;
                } else if (!entry.name.toLowerCase().includes(nameFilter)) {
                    visible = false;
                } else if (tagFilter.size > 0 && ![...tagFilter].every((tag) => entry.tags.includes(tag))) {
                    visible = false;
                }

                li.classList.toggle('hidden', !visible);
            }
        }
    }

}
