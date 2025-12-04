'use strict';

const cron = require('node-cron');
const updateAvatar = require('../services/updateAvatar');
const embedUpdater = require('../services/embedUpdater');
const { getConfig } = require('../core/configManipulator');

async function scheduler(client, logger) {
    if (global.isDev) {
        // Task 1 - Sprawdzenie zuzycie pamieci RAM co 15 sekund
        cron.schedule('*/15 * * * * *', () => {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;

            logger.debug(`[Client] RAM usage: ${used.toFixed(2)} MB`);
        });

        // Aktualizuje embed ze statystykami od razu po starcie
        await embedUpdater(client, logger);
    }

    // Task 2 - Aktualizuje embed ze statystykami co 2 minut
    cron.schedule('*/2 * * * *', async () => {
        const config = getConfig();

        if (!config.embeds.autoEmbedUpdate) return;

        await embedUpdater(client, logger);
    });

    // Task 3 - Sprawdza avatar bota i go aktualizuje jezeli jest to wymagane
    cron.schedule('0 0 * * *', async () => {
        const config = getConfig();

        if (config.botOptions.changedAvatar) return;

        await updateAvatar(client, logger);
    });
}

module.exports = scheduler;