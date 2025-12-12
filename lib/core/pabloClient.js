'use strict';

const { Client, GatewayIntentBits, ActivityType, Options, Collection } = require('discord.js');
const { clientOptions, botOptions, clientCache, clientSweepers } = require('../../config/default.json');

class PabloClient extends Client {
    constructor(logger) {
        super({
            restRequestTimeout: clientOptions.restRequestTimeout,
            messageEditHistoryMaxSize: clientOptions.messageEditHistoryMaxSize,
            messageCacheMaxSize: clientOptions.messageCacheMaxSize,
            messageSweepInterval: clientOptions.messageSweepInterval,
            messageCacheLifetime: clientOptions.messageCacheLifetime,
            intents: clientOptions.intents.map(intent => GatewayIntentBits[intent]),
            presence: {
                status: botOptions.changedActivityPresence || botOptions.defaultActivityPresence,
                activities: [{
                    name: botOptions.changedActivityName || botOptions.defaultActivityName,
                    type: ActivityType.Custom
                }]
            },
            allowedMentions: {
                repliedUser: clientOptions.repliedUser
            },
            // Cache bota
            makeCache: Options.cacheWithLimits({
                GuildInviteManager: clientCache.guildInviteManager,
                ReactionManager: clientCache.reactionManager,
                ReactionUserManager: clientCache.reactionUserManager,
                ThreadMemberManager: clientCache.threadMemberManager
            }),
            sweepers: {
                messages: {
                    interval: clientSweepers.messages.interval,
                    lifetime: clientSweepers.messages.lifetime
                }
            }
        });

        // Zaladowanie komend oraz eventow
        this.commands = new Collection();

        require('../../structures/slash')(this, logger);
        require('../../structures/events')(this, logger);
    }
}

module.exports = PabloClient;