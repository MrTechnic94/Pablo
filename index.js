/**
 * Stworzon przez MrTechnic
 * Dla serwera Milf Zone
 * ✞ Jesus Forever
 *
 * Wszelkie prawa zastrzeżone
 * Znajdziesz mnie i moje projekty tutaj: https://github.com/MrTechnic94/
 */

'use strict';

require('dotenv').config({ path: './config/.env' });
const { startup } = require('./plugins/startup');
startup();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { clientOptions, botOptions } = require('./config/default');

const client = new Client({
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

// Ustawienie trybu developera
global.isDev = process.env.DEV_MODE === 'true';

// Zaladowanie komend oraz eventow
client.commands = new Map();
client.aliases = new Map();

require('./structures/slash')(client);
require('./structures/events')(client);

// Token bota
const token = global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

client.login(token);