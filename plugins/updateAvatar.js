'use strict';

const { getConfig, syncConfig } = require('./readConfig');

// Funkcja zmieniajaca avatar
async function updateAvatar(client, logger) {
    try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();

        // Ustawienie daty zmiany avataru na 1 grudnia, a przywrocenie domyslnego na 1 lutego
        const isChristmasTime = month === 11 || (month === 1 && day === 1);

        const config = getConfig();

        const defaultAvatar = config.botOptions.avatarDefaultPath;
        const christmasAvatar = config.botOptions.avatarChrismasPath;

        if (isChristmasTime && config.botOptions.currentAvatar !== 'Christmas') {
            await client.user.setAvatar(christmasAvatar);
            logger.info('[UpdateAvatar] Avatar changed to Christmas.');
            config.botOptions.currentAvatar = 'Christmas';
            syncConfig(config);
        } else if (!isChristmasTime && config.botOptions.currentAvatar !== 'Default') {
            await client.user.setAvatar(defaultAvatar);
            logger.info('[UpdateAvatar] Avatar restored to default.');
            config.botOptions.currentAvatar = 'Default';
            syncConfig(config);
        }
    } catch (err) {
        logger.error(`[UpdateAvatar] An error was found while trying to change the avatar:\n${err}`);
    }
}

module.exports = updateAvatar;