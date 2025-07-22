/**
 * Stworzony przez MrTechnic
 * Dla prywatnego serwera
 * ✞ Jesus Forever
 *
 * Znajdziesz mnie i moje projekty tutaj: https://github.com/MrTechnic94/
 * Korzystaj dowoli - kopiuj, edytuj, używaj gdzie chcesz
 */

'use strict';

require('@dotenvx/dotenvx').config({ path: './config/.env' });
global.isDev = process.env.DEV_MODE === 'true';

const { startup } = require('./plugins/startup');
startup();