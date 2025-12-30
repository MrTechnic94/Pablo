/**
 * ✞ Jesus Forever.
 * Stworzony przez MrTechnic.
 * Dla prywatnego serwera.
 *
 * Znajdziesz mnie i moje projekty tutaj: 'https://github.com/MrTechnic94/'.
 * Jezeli potrzebujesz pomocy, napisz tutaj: 'https://discord.com/users/586543379295240192'.
 *
 * [i] Aby zaczac uzyj polecenia 'pnpm build'.
 * [i] Edytuj nazwe pliku 'default.example.json' -> 'default.json'.
 * [i] Edytuj pod swoje potrzeby plik 'default.json'.
 * [i] Reszte konfiguracji znajdziesz w pliku '.env.example'.
 * [i] Niektore pliki (np. embedUpdater itp.) pobieraja zmienne
 * z configu co 2h jezeli ustawisz je recznie w 'default.json'.
 * Wiec mozna je zmieniac bez koniecznosci restartu bota.
 * [i] Profilowe bota oraz emotki ktore sa wykorzystane do poprawnego
 * dzialania bota sa dostepne w 'assets/profiles' oraz 'assets/emojis'.
 * Zalecane jest dodanie tych emotek dla bota w jego panelu
 * (https://discord.com/developers/applications) oraz zmiane ID
 * w pliku konfiguracyjnym 'default.json' w sekcji 'emojis'.
 * UWAGA: emotki te nie sa moja wlasnoscia, zostaly skopiowane/pobrane
 * z innych serwerow Discorda lub ze strony 'https://emoji.gg'.
 * OPCJONALNIE: przeczytaj plik 'setup-service.sh' jezeli chcesz
 * hostowac swojego bota na vps.
 */

'use strict';

const logger = require('./lib/core/logger');
require('./lib/core/startup').startup(logger);