/**
 * ✞ Jesus Forever.
 * Stworzony przez MrTechnic.
 * Strona bota: 'https://top.gg/bot/1333036494881034311'.
 *
 * Znajdziesz mnie i moje projekty tutaj: 'https://github.com/MrTechnic94/'.
 * Jezeli potrzebujesz pomocy, napisz tutaj: 'https://discord.com/users/586543379295240192'.
 *
 * [i] Aby zaczac uzyj polecenia 'pnpm build'.
 * [i] Edytuj nazwe pliku 'default.example.json' -> 'default.json'.
 * [i] Edytuj pod swoje potrzeby plik 'default.json'.
 * [i] Reszte konfiguracji znajdziesz w pliku '.env.example'.
 * [i] Profilowe, banner oraz emotki ktore sa wykorzystane do poprawnego
 * dzialania bota sa dostepne w './assets'.
 * Zalecane jest dodanie tych emotek dla bota w jego panelu
 * (https://discord.com/developers/applications) oraz dodanie do
 * pliku konfiguracyjnego 'default.json' w sekcji 'emojis'.
 * W pliku default.json, po uzyciu polecen takich jak np. '/bot status' czy '/bot restart',
 * zostanie usuniete formatowanie, a zawartosc zostanie zapisana w jednej linii.
 * Aby przywrocic czytelnosc, uzyj skrotu 'Ctrl + Shift + I'.
 * Skrot ten dziala w vscodium/vsc w innych edytorach moze byc inaczej.
 * UWAGA: emotki te nie sa moja wlasnoscia, zostaly skopiowane/pobrane
 * z innych serwerow Discorda lub ze strony 'https://emoji.gg'.
 * OPCJONALNIE: przeczytaj plik 'setup-service.sh' jezeli chcesz
 * hostowac swojego bota na vps.
 */

'use strict';

const { startup } = require('./lib/core/startup');

async function run() {
    await startup();
}

run();