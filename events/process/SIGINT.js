'use strict';

module.exports = {
    name: 'SIGINT',
    async execute(logger, client) {
        try {
            logger.info('[SIGINT] Restart signal triggered...');

            if (client) await client.destroy();

            logger.info('[SIGINT] Safely restart completed.')
            process.exit(0);
        } catch (err) {
            logger.error(`[SIGINT] Error during shutdown process:\n${err}`);
            process.exit(1);
        }
    },
};