'use strict';

module.exports = {
    name: 'connect',
    once: true,
    execute(logger) {
        logger.info('[Database] Connected to database.');
    },
};