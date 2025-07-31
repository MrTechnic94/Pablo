'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sprawdza opóźnienie bota.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        try {
            await interaction.reply({ content: 'Pingowanie...' });

            const sent = await interaction.fetchReply();
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply(`🏓 Pong!\nOpóźnienie: ${latency}ms\nWebsocket: ${interaction.client.ws.ping}ms`);
        } catch (err) {
            logger.error(`[Cmd - ping] ${err}`);
            await interaction.reply({ content: '❌ Nie udało się uzyskać informacji o bieżącym połączeniu.', flags: MessageFlags.Ephemeral });
        }
    },
};