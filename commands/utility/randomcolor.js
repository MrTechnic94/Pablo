'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomcolor')
        .setDescription('Generuje losowy kolor.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const dec = Math.floor(Math.random() * 16777216);
        const hex = dec.toString(16).padStart(6, '0').toUpperCase();

        const embed = new EmbedBuilder()
            .setTitle('❯ Losowy kolor')
            .setDescription(`**• Decimal:** ${dec}\n**• Hex:** #${hex}`)
            .setThumbnail(`https://dummyimage.com/400x400/${hex}/${hex}`)
            .setColor(dec);

        return await interaction.reply({ embeds: [embed] });
    },
};