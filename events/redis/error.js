'use strict';

const logger = require('../../plugins/logger');

module.exports = {
    name: 'error',
    execute(err) {
        logger.error(`[Database] Error connecting to database.\n${err}`);
    },
};