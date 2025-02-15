'use strict';

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { clientOptions, botOptions } = require('../config/default');

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
                activities: [{
                    name: botOptions.activityName,
                    type: ActivityType[botOptions.activityType]
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