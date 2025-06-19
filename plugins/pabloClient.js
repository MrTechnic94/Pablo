'use strict';

const { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType } = require('discord.js');
const { clientOptions, botOptions } = require('../config/default.json');

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
        });

        // Zaladowanie komend oraz eventow
        this.commands = new Map();

        require('../structures/slash')(this);
        require('../structures/events')(this);
    }
}

module.exports = { PabloClient };