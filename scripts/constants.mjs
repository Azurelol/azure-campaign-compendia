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
        grim: 'Grim', // Subject: death, evil, moral corruption
        tragic: 'Tragic',
        whimsical: 'Whimsical',
        mysterious: 'Mysterious',
        tense: 'Tense',
        eerie: 'Eerie',
        comedic: 'Comedic',
        surreal: 'Surreal',
        lighthearted: 'Lighthearted',
        epic: 'Epic',
    },
    setting: {
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
        investigation: 'Investigation',
        redemption: 'Redemption',
        sacrifice: 'Sacrifice',
        corruption: 'Corruption',
        fate: 'Fate',
        legacy: 'Legacy',
        identity: 'Identity',
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
    inspect: 'fa fa-eye',
    link: 'fa fa-link',
    popout: 'fa fa-external-link',
    info: 'fas fa-circle-info',
    pin: 'fa fa-thumb-tack',
    bookmark: 'fa fa-bookmark-o',
    warning: 'fas fa-triangle-exclamation',
    help: 'fas fa-circle-question',
}
