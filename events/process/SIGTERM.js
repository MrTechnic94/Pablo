'use strict';

const shutdown = require('../../lib/utils/shutdown');

module.exports = {
    name: 'SIGTERM',
    async execute(logger, client) {
        await shutdown('SIGTERM', logger, client);
    },
};