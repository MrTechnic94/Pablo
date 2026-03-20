'use strict';

const scheduler = require('../../lib/utils/scheduler');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(logger, client) {
        // Migracja na nowe struktury bazy danych
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

        // Informacja podczas zalogowania sie bota do Discord
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const app = await client.application.fetch().catch(() => null);
        const userInstalls = app?.approximateUserInstallCount ?? 0;
        const ramUsage = process.memoryUsage().rss / 1024 / 1024;
        const startDate = new Intl.DateTimeFormat({ dateStyle: 'medium' });

        const modeInfo = global.isDev ? 'Development' : 'Production';
        const startFormatted = startDate.format(new Date());
        const statsInfo = `GUILDS: ${totalGuilds} | USERS: ${totalUsers} | APP USERS: ${userInstalls}`;
        const ramInfo = `${ramUsage.toFixed(2)} MB`;
        const shardInfo = client.shard ? `TOTAL: ${client.shard.count} | ID: ${client.shard.ids.join(', ')}` : '';

        const rows = [
            '[Client] STATUS: Connected',
            `[Client] NAME:   ${client.user.tag}`,
            `[Client] ID:     ${client.user.id}`,
            `[Stats]  ${statsInfo}`,
            `[Stats]  RAM USAGE:  ${ramInfo}`,
            `[System] MODE:   ${modeInfo}`,
            `[System] START:  ${startFormatted}`
        ];

        if (client.shard) rows.splice(5, 0, `[Shard]  ${shardInfo}`);

        const width = Math.max(...rows.map(r => r.length));
        const line = `+${'-'.repeat(width + 2)}+`;

        logger.info(line);

        rows.forEach((row, i) => {
            logger.info(`| ${row.padEnd(width)} |`);
            if (i === 2 || (client.shard ? i === 5 : i === 4)) logger.info(line);
        });

        logger.info(line);

        // Zaladowanie harmonogramu zadan bota w tle
        await scheduler(client, logger);
    },
};