'use strict';

const { defaultPermissions, emojis } = require('../../config/default.json');
const { PresenceUpdateStatus, ChannelType } = require('discord.js');

async function embedUpdater(client, logger, guildId) {
    try {
        if (!guildId) return;

        const { utils } = client;

        const dbKey = `guild:${guildId}`;

        const settings = await utils.db.hGetAll(dbKey);

        const channelId = settings.statisticsChannel;
        const messageId = settings.statisticsEmbed;

        const guild = client.guilds.cache.get(guildId);
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        // Sprawdzanie czy kanal tekstowy jest poprawnie ustawiony
        if (!channel) {
            await utils.db.hDel(dbKey, ['statisticsChannel', 'statisticsEmbed']);
            await utils.db.sRem('statistics:activeGuilds', guildId);

            return logger.error('[EmbedUpdater] Target ID not found.');
        }

        // Sprawdzanie permisji
        const botPermissions = channel.permissionsFor(client.user);

        if (!botPermissions.has(defaultPermissions)) {
            const missing = botPermissions.missing(defaultPermissions);
            return logger.error(`[EmbedUpdater] Missing permissions: ${missing.join(', ')}`);
        }

        // Uzytkownicy
        const memberCount = channel.guild.memberCount;
        let onlineCount = 0;
        for (const member of channel.guild.members.cache.values()) {
            if (member.presence && ![PresenceUpdateStatus.Offline, PresenceUpdateStatus.Invisible].includes(member.presence.status)) onlineCount++;
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

        const successEmbed = utils.createEmbed({
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
                    value: `${emojis.voice} ${voiceActive} ${emojis.stage} ${stageActive}\n${emojis.selfMute} ${selfMuted} ${emojis.selfDeaf} ${selfDeafened}\n${emojis.serverMute} ${serverMuted} ${emojis.serverDeaf} ${serverDeafened}`,
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

        let message = null;

        if (messageId) {
            message = await channel.messages.fetch(messageId).catch(() => null);
        }

        if (message) {
            await message.edit({ embeds: [successEmbed] });
        } else {
            const sent = await channel.send({ embeds: [successEmbed] });

            await utils.db.hSet(dbKey, 'statisticsEmbed', sent.id);

            logger.info(`[EmbedUpdater] The new embed has been sent, and its ID is '${sent.id}' for '${guildId}'.`);
        }
    } catch (err) {
        logger.error(`[EmbedUpdater] Error while updating an embed:\n${err}`);
    }
}

module.exports = embedUpdater;