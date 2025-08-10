/**
 * ✞ Jesus Forever.
 * Stworzony przez MrTechnic.
 * Dla prywatnego serwera.
 *
 * Znajdziesz mnie i moje projekty tutaj: 'https://github.com/MrTechnic94/'.
 * Jezeli potrzebujesz pomocy, znajdziesz mnie tutaj: 'https://t.me/MrTechnic94/'.
 *
 * [!] Aby zaczac uzyj polecenia 'pnpm built'.
 * [!] Edytuj pod swoje potrzeby plik 'default.json'.
 * [!] Reszte konfiguracji znajdziesz w pliku '.env.example'.
 * [!] Niektore pliki (np. embedUpdater, updateAvatar itp.) pobieraja zmienne
 * z configu w czasie rzeczywistym, wiec mozna je zmieniac bez restartu bota.
 */

'use strict';

require('@dotenvx/dotenvx').config({ path: './config/.env' });
require('./plugins/startup').startup();