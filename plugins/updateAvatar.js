'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { botOptions } = require('../config/default.json');
const { join } = require('node:path');

// Funckja ustawiajaca w konfigu jaki avatar aktualnie jest
function updateAvatarInConfig(type) {
    const pathConfig = join(__dirname, '../config/default.json');
    const config = JSON.parse(readFileSync(pathConfig), 'utf8');
    config.botOptions.currentAvatar = type;
    writeFileSync(pathConfig, JSON.stringify(config, null, 2));
}

// Funkcja zmieniajaca avatar
async function updateAvatar(client, logger) {
    try {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();

        // Ustawienie daty zmiany avataru na 1 grudnia, a przywrocenie domyslnego na 1 lutego
        const isChristmasTime = month === 11 || (month === 1 && day === 1);

        const defaultAvatar = readFileSync(join(botOptions.avatarDefaultPath));
        const christmasAvatar = readFileSync(join(botOptions.avatarChrismasPath));

        if (isChristmasTime && botOptions.currentAvatar !== 'christmas') {
            await client.user.setAvatar(christmasAvatar);
            logger.info('[UpdateAvatar] Avatar changed to Christmas.');
            updateAvatarInConfig('christmas');
        } else if (!isChristmasTime && botOptions.currentAvatar !== 'default') {
            await client.user.setAvatar(defaultAvatar);
            logger.info('[UpdateAvatar] Avatar restored to default.');
            updateAvatarInConfig('default');
        }
    } catch (err) {
        logger.error(`[UpdateAvatar] An error was found while trying to change the avatar:\n${err}`);
    }
}

module.exports = updateAvatar;