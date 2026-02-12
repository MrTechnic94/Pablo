'use strict';

const { PresenceUpdateStatus, ChannelType, WebhookClient } = require('discord.js');
const { botOptions, defaultPermissions, emojis } = require('../../config/default.json');

async function embedUpdater(client, logger, guildId) {
    try {
        if (!guildId) return;

        const { utils } = client;

        const dbKey = `guild:${guildId}`;

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

        // Sprawdza czy webhook jest poprawnie ustawiony
        if (webhookId && webhookToken) {
            try {
                await client.fetchWebhook(webhookId);
            } catch {
                logger.warn(`[EmbedUpdater] Webhook in database is invalid for '${guildId}'. Creating new...`);
                webhookId = null;
                webhookToken = null;
                await utils.db.hDel(dbKey, ['statisticsWebhookId', 'statisticsWebhookToken']);
            }
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

        // Sprawdzanie permisji
        const botPermissions = channel.permissionsFor(client.user);

        if (!botPermissions.has(defaultPermissions)) {
            const missing = botPermissions.missing(defaultPermissions);
            return logger.error(`[EmbedUpdater] Missing permissions: ${missing.join(', ')}`);
        }

        // Uzytkownicy
        const allMembers = await channel.guild.members.fetch().catch(() => null);
        const totalMembers = channel.guild.memberCount;
        let onlineCount = 0;

        if (allMembers) {
            allMembers.forEach(member => {
                if (member.presence &&
                    member.presence.status !== PresenceUpdateStatus.Offline &&
                    member.presence.status !== PresenceUpdateStatus.Invisible) {
                    onlineCount++;
                }
            });
        } else {
            onlineCount = channel.guild.members.cache.filter(m =>
                m.presence && m.presence.status !== PresenceUpdateStatus.Offline
            ).size;
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
                case ChannelType.GuildText:
                    textChannels++; break;
                case ChannelType.GuildVoice:
                case ChannelType.GuildStageVoice:
                    voiceChannels++; break;
                case ChannelType.GuildCategory:
                    categories++;
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
                    value: `\`👤\` **Łącznie:** ${totalMembers}\n\`🟢\` **Online:** ${onlineCount}`,
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
    }
}

module.exports = embedUpdater;