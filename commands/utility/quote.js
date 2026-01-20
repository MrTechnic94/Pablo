'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { verseOfTheDay, randomVerse } = require('../../lib/services/verseApi');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Wyświetla werset z Biblii.')
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
        const { utils } = interaction.client;

        const versetType = interaction.options.getString('rodzaj') || 'daily';

        const verseFuncs = {
            daily: { fn: verseOfTheDay, title: 'Werset dnia' },
            random: { fn: randomVerse, title: 'Losowy werset' }
        };

        const { fn, title } = verseFuncs[versetType] || verseFuncs.daily;

        try {
            const { reference, content } = await fn(logger);

            if (!reference || !content) {
                return utils.reply.error(interaction, 'FETCH_ERROR', title.toLowerCase());
            }

            const successEmbed = utils.createEmbed({
                title: `\`📜\` ${title} (${reference})`,
                description: content
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Quote] ${err}`);
            await utils.reply.error(interaction, 'FETCH_ERROR', title.toLowerCase());
        }
    },
};