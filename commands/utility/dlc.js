'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dlc')
        .setDescription('Poradnik dotyczący instalacji DLC dla ETS2.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('PORADNIK INSTALACJI DLC DO ETS2')
            .setDescription('`🌐` **DLC:** [KLIKNIJ🡭](https://mosbymods.de/)\n`🔑` **HASŁO:** ||mosbymods.de||\n\n`1️⃣` Wejdź w link powyżej.\n`2️⃣` Wybierz najnowszą wersję oznaczoną **latest** klikając w przycisk **Download**.\n`3️⃣` Następnym krokiem jest przejście przez reklamy znajdujące się na stronie.\n`4️⃣` Po zakończeniu reklam pojawi się strona, na której wygenerujesz link do pobrania DLC.\n`5️⃣` Kliknij **GENERATE LINK**, następnie po chwili **DOWNLOAD LINK** oraz **DOWNLOAD**. Za chwilę zacznie się pobieranie najnowszych DLC.\n`6️⃣` Po pobraniu wejdź w pobrany plik oraz wpisz hasło, które znajduje się powyżej.\n`7️⃣` Po wpisaniu hasła kliknij cztery razy w folder znajdujący się w pliku **.zip**, aby ukazał Ci się folder **bin** oraz inne pliki poniżej niego.\n`8️⃣` Następnym krokiem jest wejście w lokalizację foleru gry. Aby to zrobić, wejdź na **Steam**, następnie prawym przyciskiem myszy na **Euro Truck Simulator 2 -> Właściwości -> Zainstalowane pliki -> Przeglądaj**.\n`9️⃣` Teraz, gdy znajdujesz się w folderze gry, otwórz wcześniejszy plik **.zip** i przenieś wszystkie jego pliki do folderu gry, podmieniając istniejące pliki.\n`🔟` Przetestuj DLC wchodząc do gry. Powtarzaj tę czynność za każdym razem, gdy jest to wymagane.')
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [embed] });
    },
};