'use strict';

const logger = require('../../plugins/logger');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(readyClient) {
        // Zalogowanie sie bota do Discord
        logger.info(`[Client] ${readyClient.user.tag} is ready.`);

        // Wyswietlenie informacji, jezeli bot dziala w trybie developera
        if (global.isDev) {
            logger.info('[Client] Running in Developer Mode.');
        }
    }
};