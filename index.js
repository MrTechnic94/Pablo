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

global.isDev = process.env.DEV_MODE === 'true';

const { startup } = require('./plugins/startup');
startup();

const { PabloClient } = require('./plugins/pabloClient');
const client = new PabloClient();

client.login(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);