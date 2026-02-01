'use strict';

const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(logger, guild) {
        try {
            const { utils } = guild.client;

            await utils.db.del(`guild:${guild.id}`);
            await utils.db.sRem('statistics:activeGuilds', guild.id);

            logger.info(`[Client] Deleted data from database for '${guild.id}'.`);
        } catch (err) {
            logger.error(`[Client] Error while deleting data for '${guild.id}'.\n${err}`);
        }
    },
};