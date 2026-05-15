/**
 * @type {string} The unique module identifier used in the package and throughout.
 */
export const moduleId = "azure-campaign-compendia";

/**
 * @description A constant used throughout the project.
 */
export const Constants = {};

Constants.dieSize = {
    d2: 'ACC.DIE.D2',
    d4: 'ACC.DIE.D4',
    d6: 'ACC.DIE.D6',
    d8: 'ACC.DIE.D8',
    d12: 'ACC.DIE.D12',
}

/**
 * @typedef {'short'|'medium'|'long'} ClockSize
 */

Constants.clockSize = {
    short: 'ACC.CLOCK.Short', // d2
    medium: 'ACC.CLOCK.Medium', // d4
    long: 'ACC.CLOCK.Long' // d6
}

Constants.clockIcons = {
    short: 'acc-d2',
    medium: 'acc-d4',
    long: 'acc-d6',
}

Constants.story = {
    tone: {
        dark: 'ACC.STORY.TONE.Dark', // Texture: bleakness, low survival odds
        light: 'Light',
        grim: 'ACC.STORY.TONE.Grim', // Subject: death, evil, moral corruption
        tragic: 'Tragic',
        whimsical: 'Whimsical',
        mysterious: 'Mysterious',
        tense: 'Tense',
        eerie: 'Eerie',
        comedic: 'Comedic',
        surreal: 'Surreal',
        epic: 'Epic',
    },
    setting: {
        settlement: 'Settlement',
        urban: 'Urban',
        wilderness: 'Wilderness',
        underground: 'Underground',
        ruins: 'Ruins',
        desert: 'Desert',
        sea: 'Sea',
        island: 'Island',
        swamp: 'Swamp',
        frozen: 'Frozen',
        battlefield: 'Battlefield',
    },
    theme: {
        survival: 'Survival',
        heist: 'Heist',
        political: 'Political',
        social: 'Social',
        horror: 'Horror',
        exploration: 'Exploration',
        chase: 'Chase',
        hunt: 'Hunt',
        investigation: 'Investigation',
        redemption: 'Redemption',
        sacrifice: 'Sacrifice',
        corruption: 'Corruption',
        fate: 'Fate',
        legacy: 'Legacy',
        identity: 'Identity',
        skirmish: "Skirmish",
        war: 'War',
        journey: 'Journey',
        loss: 'Loss',
        memory: 'Memory',
        betrayal: 'Betrayal',
        rebellion: 'Rebellion',
    },
    threat: {
        monster: 'Monster',
        beast: 'Beast',
        faction: 'Faction',
        tyrant: 'Tyrant',
        supernatural: 'Supernatural',
        cult: 'Cult',
        nature: 'Nature',
        rival: 'Rival',
        undead: 'Undead',
        construct: 'Construct',
        deity: 'Deity',
    }
}

Constants.storyTags = {
    ...Constants.story.tone,
    ...Constants.story.setting,
    ...Constants.story.theme,
    ...Constants.story.threat,
};

Constants.icons = {
    compendium: 'fas fa-book',

    poll: 'fa-solid fa-square-poll-vertical',


    planner: 'fa fa-notebook',
    kit: 'fa fa-book',
    note: 'fa fa-sticky-note',
    events: 'fa fa-calendar',
    documents: 'fa fa-book-bookmark',

    popout: 'fa fa-external-link',
    pin: 'fa fa-thumb-tack',
    bookmark: 'fa fa-bookmark-o',
    add: 'fa fa-plus',
    remove: 'fa fa-minus',
    edit: 'fa fa-pencil',
    undo: 'fa fa-undo',
    redo: 'fa fa-redo',
    inspect: 'fa fa-eye',
    link: 'fa fa-link',
    reset: 'fa fa-reset',
    refresh: 'fa fa-refresh',
    check: 'fa fa-check',

    info: 'fas fa-circle-info',
    warning: 'fas fa-triangle-exclamation',
    help: 'fas fa-circle-question',
}
