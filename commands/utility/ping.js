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
            await interaction.reply({ content: '`⏳` Pingowanie...' });

            const latency = Date.now() - start;
            const ws = interaction.client.ws.ping;

            const getEmoji = (val) => val > 600 ? '`🔴`' : val > 300 ? '`🟠`' : '`🟢`';

            const successEmbed = utils.createEmbed({
                title: 'Status połączenia',
                description: `${getEmoji(latency)} **Opóźnienie:** ${latency}ms\n${getEmoji(ws)} **Websocket:** ${ws > 0 ? `${ws}ms` : 'Brak danych.'}`
            });

            await interaction.editReply({ content: '', embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Ping] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'API_CONNECTION_ERROR');
        }
    },
};