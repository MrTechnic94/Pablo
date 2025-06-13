'use strict';

module.exports = {
    name: 'uncaughtException',
    execute(err, logger) {
        logger.error(`[UncaughtException] Uncaught exception found:\n${err}`);
    },
};