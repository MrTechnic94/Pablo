'use strict';

const { Client, GatewayIntentBits, ActivityType, Options, Collection } = require('discord.js');
const { clientOptions, botOptions, clientCache, clientSweepers } = require('../../config/default.json');

class PabloClient extends Client {
    constructor(logger) {
        super({
            restRequestTimeout: clientOptions.restRequestTimeout,
            messageEditHistoryMaxSize: clientOptions.messageEditHistoryMaxSize,
            messageCacheMaxSize: clientOptions.messageCacheMaxSize,
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
                ...Options.DefaultMakeCacheSettings,
                GuildInviteManager: clientCache.guildInviteManager,
                ReactionManager: clientCache.reactionManager,
                ReactionUserManager: clientCache.reactionUserManager,
                ThreadMemberManager: clientCache.threadMemberManager,
                MessageManager: clientCache.messageManager,
                GuildScheduledEventManager: clientCache.guildScheduledEventManager,
                GuildTextThreadManager: clientCache.guildTextThreadManager,
                GuildForumThreadManager: clientCache.guildForumThreadManager,
                GuildMemberManager: {
                    maxSize: clientCache.guildMemberManager.maxSize,
                    keepOverLimit: member => member.id === member.client.user.id
                },
                UserManager: {
                    maxSize: clientCache.userManager.maxSize,
                    keepOverLimit: user => user.id === user.client.user.id
                }
            }),
            sweepers: {
                ...Options.DefaultSweeperSettings,
                messages: {
                    interval: clientSweepers.messages.interval,
                    lifetime: clientSweepers.messages.lifetime
                },
                users: {
                    interval: clientSweepers.user.interval,
                    filter: () => (user) => user.id !== user.client.user.id
                },
                guildMembers: {
                    interval: clientSweepers.guildMembers.interval,
                    filter: () => (member) => member.id !== member.client.user.id
                }
            }
        });

        this.utils = {
            get createEmbed() {
                return require('../utils/createEmbed').createEmbed;
            },

            get getConfig() {
                return require('../core/configManipulator').getConfig;
            },

            get syncConfig() {
                return require('../core/configManipulator').syncConfig;
            },

            get formatDuration() {
                return require('../utils/parseTime').formatDuration;
            },

            get parseTimeString() {
                return require('../utils/parseTime').parseTimeString;
            },

            get sendPaginatedEmbed() {
                return require('../utils/buttonPaginator').sendPaginatedEmbed;
            },

            get db() {
                return require('../core/database');
            },

            get reply() {
                return require('../utils/responder');
            }
        };

        // Zaladowanie komend oraz eventow
        this.commands = new Collection();
        this.buttons = new Collection();
        this.selectMenus = new Collection();

        require('../../structures/slash')(this, logger);
        require('../../structures/events')(this, logger);
    }
}

module.exports = PabloClient;