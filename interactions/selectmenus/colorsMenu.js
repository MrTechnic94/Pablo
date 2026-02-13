'use strict';

const { roles } = require('../../config/default.json');

const roleMap = {
    'colors_black': roles.black,
    'colors_red': roles.red,
    'colors_blue': roles.blue,
    'colors_magenta': roles.magenta,
    'colors_green': roles.green
};

const colorRoleIds = Object.values(roleMap);

module.exports = {
    customId: 'colors_menu',
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const roleId = roleMap[interaction.values[0]];

        if (interaction.member.roles.cache.has(roleId)) {
            return await utils.reply.error(interaction, 'ROLE_ALREADY_OWNED');
        }

        try {
            const currentRoles = Array.from(interaction.member.roles.cache.keys());
            const newRoles = currentRoles.filter(id => !colorRoleIds.includes(id)).concat(roleId);

            await interaction.member.roles.set(newRoles);
            await utils.reply.success(interaction, 'NEW_COLOR', roleId);
        } catch (err) {
            logger.error(`[SelectMenu ▸ ColorsMenu] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'COMMAND_ERROR');
        }
    },
};