'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Wyświetla informacje o kanale.')
        .addChannelOption(option =>
            option.setName('kanał')
                .setDescription('Kanał, o którym chcesz uzyskać informacje.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanał') || interaction.channel;

        const types = {
            0: 'Tekstowy',
            1: 'DM',
            2: 'Głosowy',
            3: 'Grupa DM',
            4: 'Kategoria',
            5: 'Ogłoszenie',
            10: 'Wątek ogłoszenia',
            11: 'Wątek publiczny',
            12: 'Wątek prywatny',
            13: 'Scena',
            14: 'Katalog',
            15: 'Forum',
            16: 'Media'
        };

        const nsfw = channel.nsfw ? 'Tak' : 'Nie';

        const parent = channel.parent ? channel.parent.name : 'Nie ustawiono';

        const successEmbed = new EmbedBuilder()
            .setTitle(`Podgląd kanału ${channel}`)
            .addFields(
                { name: '\`🔑\` ID', value: `**•** ${channel.id}`, inline: false },
                { name: '\`💬\` Temat', value: `**•** ${channel.topic || 'Nie ustawiono'}`, inline: false },
                { name: '\`📂\` Kategoria', value: `**•** ${parent}`, inline: false },
                { name: '\`🔞\` NSFW', value: `**•** ${nsfw}`, inline: false },
                { name: '\`🔢\` Pozycja', value: `**•** ${channel.position + 1}`, inline: false },
                { name: '\`📦\` Rodzaj', value: `**•** ${types[channel.type] || 'Nieznany'}`, inline: false }
            )
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [successEmbed] });
    },
};