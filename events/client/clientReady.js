'use strict';

const updateAvatar = require('../../plugins/updateAvatar');
const embedUpdater = require('../../plugins/embedUpdater');
const { getConfig } = require('../../plugins/configManipulator');
const { Events } = require('discord.js');
const cron = require('node-cron');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(logger, client) {
        // Informacja o zalogowaniu sie bota do Discord
        logger.info(`[Client] ${client.user.tag} is ready.`);

        // Wyswietlenie informacji, jezeli bot dziala w trybie developera
        if (global.isDev) {
            logger.info('[Client] Running in developer mode.');

            // Sprawdzenie zuzycie pamieci RAM co 15 sekund
            cron.schedule('*/15 * * * * *', () => {
                const used = process.memoryUsage().heapUsed / 1024 / 1024;

                logger.debug(`[Client] RAM usage: ${used.toFixed(2)} MB`);
            });

            // Aktualizuje embed ze statystykami od razu po starcie
            await embedUpdater(client, logger);
        }

        // Sprawdza avatar od razu po starcie
        // await updateAvatar(client, logger);

        // Aktualizuje embed ze statystykami co 2 minut
        cron.schedule('*/2 * * * *', async () => {
            const config = getConfig();

            if (!config.embeds.autoEmbedUpdate) return;

            await embedUpdater(client, logger);
        });

        // Sprawdza codziennie o polnocy
        cron.schedule('0 0 * * *', async () => {
            const config = getConfig();

            if (config.botOptions.changedAvatar) return;

            await updateAvatar(client, logger);
        });
    },
};