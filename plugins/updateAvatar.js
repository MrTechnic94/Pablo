'use strict';

const { getConfig, syncConfig } = require('./configManipulator');
const logger = require('./logger');

async function updateAvatar(client) {
    try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();

        // Ustawienie daty zmiany avataru na 1 grudnia, a przywrocenie domyslnego na 1 lutego
        const isChristmasTime = month === 11 || (month === 1 && day === 1);

        const config = getConfig();

        const defaultAvatar = config.botOptions.avatarDefaultPath;
        const christmasAvatar = config.botOptions.avatarChrismasPath;
        const wantedAvatar = isChristmasTime ? 'Christmas' : 'Default';

        if (config.botOptions.currentAvatar !== wantedAvatar) {
            await client.user.setAvatar(isChristmasTime ? christmasAvatar : defaultAvatar);
            logger.info(`[UpdateAvatar] Avatar changed to '${wantedAvatar}'.`);
            config.botOptions.currentAvatar = wantedAvatar;
            syncConfig(config);
        }
    } catch (err) {
        logger.error(`[UpdateAvatar] An error was found while trying to change the avatar:\n${err}`);
    }
}

module.exports = updateAvatar;