'use strict';

const { formatDuration } = require('../../plugins/parseTime');
const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Czas pracy bota.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const botUptime = formatDuration(interaction.client.uptime);

        return await interaction.reply({ content: `Czas pracy: ${botUptime}`, flags: MessageFlags.Ephemeral });
    },
};