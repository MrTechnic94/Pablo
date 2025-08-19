'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { verseOfTheDay, randomVerse } = require('../../plugins/verseApi');
const { createEmbed } = require('../../plugins/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Werset z Biblii.')
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Wybierz werset z Biblii który chcesz zobaczyć.')
                .setRequired(false)
                .addChoices(
                    { name: 'Werset na dzień', value: 'daily' },
                    { name: 'Losowy werset', value: 'random' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        const versetType = interaction.options.getString('rodzaj') || 'daily';

        const verseFuncs = {
            daily: { fn: verseOfTheDay, title: 'Werset dnia' },
            random: { fn: randomVerse, title: 'Losowy werset' }
        };

        const { fn, title } = verseFuncs[versetType] || verseFuncs.daily;

        try {
            const { reference, content } = await fn();

            if (!reference || !content) {
                return interaction.reply({ content: `❌ Nie udało się pobrać ${title.toLowerCase()}.`, flags: MessageFlags.Ephemeral });
            }

            const successEmbed = createEmbed({
                title: `📜 ${title} (${reference})`,
                description: content
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - quote] ${err}`);
            await interaction.reply({ content: `❌ Wystąpił problem podczas pobierania ${title.toLowerCase()}.`, flags: MessageFlags.Ephemeral });
        }
    },
};