/**
 * ✞ Jesus Forever.
 * Stworzony przez MrTechnic.
 * Dla prywatnego serwera.
 *
 * Znajdziesz mnie i moje projekty tutaj: 'https://github.com/MrTechnic94/'.
 * Jezeli potrzebujesz pomocy, znajdziesz mnie tutaj: 'https://t.me/MrTechnic94/'.
 *
 * [i] Aby zaczac uzyj polecenia 'pnpm build'.
 * [i] Edytuj pod swoje potrzeby plik 'default.json'.
 * [i] Reszte konfiguracji znajdziesz w pliku '.env.example'.
 * [i] Niektore pliki (np. embedUpdater itp.) pobieraja zmienne
 * z configu co 2h jezeli ustawisz je recznie w 'default.json'.
 * Wiec mozna je zmieniac bez koniecznosci restartu bota.
 */

'use strict';

require('@dotenvx/dotenvx').config({ path: './config/.env' });
require('./plugins/startup').startup();