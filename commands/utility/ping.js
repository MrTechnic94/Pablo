'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sprawdza opóźnienie bota.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        try {
            const start = Date.now();
            await interaction.reply({ content: 'Pingowanie...' });

            const latency = Date.now() - start;
            await interaction.editReply(`\`🏓\` Pong!\nOpóźnienie: ${latency}ms\nWebsocket: ${interaction.client.ws.ping}ms`);
        } catch (err) {
            logger.error(`[Slash ▸ Ping] ${err}`);
            await utils.reply.error(interaction, 'API_CONNECTION_ERROR');
        }
    },
};