'use strict';

const { getConfig, syncConfig } = require('./readConfig');
const { createEmbed } = require('./createEmbed');
const { ChannelType } = require('discord.js');

async function embedUpdater(client, logger) {
    const config = getConfig();

    const channelId = config.channelsConfig.statystykiSerwera;
    const messageId = config.embedConfig.statisticsEmbed;

    const channel = await client.channels.fetch(channelId);

    if (!channel || !(channel.type === ChannelType.GuildText)) {
        return logger.error('[EmbedUpdater] Set ID is not a text channel.');
    }

    const guild = channel.guild;

    // Uzytkownicy
    const memberCount = guild.memberCount;
    const onlineCount = guild.members.cache.filter(m =>
        ['online', 'idle', 'dnd'].includes(m.presence?.status)
    ).size;

    // Emotki
    const totalEmotes = guild.emojis.cache.size;
    const staticEmotes = guild.emojis.cache.filter(e => !e.animated).size;
    const animatedEmotes = guild.emojis.cache.filter(e => e.animated).size;

    // Kanaly
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    // Utworzono
    const guildCreatedAt = Math.floor(guild.createdTimestamp / 1000);

    // Kanaly glosowe
    const voiceActive = guild.voiceStates.cache.filter(vc => vc.channel !== null).size;
    const selfMuted = guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.selfMute).size;
    const selfDeafened = guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.selfDeaf).size;
    const serverMuted = guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.serverMute).size;
    const serverDeafened = guild.voiceStates.cache.filter(vc => vc.channel !== null && vc.serverDeaf).size;

    // Role
    const rolesCount = guild.roles.cache.size - 1;

    const embed = createEmbed({
        author: {
            name: guild.name,
            iconURL: guild.iconURL()
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
                value: `${config.emojisConfig.stage} ${voiceActive}\n${config.emojisConfig.selfMute} ${selfMuted} ${config.emojisConfig.selfDeaf} ${selfDeafened}\n${config.emojisConfig.serverMute} ${serverMuted} ${config.emojisConfig.serverDeaf} ${serverDeafened}`,
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