'use strict';

const { getConfig, syncConfig } = require('../core/configManipulator');
const { createEmbed } = require('../utils/createEmbed');
const { ChannelType } = require('discord.js');

async function embedUpdater(client, logger) {
    const config = getConfig();

    const channelId = global.isDev ? config.developer.embedUpdaterChannel : config.channels.statystykiSerwera;
    const messageId = global.isDev ? config.developer.embedUpdaterEmbed : config.embeds.statisticsEmbed;

    const channel = await client.channels.fetch(channelId);

    if (channel?.type !== ChannelType.GuildText) {
        return logger.error('[EmbedUpdater] Set ID is not a text channel.');
    }

    // Uzytkownicy
    const memberCount = channel.guild.memberCount;
    let onlineCount = 0;
    for (const member of channel.guild.members.cache.values()) {
        if (member.presence && ['online', 'idle', 'dnd'].includes(member.presence.status)) onlineCount++;
    }

    // Emotki
    let totalEmotes = 0, staticEmotes = 0, animatedEmotes = 0;
    for (const e of channel.guild.emojis.cache.values()) {
        totalEmotes++;
        if (e.animated) animatedEmotes++;
        else staticEmotes++;
    }

    // Kanaly
    let textChannels = 0, voiceChannels = 0, categories = 0;
    for (const c of channel.guild.channels.cache.values()) {
        switch (c.type) {
            case ChannelType.GuildText: textChannels++; break;
            case ChannelType.GuildVoice:
            case ChannelType.GuildStageVoice: voiceChannels++; break;
            case ChannelType.GuildCategory: categories++; break;
        }
    }

    // Utworzono
    const guildCreatedAt = Math.floor(channel.guild.createdTimestamp / 1000);

    // Kanaly glosowe
    let voiceActive = 0, stageActive = 0, selfMuted = 0, selfDeafened = 0, serverMuted = 0, serverDeafened = 0;
    for (const vc of channel.guild.voiceStates.cache.values()) {
        if (!vc.channel) continue;
        if (vc.channel.type === ChannelType.GuildVoice) voiceActive++;
        else if (vc.channel.type === ChannelType.GuildStageVoice) stageActive++;
        if (vc.selfMute) selfMuted++;
        if (vc.selfDeaf) selfDeafened++;
        if (vc.serverMute) serverMuted++;
        if (vc.serverDeaf) serverDeafened++;
    }

    // Role
    // Odjecie 1 ze wzgledu na wykluczenie 'roli' @everyone
    const rolesCount = channel.guild.roles.cache.size - 1;

    const successEmbed = createEmbed({
        author: {
            name: channel.guild.name,
            iconURL: channel.guild.iconURL()
        },
        fields: [
            {
                name: '**• Użytkownicy**',
                value: `\`👤\` **Łącznie:** ${memberCount}\n\`🟢\` **Online:** ${onlineCount}`,
                inline: true,
            },
            {
                name: '**• Kanały**',
                value: `\`🖊️\` **Tekstowe:** ${textChannels}\n\`🔊\` **Głosowe:** ${voiceChannels}\n\`📂\` **Kategorie:** ${categories}`,
                inline: true,
            },
            {
                name: '**• Kanały głosowe**',
                value: `${config.emojis.voice} ${voiceActive} ${config.emojis.stage} ${stageActive}\n${config.emojis.selfMute} ${selfMuted} ${config.emojis.selfDeaf} ${selfDeafened}\n${config.emojis.serverMute} ${serverMuted} ${config.emojis.serverDeaf} ${serverDeafened}`,
                inline: true,
            },
            {
                name: '**• Emotki**',
                value: `\`⭐\` **Łącznie:** ${totalEmotes}\n\`💎\` **Nieruchome:** ${staticEmotes}\n\`👾\` **Animowane:** ${animatedEmotes}`,
                inline: true,
            },
            {
                name: '**• Utworzono**',
                value: `\`📆\` <t:${guildCreatedAt}>`,
                inline: true,
            },
            {
                name: '**• Role**',
                value: `\`🎭\` **Łącznie:** ${rolesCount}`,
                inline: true
            }
        ],
        timestamp: new Date(),
        footer: {
            text: 'Zaktualizowano'
        }
    });

    try {
        if (messageId) {
            const message = await channel.messages.fetch(messageId);
            await message.edit({ embeds: [successEmbed] });
        } else {
            const sent = await channel.send({ embeds: [successEmbed] });

            if (global.isDev) config.developer.embedUpdaterEmbed = sent.id;
            else config.embeds.statisticsEmbed = sent.id;

            syncConfig(config);
            logger.info(`[EmbedUpdater] The new embed has been sent, and its ID is: '${sent.id}'.`);
        }
    } catch (err) {
        logger.error(`[EmbedUpdater] Error while updating an embed:\n${err}`);
    }
}

module.exports = embedUpdater;