'use strict';

const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client, logger) {
        // Zalogowanie sie bota do Discord
        logger.info(`[Client] ${client.user.tag} is ready.`);

        // Wyswietlenie informacji, jezeli bot dziala w trybie developera
        if (global.isDev) {
            logger.info('[Client] Running in Developer Mode.');
        }
    },
};