'use strict';

module.exports = {
    name: 'unhandledRejection',
    execute(logger, _client, reason) {
        logger.error(`[UnhandledRejection] Unhandled rejection found:\n${reason}`);
    },
};