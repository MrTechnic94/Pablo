'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { formatDuration } = require('../../lib/utils/parseTime');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Sprawdza czas pracy bota.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const botUptime = formatDuration(interaction.client.uptime);

        await interaction.reply({ content: `\`🕒\` Czas pracy: ${botUptime}` });
    },
};