'use strict';

const { SlashCommandBuilder, InteractionContextType, ChannelType } = require('discord.js');
const { formatDuration } = require('../../lib/utils/parseTime');
const { verification } = require('../../locales/pl_PL');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Wyświetla informacje o serwerze.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const guild = interaction.guild;

        // Wlasciciel
        const owner = await guild.fetchOwner();

        // Kiedy utworzono
        const createdAt = Math.floor(guild.createdTimestamp / 1000);

        // Uzytkownicy
        const onlineMembers = guild.members.cache.filter(m =>
            ['online', 'idle', 'dnd'].includes(m.presence?.status)
        ).size;

        // Emotki
        const emojiCount = guild.emojis.cache.size;
        const stickerCount = guild.stickers.cache.size;

        // Kanaly
        const channelCounts = guild.channels.cache.reduce((acc, channel) => {
            switch (channel.type) {
                case ChannelType.GuildText:
                    acc.text++;
                    break;
                case ChannelType.GuildVoice:
                case ChannelType.GuildStageVoice:
                    acc.voice++;
                    break;
                case ChannelType.GuildCategory:
                    acc.category++;
                    break;
            }
            return acc;
        }, { text: 0, voice: 0, category: 0 });

        // AFK
        const afkChannelName = guild.afkChannel ? `${guild.afkChannel}` : 'Brak.';
        const afkTimeout = guild.afkTimeout ? formatDuration(guild.afkTimeout * 1000, { fullWords: true }) : 'Brak.';
        const afkInfo = `**• Kanał:** ${afkChannelName}\n**• Limit czasu:** ${afkTimeout}`;

        // Nitro boost
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount;

        const successEmbed = createEmbed({
            title: 'Podgląd serwera',
            thumbnail: guild.iconURL(),
            fields: [
                { name: '`🔍` Serwer', value: `**•** ${guild.name}`, inline: false },
                { name: '`🔑` ID', value: `**•** ${guild.id}`, inline: false },
                { name: '`👑` Właściciel', value: `**•** <@${owner.id}>`, inline: false },
                { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: '`👥` Użytkownicy', value: `**• Łącznie:** ${guild.memberCount}\n**• Online:** ${onlineMembers}`, inline: false },
                { name: '`🎭` Role', value: `**• Łącznie:** ${guild.roles.cache.size - 1}`, inline: false },
                { name: '`#️⃣` Kanały', value: `**• Tekstowe:** ${channelCounts.text}\n**• Głosowe:** ${channelCounts.voice}\n**• Kategorie:** ${channelCounts.category}`, inline: false },
                { name: '`💜` Nitro boost', value: `**• Poziom:** ${boostLevel}\n**• Boosty:** ${boostCount || 0}`, inline: false },
                { name: '`📸` Media', value: `**• Emotki:** ${emojiCount}\n**• Naklejki:** ${stickerCount}`, inline: false },
                { name: '`🛡️` Poziom weryfikacji', value: `**•** ${verification[guild.verificationLevel]}`, inline: false },
                { name: '`🌙` AFK', value: afkInfo, inline: false }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};