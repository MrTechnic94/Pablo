'use strict';

const { SlashCommandBuilder, InteractionContextType, ChannelType } = require('discord.js');
const { channels } = require('../../locales/pl_PL');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Wyświetla informacje o kanale.')
        .setContexts(InteractionContextType.Guild)
        .addChannelOption(option =>
            option.setName('kanał')
                .setDescription('Kanał, o którym chcesz uzyskać informacje.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const channel = interaction.options.getChannel('kanał') ?? interaction.channel;

        const channelType = channels[channel.type] || 'Nieznany.';
        const createdAt = Math.floor(channel.createdTimestamp / 1000);
        const nsfw = channel.nsfw ? 'Tak.' : 'Nie.';
        const parent = channel.parent;

        let channelFieldName = '`🔎` Kanał';

        if (channel.type === ChannelType.GuildCategory) {
            channelFieldName = '`🔎` Kategoria';
        } else if (channel.isThread()) {
            channelFieldName = '`🔎` Wątek';
        }

        const fields = [
            { name: channelFieldName, value: `**•** ${channel}`, inline: false },
            { name: '`🔑` ID', value: `**•** ${channel.id}`, inline: false },
            { name: '`📦` Rodzaj', value: `**•** ${channelType}`, inline: false },
            { name: '`🔞` NSFW', value: `**•** ${nsfw}`, inline: false },
            { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false }
        ];

        if (!channel.isThread()) {
            const topic = channel.topic || 'Brak tematu.';

            fields.splice(3, 0, { name: '`🔢` Pozycja', value: `**•** ${channel.position + 1}`, inline: false });

            fields.push({ name: '`💬` Temat', value: `**•** ${topic}`, inline: false });
        }

        if (parent && channel.type !== ChannelType.GuildCategory) {
            fields.push({ name: '`📂` Kategoria', value: `**•** ${parent}`, inline: false });
        }

        if (channel.isVoiceBased()) {
            const userLimit = channel.userLimit > 0 ? `${channel.userLimit} użytkowników` : 'Brak.';
            const bitrate = `${(channel.bitrate / 1000)} kbps`;

            fields.push({ name: '`🔊` Szczegóły głosowe', value: `**• Limit:** ${userLimit}\n**• Bitrate:** ${bitrate}`, inline: false });
        }

        if (channel.isThread()) {
            const autoArchive = channel.autoArchiveDuration ? utils.formatDuration(channel.autoArchiveDuration * 60000, { fullWords: true }) : 'Nie ustawiono.';

            const archived = channel.archived ? 'Tak.' : 'Nie.';
            const locked = channel.locked ? 'Tak.' : 'Nie.';

            fields.push({ name: '`🧵` Szczegóły wątku', value: `**• Archiwum:** ${archived}\n**• Autoarchiwizacja:** ${autoArchive}\n**• Zablokowany:** ${locked}`, inline: false });
        }

        if (channel.rateLimitPerUser > 0) {
            const slowmodeValue = utils.formatDuration(channel.rateLimitPerUser * 1000, { fullWords: true });

            fields.push({ name: '`⏱️` Tryb powolny', value: `**•** ${slowmodeValue}`, inline: false });
        }

        const successEmbed = utils.createEmbed({
            title: 'Podgląd kanału',
            fields: fields
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};