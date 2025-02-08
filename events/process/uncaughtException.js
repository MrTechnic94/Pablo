'use strict';

const logger = require('../../plugins/logger');

module.exports = {
    name: 'uncaughtException',
    execute(err) {
        logger.error(`[Client] Uncaught exception found:\n${err}`);
    },
};