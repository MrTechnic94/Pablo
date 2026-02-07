'use strict';

const updateAvatar = require('../services/updateAvatar');
const embedUpdater = require('../services/embedUpdater');
const { Cron } = require('croner');

async function scheduler(client, logger) {
    const { utils } = client;

    if (global.isDev) {
        // Interval #1 - Sprawdzenie zuzycie pamieci RAM co 15 sekund
        setInterval(() => {
            const ramUsage = process.memoryUsage().heapUsed / 1024 / 1024;
            logger.debug(`[Client] RAM usage: ${ramUsage.toFixed(2)} MB`);
        }, 15000);

        // Aktualizuje embed ze statystykami od razu po starcie
        await embedUpdater(client, logger);
    }

    // Task #1 - Aktualizuje embed ze statystykami co 5 minut
    new Cron('*/5 * * * *', async () => {
        const activeGuildIds = await utils.db.sMembers('statistics:activeGuilds');

        if (!activeGuildIds?.length) return;

        await Promise.allSettled(activeGuildIds.map(async (guildId) => {
            if (client.guilds.cache.has(guildId)) {
                return await embedUpdater(client, logger, guildId);
            }
        }));
    });

    // Task #2 - Sprawdza avatar bota i go aktualizuje jezeli jest to wymagane
    new Cron('0 0 * * *', async () => {
        const config = utils.getConfig();

        if (config.botOptions.changedAvatar) return;

        await updateAvatar(client, logger);
    });
}

module.exports = scheduler;