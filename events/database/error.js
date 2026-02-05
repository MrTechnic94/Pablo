'use strict';

module.exports = {
    name: 'error',
    execute(logger, err) {
        logger.error(`[Database] Error connecting to database:\n${err}`);
    },
};