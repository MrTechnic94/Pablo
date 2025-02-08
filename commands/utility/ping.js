'use strict';

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sprawdza opóźnienie bota.'),
    async execute(interaction) {
        await interaction.reply({ content: 'Pinging...' });

        const sent = await interaction.fetchReply();
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        return await interaction.editReply(`🏓 Pong!\nOpóźnienie: ${latency}ms\nWebsocket: ${interaction.client.ws.ping}ms`);
    }
};