'use strict';

// const logger = require('../../plugins/logger');

module.exports = {
    name: 'uncaughtException',
    execute(logger, err) {
        logger.error(`[UncaughtException] Uncaught exception found:\n${err}`);
    },
};