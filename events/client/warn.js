'use strict';

const { Events } = require('discord.js');

module.exports = {
    name: Events.Warn,
    execute(logger, info) {
        logger.warn(`[Client] Warn found:\n${info}`);
    },
};