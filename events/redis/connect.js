'use strict';

const logger = require('../../plugins/logger');

module.exports = {
    name: 'connect',
    execute() {
        logger.info('[Database] Connected to database.');
    },
};