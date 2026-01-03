'use strict';

const { roles } = require('../../config/default.json');
const reply = require('../../lib/utils/responder');

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
    async execute(interaction) {
        const roleId = roleMap[interaction.values[0]];

        if (interaction.member.roles.cache.has(roleId)) {
            return await reply.error(interaction, 'ROLE_ALREADY_OWNED');
        }

        const currentRoles = Array.from(interaction.member.roles.cache.keys());
        const newRoles = currentRoles.filter(id => !colorRoleIds.includes(id)).concat(roleId);

        await interaction.member.roles.set(newRoles);
        await reply.success(interaction, 'NEW_COLOR', roleId);
    }
};