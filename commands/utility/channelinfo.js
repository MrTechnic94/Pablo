'use strict';

const { SlashCommandBuilder, InteractionContextType, ChannelType } = require('discord.js');
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
            [ChannelType.GuildText]: 'Tekstowy',
            [ChannelType.DM]: 'Wiadomość prywatna',
            [ChannelType.GuildVoice]: 'Głosowy',
            [ChannelType.GroupDM]: 'Grupowa wiadomość prywatna',
            [ChannelType.GuildCategory]: 'Kategoria',
            [ChannelType.GuildAnnouncement]: 'Ogłoszenie',
            [ChannelType.AnnouncementThread]: 'Wątek ogłoszeniowy',
            [ChannelType.PublicThread]: 'Wątek publiczny',
            [ChannelType.PrivateThread]: 'Wątek prywatny',
            [ChannelType.GuildStageVoice]: 'Scena',
            [ChannelType.GuildDirectory]: 'Katalog',
            [ChannelType.GuildForum]: 'Forum',
            [ChannelType.GuildMedia]: 'Media'
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