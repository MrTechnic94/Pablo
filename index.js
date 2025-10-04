/**
 * ✞ Jesus Forever.
 * Stworzony przez MrTechnic.
 * Dla prywatnego serwera.
 *
 * Znajdziesz mnie i moje projekty tutaj: 'https://github.com/MrTechnic94/'.
 * Jezeli potrzebujesz pomocy, napisz tutaj: 'https://t.me/MrTechnic94/'.
 *
 * [i] Aby zaczac uzyj polecenia 'pnpm build'.
 * [i] Edytuj pod swoje potrzeby plik 'default.json'.
 * [i] Reszte konfiguracji znajdziesz w pliku '.env.example'.
 * [i] Niektore pliki (np. embedUpdater itp.) pobieraja zmienne
 * z configu co 2h jezeli ustawisz je recznie w 'default.json'.
 * Wiec mozna je zmieniac bez koniecznosci restartu bota.
 * [i] Profilowe bota oraz emotki ktore sa wykorzystane do poprawnego
 * dzialania bota sa dostepne w 'assets/profile' oraz 'assets/emoji'.
 * Zalecane jest dodanie tych emotek dla bota w jego panelu
 * (https://discord.com/developers/applications) oraz zmiane ID
 * w pliku konfiguracyjnym 'default.json' w sekcji 'emojis'.
 * UWAGA: emotki te nie sa moja wlasnoscia, zostaly skopiowane/pobrane
 * z innych serwerow Discorda lub ze strony 'https://emoji.gg'.
 */

'use strict';

require('@dotenvx/dotenvx').config({ path: './config/.env' });
require('./plugins/startup').startup();