/**
 * ✞ Jesus Forever
 * Stworzony przez MrTechnic
 * Dla prywatnego serwera
 *
 * Znajdziesz mnie i moje projekty tutaj: https://github.com/MrTechnic94/
 * Jeżeli potrzebujesz pomocy, znajdziesz mnie tutaj: https://t.me/MrTechnic94/
 */

'use strict';

require('@dotenvx/dotenvx').config({ path: './config/.env' });
global.isDev = process.env.DEV_MODE === 'true';

const { startup } = require('./plugins/startup');
startup();