'use strict';

const logger = require('../../plugins/logger');

module.exports = {
    name: 'unhandledRejection',
    execute(reason) {
        logger.error(`[Client] Unhandled rejection found:\n${reason}`);
    },
};