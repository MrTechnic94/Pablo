'use strict';

const logger = require('../../plugins/logger');

module.exports = {
    name: 'unhandledRejection',
    execute(reason) {
        logger.error(`[UnhandledRejection] Unhandled rejection found:\n${reason}`);
    },
};