'use strict';

const { roles } = require('../../config/default.json');

module.exports = {
    customId: 'accept_rules',
    isPrefix: false,
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        if (interaction.member.roles.cache.has(roles.user)) {
            return await utils.reply.error(interaction, 'USER_ALREADY_VERIFIED');
        }

        try {
            await interaction.member.roles.add(roles.user);
            await utils.reply.success(interaction, 'VERIFIED');
        } catch (err) {
            logger.error(`[Button ▸ AcceptRules] Failed to add role to ${interaction.user.tag}: ${err}`);
            await utils.reply.error(interaction, 'COMMAND_ERROR');
        }
    }
};