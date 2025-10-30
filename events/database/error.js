'use strict';

module.exports = {
    name: 'error',
    once: true,
    execute(logger, err) {
        logger.error(`[Database] Error connecting to database:\n${err}.`);
    },
};