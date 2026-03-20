'use strict';

const { PresenceUpdateStatus, ChannelType, WebhookClient, RESTJSONErrorCodes } = require('discord.js');
const { botOptions, defaultPermissions, emojis } = require('../../config/default.json');

async function embedUpdater(client, logger, guildId) {
    try {
        if (!guildId) return;

        const { utils } = client;

        const dbKey = `guild:${guildId}:settings`;

        const settings = await utils.db.hGetAll(dbKey);

        const channelId = settings.statisticsChannelId;
        const messageId = settings.statisticsEmbedId;
        let webhookId = settings.statisticsWebhookId;
        let webhookToken = settings.statisticsWebhookToken;

        const guild = client.guilds.cache.get(guildId);
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        // Sprawdzanie czy kanal tekstowy jest poprawnie ustawiony
        if (!channel) {
            await utils.db.hDel(dbKey, ['statisticsChannelId', 'statisticsEmbedId']);
            await utils.db.sRem('statistics:activeGuilds', guildId);

            return logger.error(`[EmbedUpdater] Target ID not found for '${guildId}'.`);
        }

        // Sprawdzanie permisji
        if (typeof channel.permissionsFor !== 'function') {
            return logger.debug(`[EmbedUpdater] Could not check permissions for channel type '${channel.type}' in '${guildId}'.`);
        }

        const botPermissions = channel.permissionsFor(client.user);
        const missing = botPermissions.missing(defaultPermissions);

        if (!botPermissions.has(defaultPermissions)) {
            return logger.debug(`[EmbedUpdater] Missing permissions: '${missing.join(', ')}'.`);
        }

        // Tworzenie webhooka
        if (!webhookId || !webhookToken) {
            try {
                const webhook = await channel.createWebhook({
                    name: client.user.username,
                    avatar: botOptions.avatarDefaultPath,
                    reason: 'Automatyczne tworzenie webhooka dla statystyk.'
                });

                webhookId = webhook.id;
                webhookToken = webhook.token;

                await utils.db.hSet(dbKey, {
                    statisticsWebhookId: webhookId,
                    statisticsWebhookToken: webhookToken
                });

                logger.info(`[EmbedUpdater] Created new webhook for '${guildId}'.`);
            } catch (err) {
                logger.error(`[EmbedUpdater] Failed to create webhook for '${guildId}':\n${err}`);
            }
        }

        // Uzytkownicy
        const allMembers = await channel.guild.members.fetch().catch(() => null);
        const totalMembers = channel.guild.memberCount;
        let onlineCount = 0;

        if (allMembers) {
            allMembers.forEach(member => {
                if (member.presence && member.presence.status !== PresenceUpdateStatus.Offline) onlineCount++;
            });
        } else {
            onlineCount = channel.guild.members.cache.filter(m =>
                m.presence && m.presence.status !== PresenceUpdateStatus.Offline
            ).size;
        }

        // Emotki
        const guildEmojis = channel.guild.emojis.cache;
        const emojisCount = { total: guildEmojis.size, static: 0, animated: 0 };

        for (const e of guildEmojis.values()) {
            if (e.animated) emojisCount.animated++;
            else emojisCount.static++;
        }

        // Kanaly
        const channelCounts = { text: 0, voice: 0, categories: 0 };

        for (const c of channel.guild.channels.cache.values()) {
            if (c.type === ChannelType.GuildText) channelCounts.text++;
            else if (c.isVoiceBased()) channelCounts.voice++;
            else if (c.type === ChannelType.GuildCategory) channelCounts.categories++;
        }

        // Utworzono
        const guildCreatedAt = Math.floor(channel.guild.createdTimestamp / 1000);

        // Kanaly glosowe
        const voiceCounts = { voice: 0, stage: 0, selfMuted: 0, selfDeafened: 0, serverMuted: 0, serverDeafened: 0 };

        for (const vs of channel.guild.voiceStates.cache.values()) {
            if (!vs.channelId) continue;

            const vChannel = vs.channel;
            if (!vChannel) continue;

            if (vChannel.type === ChannelType.GuildVoice) voiceCounts.voice++;
            else if (vChannel.type === ChannelType.GuildStageVoice) voiceCounts.stage++;

            const { selfMute, selfDeaf, serverMute, serverDeaf } = vs;
            if (selfMute) voiceCounts.selfMuted++;
            if (selfDeaf) voiceCounts.selfDeafened++;
            if (serverMute) voiceCounts.serverMuted++;
            if (serverDeaf) voiceCounts.serverDeafened++;
        }

        // Role (-1 ze wzgledu na wykluczenie 'roli' @everyone)
        const rolesCount = channel.guild.roles.cache.size - 1;

        const successEmbed = utils.createEmbed({
            author: {
                name: channel.guild.name,
                iconURL: channel.guild.iconURL()
            },
            fields: [
                {
                    name: '**• Użytkownicy**',
                    value: `\`👤\` **Łącznie:** ${totalMembers}\n\`🟢\` **Online:** ${onlineCount}`,
                    inline: true,
                },
                {
                    name: '**• Kanały**',
                    value: `\`🖊️\` **Tekstowe:** ${channelCounts.text}\n\`🔊\` **Głosowe:** ${channelCounts.voice}\n\`📂\` **Kategorie:** ${channelCounts.categories}`,
                    inline: true,
                },
                {
                    name: '**• Kanały głosowe**',
                    value: `${emojis.voice} ${voiceCounts.voice} ${emojis.stage} ${voiceCounts.stage}\n${emojis.selfMute} ${voiceCounts.selfMuted} ${emojis.selfDeaf} ${voiceCounts.selfDeafened}\n${emojis.serverMute} ${voiceCounts.serverMuted} ${emojis.serverDeaf} ${voiceCounts.serverDeafened}`,
                    inline: true,
                },
                {
                    name: '**• Emotki**',
                    value: `\`⭐\` **Łącznie:** ${emojisCount.total}\n\`💎\` **Nieruchome:** ${emojisCount.static}\n\`👾\` **Animowane:** ${emojisCount.animated}`,
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

        const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

        try {
            await webhookClient.editMessage(messageId, { embeds: [successEmbed] });
        } catch {
            const sent = await webhookClient.send({ embeds: [successEmbed] });

            await utils.db.hSet(dbKey, 'statisticsEmbedId', sent.id);

            logger.info(`[EmbedUpdater] The new webhook message has been sent, and its ID is '${sent.id}' for '${guildId}'.`);
        }
    } catch (err) {
        logger.error(`[EmbedUpdater] Error while updating an embed for '${guildId}':\n${err}`);

        if (err.code === RESTJSONErrorCodes.UnknownWebhook) {
            await client.utils.db.hDel(`guild:${guildId}`, ['statisticsWebhookId', 'statisticsWebhookToken', 'statisticsEmbedId']);

            logger.warn(`[EmbedUpdater] Webhook for '${guildId}' was invalid... Cleared from database.`);
        }
    }
}

module.exports = embedUpdater;