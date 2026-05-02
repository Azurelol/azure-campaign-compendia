/**
 * @type {string} The unique module identifier used in the package and throughout.
 */
export const moduleId = "azure-campaign-compendia";

/**
 * @description A constant used throughout the project.
 */
export const Constants = {};

/**
 * @typedef {'short'|'medium'|'long'} ClockSize
 */

Constants.clockSize = {
    short: 'Low',
    medium: 'Medium',
    long: 'High'
}

Constants.story = {
    tone: {
        dark: 'Dark', // Texture: bleakness, low survival odds
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
    info: 'fas fa-circle-info',
    warning: 'fas fa-triangle-exclamation',
    help: 'fas fa-circle-question',
}
