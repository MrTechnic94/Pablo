'use strict';

module.exports = {
    name: 'uncaughtException',
    execute(logger, _client, err) {
        logger.error(`[UncaughtException] Uncaught exception found:\n${err}`);
    },
};