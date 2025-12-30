'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Sprawdza czas pracy bota.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const botUptime = Math.floor(interaction.client.readyTimestamp / 1000);

        await interaction.reply({ content: `\`🕒\` Uruchomiono: <t:${botUptime}:R>` });
    },
};