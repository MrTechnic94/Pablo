'use strict';

const { getConfig, syncConfig } = require('./configManipulator');
const { createEmbed } = require('./createEmbed');
const { ChannelType } = require('discord.js');

async function embedUpdater(client, logger) {
    const config = getConfig();

    const channelId = config.channels.statystykiSerwera;
    const messageId = config.embeds.statisticsEmbed;

    const channel = await client.channels.fetch(channelId);

    if (!channel || !(channel.type === ChannelType.GuildText)) {
        return logger.error('[EmbedUpdater] Set ID is not a text channel.');
    }

    // Uzytkownicy
    const memberCount = channel.guild.memberCount;
    const onlineCount = channel.guild.members.cache.filter(m =>
        ['online', 'idle', 'dnd'].includes(m.presence?.status)
    ).size;

    // Emotki
    const totalEmotes = channel.guild.emojis.cache.size;
    const staticEmotes = channel.guild.emojis.cache.filter(e => !e.animated).size;
    const animatedEmotes = channel.guild.emojis.cache.filter(e => e.animated).size;

    // Kanaly
    const textChannels = channel.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = channel.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice).size;
    const categories = channel.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    // Utworzono
    const guildCreatedAt = Math.floor(channel.guild.createdTimestamp / 1000);

    // Kanaly glosowe
    const voiceActive = channel.guild.voiceStates.cache.filter(vc => vc.channel !== null).size;
    const selfMuted = channel.guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.selfMute).size;
    const selfDeafened = channel.guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.selfDeaf).size;
    const serverMuted = channel.guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.serverMute).size;
    const serverDeafened = channel.guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.serverDeaf).size;

    // Role
    // Odjecie 1 ze wzgledu na wykluczenie 'roli' @everyone
    const rolesCount = channel.guild.roles.cache.size - 1;

    const embed = createEmbed({
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
                value: `${config.emojis.stage} ${voiceActive}\n${config.emojis.selfMute} ${selfMuted} ${config.emojis.selfDeaf} ${selfDeafened}\n${config.emojis.serverMute} ${serverMuted} ${config.emojis.serverDeaf} ${serverDeafened}`,
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
            await message.edit({ embeds: [embed] });
        } else {
            const sent = await channel.send({ embeds: [embed] });
            config.embedConfig.statisticsEmbed = sent.id;
            syncConfig(config);
            logger.info(`[EmbedUpdater] The new embed has been sent, and its ID is: '${sent.id}'.`);
        }
    } catch (err) {
        logger.error(`[EmbedUpdater] Error while updating an embed:\n${err}`);
    }
}

module.exports = embedUpdater;