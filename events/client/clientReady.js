'use strict';

const scheduler = require('../../lib/utils/scheduler');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(logger, client) {
        // Informacja podczas zalogowania sie bota do Discord
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const ramUsage = process.memoryUsage().rss / 1024 / 1024;
        const startDate = new Intl.DateTimeFormat({ dateStyle: 'medium' });

        const modeInfo = global.isDev ? 'Development' : 'Production';
        const startFormatted = startDate.format(new Date());
        const statsInfo = `GUILDS: ${totalGuilds} | USERS: ${totalUsers}`;
        const ramInfo = `${ramUsage.toFixed(2)} MB`;
        const shardInfo = client.shard ? `TOTAL: ${client.shard.count} | ID: ${client.shard.ids.join(', ')}` : "";

        const rows = [
            `[Client] STATUS: Connected`,
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