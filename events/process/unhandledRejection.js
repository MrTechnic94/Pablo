'use strict';

module.exports = {
    name: 'unhandledRejection',
    execute(logger, reason) {
        logger.error(`[UnhandledRejection] Unhandled rejection found:\n${reason}`);
    },
};