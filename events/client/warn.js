'use strict';

const logger = require('../../plugins/logger');
const { Events } = require('discord.js');

module.exports = {
    name: Events.Warn,
    execute(info) {
        logger.warn(`[Client] Warn found:\n${info}`);
    },
};