'use strict';

const { formatDuration } = require('../../plugins/parseTime');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Czas pracy bota.'),
    async execute(interaction) {
        const botUptime = formatDuration(interaction.client.uptime);

        return await interaction.reply({ content: `Czas pracy: ${botUptime}`, flags: MessageFlags.Ephemeral });
    }
};