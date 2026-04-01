'use strict';

const { clientOptions, botOptions, clientCache, clientSweepers } = require('../../config/default.json');
const { Client, GatewayIntentBits, ActivityType, Options } = require('discord.js');

class PabloClient extends Client {
    constructor(logger) {
        super({
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
                // ...Options.DefaultMakeCacheSettings,
                MessageManager: clientCache.messageManager,
                ReactionManager: clientCache.reactionManager,
                GuildInviteManager: clientCache.guildInviteManager,
                ReactionUserManager: clientCache.reactionUserManager,
                ThreadMemberManager: clientCache.threadMemberManager,
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
                // ...Options.DefaultSweeperSettings,
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
            get interface() {
                return require('../utils/interface');
            },

            get parser() {
                return require('../utils/parser');
            },

            get error() {
                return require('../utils/error');
            },

            get api() {
                return require('../services/api');
            },

            get db() {
                return require('./database');
            },

            get config() {
                return require('./config');
            }
        };

        // Zaladowanie komend oraz eventow
        this.commands = new Map();
        this.buttons = new Map();
        this.selectMenus = new Map();

        require('../../structures/slash')(this, logger);
        require('../../structures/events')(this, logger);
    }
}

module.exports = PabloClient;