'use strict';

const updateAvatar = require('../../plugins/updateAvatar');
const { getConfig } = require('../../plugins/readConfig');
const { Events } = require('discord.js');
const cron = require('node-cron');

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
            const config = getConfig();

            if (config.botOptions.changedAvatar) return;
            await updateAvatar(client, logger);
        });
    },
};