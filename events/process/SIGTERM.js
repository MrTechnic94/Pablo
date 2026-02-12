'use strict';

module.exports = {
    name: 'SIGTERM',
    async execute(logger, client) {
        try {
            logger.info('[SIGTERM] Termination signal triggered...');

            if (client) await client.destroy();

            logger.info('[SIGTERM] Safe termination completed.')
            process.exit(0);
        } catch (err) {
            logger.error(`[SIGTERM] Error during shutdown process:\n${err}`);
            process.exit(1);
        }
    },
};