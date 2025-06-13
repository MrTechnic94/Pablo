'use strict';

const { Events } = require('discord.js');

module.exports = {
    name: Events.Warn,
    execute(info, logger) {
        logger.warn(`[Client] Warn found:\n${info}`);
    },
};