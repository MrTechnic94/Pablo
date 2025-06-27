'use strict';

const cron = require('node-cron');
const updateAvatar = require('../../plugins/updateAvatar');
const { readFileSync } = require('node:fs');
const { Events } = require('discord.js');
const { join } = require('node:path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(logger, client) {
        // Zalogowanie sie bota do Discord
        logger.info(`[Client] ${client.user.tag} is ready.`);

        // Wyswietlenie informacji, jezeli bot dziala w trybie developera
        if (global.isDev) {
            logger.info('[Client] Running in Developer Mode.');
        }

        // Sprawdza avatar od razu po starcie
        // await updateAvatar(client, logger);

        // Sprawdza codziennie o polnocy
        cron.schedule('0 0 * * *', async () => {
            const configPath = join(__dirname, '../../config/default.json');
            const config = JSON.parse(readFileSync(configPath, 'utf8'));

            if (config.botOptions.changedAvatar) return;
            await updateAvatar(client, logger);
        });
    },
};