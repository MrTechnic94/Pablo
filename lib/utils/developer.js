'use strict';

function isDev() {
    return process.env.DEV_MODE === 'true';
}

async function dbMigration(client, logger) {
    const { utils } = client;

    logger.info('[Migration] Scanning database for legacy keys...');

    try {
        const allKeys = await utils.db.keys('guild:*');

        const oldKeys = allKeys.filter(key => key.split(':').length === 2);

        if (oldKeys.length === 0) {
            return logger.info('[Migration] No legacy keys found. Database is up to date.');
        }

        logger.info(`[Migration] Found '${oldKeys.length}' legacy keys to migrate.`);

        for (const oldKey of oldKeys) {
            const guildId = oldKey.split(':')[1];
            const newKey = `guilds:${guildId}:settings`;

            const data = await utils.db.hGetAll(oldKey);

            if (data && Object.keys(data).length > 0) {
                await utils.db.hSet(newKey, data);

                const verify = await utils.db.exists(newKey);

                if (verify) {
                    await utils.db.del(oldKey);
                    logger.info(`[Migration] Successfully moved: '${oldKey}' -> '${newKey}'`);
                }
            } else {
                await utils.db.del(oldKey);
            }
        }

        logger.info('[Migration] All legacy data has been successfully migrated.');
    } catch (err) {
        logger.error(`[Migration] Critical error during migration:\n${err.message}`);
    }
}

module.exports = { isDev, dbMigration };