'use strict';

const { GatewayCloseCodes } = require('discord.js');

async function handleError(err, type, name, interaction, logger, utils) {
    logger.error(`[${type} ▸ ${name}] Error for '${interaction.guild.id}':\n${err}`);

    if (err.status === 429 || err.code === GatewayCloseCodes.RateLimited || err.message?.includes('RATE_LIMIT')) {
        logger.warn(`[${type}] Rate limit hit for '${interaction.guild.id}'.`);
        return await utils.reply.error(interaction, 'RATE_LIMIT');
    }

    return await utils.reply.error(interaction, 'COMMAND_ERROR');
}

module.exports = handleError;