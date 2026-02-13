'use strict';

const shutdown = require('../../lib/utils/shutdown');

module.exports = {
    name: 'SIGINT',
    async execute(logger, client) {
        await shutdown('SIGINT', logger, client);
    },
};