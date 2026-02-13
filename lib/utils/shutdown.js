'use strict';

async function shutdown(signal, logger, client) {
    try {
        logger.info(`[${signal}] Signal triggered. Starting shutdown...`);

        if (client) {
            await client.destroy();
            logger.info(`[${signal}] Discord client destroyed.`);
        }

        logger.info(`[${signal}] Shutdown completed safely.`);
        process.exit(0);
    } catch (err) {
        logger.error(`[${signal}] Error during shutdown:\n${err}`);
        process.exit(1);
    }
}

module.exports = shutdown;