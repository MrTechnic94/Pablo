'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

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

        // Mapowanie typow kanalow
        const types = {
            0: 'Tekstowy',
            1: 'DM',
            2: 'Głosowy',
            3: 'Grupa DM',
            4: 'Kategoria',
            5: 'Ogłoszenie',
            10: 'Wątek - Ogłoszenie',
            11: 'Wątek - Publiczny',
            12: 'Wątek - Prywatny',
            13: 'Scena',
            14: 'Katalog',
            15: 'Forum',
            16: 'Media',
        };

        // Sprawdzamy, czy kanal jest NSFW
        const nsfw = channel.nsfw ? 'Tak' : 'Nie';

        // Pobieramy kategorie kanalu
        const parent = channel.parent ? `<#${channel.parent.id}>` : 'Nie ustawiono';

        const channelEmbed = new EmbedBuilder()
            .setTitle(`Informacje dla ${channel}`)
            .addFields(
                { name: '❯ ID', value: `${channel.id}`, inline: true },
                { name: '❯ Temat', value: channel.topic || 'Nie ustawiono', inline: true },
                { name: '❯ Kategoria', value: parent, inline: true },
                { name: '❯ NSFW', value: nsfw, inline: true },
                { name: '❯ Pozycja', value: `${channel.position + 1}`, inline: true },
                { name: '❯ Typ', value: types[channel.type] || 'Nieznany', inline: true }
            )
            .setColor(embedOptions.defaultColor)

        return await interaction.reply({ embeds: [channelEmbed] });
    },
};