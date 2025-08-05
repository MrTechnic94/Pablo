'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');
const verseOfTheDay = require('../../plugins/verseApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Werset z Biblii na dzień.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        try {
            const { reference, content } = await verseOfTheDay();

            if (!reference || !content) {
                return interaction.reply({ content: '❌ Nie udało się pobrać wersetu dnia.', flags: MessageFlags.Ephemeral });
            }

            const successEmbed = createEmbed({
                title: `📜 Werset dnia (${reference})`,
                description: `${content}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - quote] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił błąd podczas pobierania wersetu dnia.', flags: MessageFlags.Ephemeral });
        }
    },
};