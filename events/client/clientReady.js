'use strict';

const scheduler = require('../../lib/utils/scheduler');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(logger, client) {
        // Informacja o zalogowaniu sie bota do Discord
        logger.info(`[Client] ${client.user.tag} is ready.`);

        if (global.isDev) logger.info('[Client] Running in developer mode.');

        // Zaladowanie harmonogramu zadan bota w tle
        await scheduler(client, logger);
    },
};