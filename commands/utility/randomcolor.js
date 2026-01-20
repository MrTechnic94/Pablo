'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('randomcolor')
        .setDescription('Generuje losowy kolor.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const dec = Math.floor(Math.random() * 16777216);
        const hex = dec.toString(16).padStart(6, '0').toUpperCase();

        const successEmbed = utils.createEmbed({
            title: 'Losowy kolor',
            description: `\`📟\` **Decimal:** ${dec}\n\`🎨\` **Hex:** #${hex}`,
            thumbnail: `https://dummyimage.com/400x400/${hex}/${hex}`,
            color: dec
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};