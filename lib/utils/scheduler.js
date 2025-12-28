'use strict';

const cron = require('node-cron');
const updateAvatar = require('../services/updateAvatar');
const embedUpdater = require('../services/embedUpdater');
const { getConfig } = require('../core/configManipulator');

async function scheduler(client, logger) {
    if (global.isDev) {
        // Interval #1 - Sprawdzenie zuzycie pamieci RAM co 15 sekund
        setInterval(() => {
            const ramUsage = process.memoryUsage().heapUsed / 1024 / 1024;
            logger.debug(`[Client] RAM usage: ${ramUsage.toFixed(2)} MB`);
        }, 15000);

        // Aktualizuje embed ze statystykami od razu po starcie
        await embedUpdater(client, logger);
    }

    // Task #1 - Aktualizuje embed ze statystykami co 2 minut
    cron.schedule('*/2 * * * *', async () => {
        const config = getConfig();

        if (!config.embeds.autoEmbedUpdate) return;

        await embedUpdater(client, logger);
    });

    // Task #2 - Sprawdza avatar bota i go aktualizuje jezeli jest to wymagane
    cron.schedule('0 0 * * *', async () => {
        const config = getConfig();

        if (config.botOptions.changedAvatar) return;

        await updateAvatar(client, logger);
    });
}

module.exports = scheduler;