'use strict';

const { SlashCommandBuilder, InteractionContextType, PresenceUpdateStatus, ChannelType } = require('discord.js');
const { verification } = require('../../locales/pl_PL');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Wyświetla informacje o serwerze.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        // Wlasciciel
        const owner = await interaction.guild.fetchOwner().catch(() => null);

        // Kiedy utworzono
        const createdAt = Math.floor(interaction.guild.createdTimestamp / 1000);

        // Uzytkownicy
        const totalMembers = interaction.guild.memberCount;
        let membersToCount = interaction.guild.members.cache;

        if (membersToCount.size <= 1) {
            membersToCount = await interaction.guild.members.fetch().catch(() => null);
        }

        const onlineCount = membersToCount.filter(m =>
            m.presence?.status && m.presence.status !== PresenceUpdateStatus.Offline
        ).size;

        // Emotki
        const emojiCount = interaction.guild.emojis.cache.size;
        const stickerCount = interaction.guild.stickers.cache.size;

        // Kanaly
        const channelCounts = { text: 0, voice: 0, categories: 0 };

        for (const c of interaction.channel.guild.channels.cache.values()) {
            if (c.type === ChannelType.GuildText) channelCounts.text++;
            else if (c.isVoiceBased()) channelCounts.voice++;
            else if (c.type === ChannelType.GuildCategory) channelCounts.categories++;
        }

        // AFK
        const afkChannelName = interaction.guild.afkChannel ? `${interaction.guild.afkChannel}` : 'Brak.';
        const afkTimeout = interaction.guild.afkTimeout ? utils.formatDuration(interaction.guild.afkTimeout * 1000, { fullWords: true }) : 'Brak.';
        const afkInfo = `**• Kanał:** ${afkChannelName}\n**• Limit czasu:** ${afkTimeout}`;

        // Nitro boost
        const boostLevel = interaction.guild.premiumTier;
        const boostCount = interaction.guild.premiumSubscriptionCount;

        const successEmbed = utils.createEmbed({
            title: 'Podgląd serwera',
            thumbnail: interaction.guild.iconURL(),
            fields: [
                { name: '`🔍` Serwer', value: `**•** ${interaction.guild.name}`, inline: false },
                { name: '`🔑` ID', value: `**•** ${interaction.guild.id}`, inline: false },
                { name: '`👑` Właściciel', value: `**•** <@${owner.id}>`, inline: false },
                { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: '`👥` Użytkownicy', value: `**• Łącznie:** ${totalMembers}\n**• Online:** ${onlineCount}`, inline: false },
                { name: '`🎭` Role', value: `**• Łącznie:** ${interaction.guild.roles.cache.size - 1}`, inline: false },
                { name: '`#️⃣` Kanały', value: `**• Tekstowe:** ${channelCounts.text}\n**• Głosowe:** ${channelCounts.voice}\n**• Kategorie:** ${channelCounts.categories}`, inline: false },
                { name: '`💜` Nitro boost', value: `**• Poziom:** ${boostLevel}\n**• Boosty:** ${boostCount || 0}`, inline: false },
                { name: '`📸` Media', value: `**• Emotki:** ${emojiCount}\n**• Naklejki:** ${stickerCount}`, inline: false },
                { name: '`🛡️` Poziom weryfikacji', value: `**•** ${verification[interaction.guild.verificationLevel]}`, inline: false },
                { name: '`🌙` AFK', value: afkInfo, inline: false }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};