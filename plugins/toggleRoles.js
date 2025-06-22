'use strict';

const { MessageFlags } = require('discord.js');

async function toggleRoles(interaction, roleId) {
    if (interaction.member.roles.cache.has(roleId)) {
        await interaction.member.roles.remove(roleId);
        await interaction.reply({
            content: `Rola <@&${roleId}> została usunięta.`,
            flags: MessageFlags.Ephemeral,
        });
    } else {
        await interaction.member.roles.add(roleId);
        await interaction.reply({
            content: `Rola <@&${roleId}> została dodana.`,
            flags: MessageFlags.Ephemeral,
        });
    }
};

module.exports = { toggleRoles };