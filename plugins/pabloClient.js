'use strict';

const { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType, Options } = require('discord.js');
const { clientOptions, botOptions, clientCache, clientSweepers } = require('../config/default.json');

class PabloClient extends Client {
    constructor() {
        super({
            restRequestTimeout: clientOptions.restRequestTimeout,
            messageEditHistoryMaxSize: clientOptions.messageEditHistoryMaxSize,
            messageCacheMaxSize: clientOptions.messageCacheMaxSize,
            messageSweepInterval: clientOptions.messageSweepInterval,
            messageCacheLifetime: clientOptions.messageCacheLifetime,
            intents: clientOptions.intents.map(intent => GatewayIntentBits[intent]),
            presence: {
                status: PresenceUpdateStatus[botOptions.changedActivityPresence || botOptions.defaultActivityPresence],
                activities: [{
                    name: botOptions.changedActivityName || botOptions.defaultActivityName,
                    type: ActivityType[botOptions.changedActivityType || botOptions.defaultActivityType]
                }]
            },
            allowedMentions: {
                repliedUser: clientOptions.repliedUser
            },
            // Cache bota
            makeCache: Options.cacheWithLimits({
                BaseGuildEmojiManager: clientCache.baseGuildEmojiManager,
                GuildBanManager: clientCache.guildBanManager,
                GuildEmojiManager: clientCache.guildEmojiManager,
                GuildInviteManager: clientCache.guildInviteManager,
                ReactionManager: clientCache.reactionManager,
                ReactionUserManager: clientCache.reactionUserManager,
                StageInstanceManager: clientCache.stageInstanceManager,
                ThreadMemberManager: clientCache.threadMemberManager,
                VoiceStateManager: clientCache.voiceStateManager,
                GuildMemberManager: {
                    maxSize: clientCache.guildMemberManager.maxSize,
                    keepOverLimit: member => member.id === member.client.user.id
                }
            }),
            sweepers: {
                // ...Options.DefaultSweeperSettings,
                messages: {
                    interval: clientSweepers.messages.interval,
                    lifetime: clientSweepers.messages.lifetime,
                },
                users: {
                    interval: clientSweepers.users.interval,
                    filter: () => user => user.id !== user.client.user.id
                },
                presences: {
                    interval: clientSweepers.presences.interval,
                    lifetime: clientSweepers.presences.lifetime,
                    filter: () => presence => presence.user?.id !== presence.client.user.id
                }
            }
        });

        // Zaladowanie komend oraz eventow
        this.commands = new Map();

        require('../structures/slash')(this);
        require('../structures/events')(this);
    }
}

module.exports = { PabloClient };