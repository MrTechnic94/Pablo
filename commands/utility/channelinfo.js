'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');

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
            1: 'Wiadomość prywatna',
            2: 'Głosowy',
            3: 'Grupowa wiadomość prywatna',
            4: 'Kategoria',
            5: 'Ogłoszenie',
            10: 'Wątek ogłoszeniowy',
            11: 'Wątek publiczny',
            12: 'Wątek prywatny',
            13: 'Scena',
            14: 'Katalog',
            15: 'Forum',
            16: 'Media'
        };

        const nsfw = channel.nsfw ? 'Tak' : 'Nie';

        const parent = channel.parent ? channel.parent.name : 'Nie ustawiono';

        const topic = channel.topic || 'Nie ustawiono';

        const channelType = types[channel.type] || 'Nieznany';

        const successEmbed = createEmbed({
            title: 'Podgląd kanału',
            fields: [
                { name: '`🔎` Kanał', value: `**•** ${channel}` },
                { name: '`🔑` ID', value: `**•** ${channel.id}` },
                { name: '`💬` Temat', value: `**•** ${topic}` },
                { name: '`📂` Kategoria', value: `**•** ${parent}` },
                { name: '`🔞` NSFW', value: `**•** ${nsfw}` },
                { name: '`🔢` Pozycja', value: `**•** ${channel.position + 1}` },
                { name: '`📦` Rodzaj', value: `**•** ${channelType}` }
            ]
        });

        return await interaction.reply({ embeds: [successEmbed] });
    },
};