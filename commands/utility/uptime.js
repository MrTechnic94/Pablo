'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { formatDuration } = require('../../plugins/parseTime');

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