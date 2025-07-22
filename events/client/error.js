'use strict';

const { Events } = require('discord.js');

module.exports = {
    name: Events.Error,
    execute(logger, err) {
        logger.error(`[Client] Error occurred:\n${err}`);
    },
};