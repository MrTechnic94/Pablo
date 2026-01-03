'use strict';

const { roles } = require('../../config/default.json');
const reply = require('../../lib/utils/responder');

module.exports = {
    customId: 'accept_rules',
    isPrefix: false,
    async execute(interaction, logger) {
        if (interaction.member.roles.cache.has(roles.user)) {
            return await reply.error(interaction, 'USER_ALREADY_VERIFIED');
        }

        try {
            await interaction.member.roles.add(roles.user);
            await reply.success(interaction, 'VERIFIED');
        } catch (err) {
            logger.error(`[Button ▸ AcceptRules] Failed to add role to ${interaction.user.tag}: ${err}`);
            await reply.error(interaction, 'COMMAND_ERROR');
        }
    }
};