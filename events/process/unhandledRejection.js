'use strict';

module.exports = {
    name: 'unhandledRejection',
    execute(reason, logger) {
        logger.error(`[UnhandledRejection] Unhandled rejection found:\n${reason}`);
    },
};