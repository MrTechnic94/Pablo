'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedOptions, emojisConfig, guildRoles } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Wyślij osadzoną wiadomość.')
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Rodzaj embeda')
                .setRequired(true)
                .addChoices(
                    { name: 'Weryfikacja', value: 'weryfikacja' },
                    { name: 'Auto role dodatkowe', value: 'auto-role-dodatkowe' },
                    { name: 'Auto role kolory', value: 'auto-role-kolory' },
                    { name: 'Pomoc', value: 'pomoc' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const type = interaction.options.getString('rodzaj');

        switch (type) {
            case 'weryfikacja': {
                const verifyEmbed = new EmbedBuilder()
                    .setDescription(
                        '**• Informacje ogólne**\n\n1. Nie pinguj.\n2. Staraj się nie pisać caps lockiem.\n3. Rasizm/homofobia = ban.\n4. Nie wysyłamy treści niezwiązanych z tematem kanału.\n5. Nadmierny spam = mute (20 min).\n\n' +
                        '**• Ważne informacje**\n\n1. Reklamowanie się = ban.\n2. Nieznajomość regulaminu nie zwalnia cię z jego przestrzegania.\n3. Nie spoileruj, jeśli ktoś nie chce.\n4. Administracja ma zawsze rację.'
                    )
                    .setFooter({ text: '❗ Regulamin to jakiś farmazon.' })
                    .setColor(embedOptions.defaultColor);

                const buttonVerify = new ButtonBuilder()
                    .setCustomId('accept_rules')
                    .setLabel('Akceptuję')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(buttonVerify);

                await interaction.channel.send({ embeds: [verifyEmbed], components: [row] });
                break;
            }
            case 'auto-role-dodatkowe': {
                const additionalEmbed = new EmbedBuilder()
                    .setDescription(
                        '```ansi\n[2;34mRangi dodatkowe[0m\n```\n``➖ ➖ ➖ ➖ ➖``\n' +
                        `<@&${guildRoles.gamer}> - 🎮\n` +
                        `<@&${guildRoles.xbox}> - ${emojisConfig.xbox}\n` +
                        `<@&${guildRoles.playstation}> - ${emojisConfig.playstation}\n` +
                        `<@&${guildRoles.pc}> - 💻\n` +
                        `<@&${guildRoles.phone}> - 📱`
                    )
                    .setColor(embedOptions.defaultColor);

                const buttons_additional = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('additional_gamer').setLabel('🎮').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('additional_xbox').setEmoji('1336378596901650483').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('additional_playstation').setEmoji('1336378610680070274').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('additional_pc').setLabel('💻').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('additional_phone').setLabel('📱').setStyle(ButtonStyle.Primary)
                );

                await interaction.channel.send({ embeds: [additionalEmbed], components: [buttons_additional] });
                break;
            }
            case 'auto-role-kolory': {
                const colorsEmbed = new EmbedBuilder()
                    .setDescription(
                        '```ansi\n[2;34mRangi kolorów[0m\n```\n``➖ ➖ ➖ ➖ ➖``\n' +
                        `<@&1060992591627296921> - 🖤\n` +
                        `<@&1060992595746099281> - ❤️\n` +
                        `<@&1060992614033281084> - 💙\n` +
                        `<@&1060992908431474709> - 💜\n` +
                        `<@&1060992608983339138> - 💚`
                    )
                    .setColor(embedOptions.defaultColor);

                const buttons_colors = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('colors_black').setLabel('🖤').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('colors_red').setEmoji('❤️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('colors_blue').setEmoji('💙').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('colors_magenta').setLabel('💜').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('colors_green').setLabel('💚').setStyle(ButtonStyle.Primary)
                );

                await interaction.channel.send({ embeds: [colorsEmbed], components: [buttons_colors] });
                break;
            }
            case 'pomoc': {
                const funEmbed = new EmbedBuilder()
                    .setTitle(`${emojisConfig.ball} 4Fun`)
                    .setDescription('`/solo <użytkownik>`\nStocz bitwę z wybraną osobą.')
                    .setColor(embedOptions.defaultColor);

                const musicEmbed = new EmbedBuilder()
                    .setTitle(`${emojisConfig.galaxyball} Muzyka`)
                    .setDescription('`/stop`\nBot wychodzi z kanału.\n\n`/clear`\nUsuwa aktualną playlistę.\n\n`/play <tytuł lub link>`\nOdtwarza wybraną piosenkę.\n\n`/loop <disable | current | all>`\nWłącza lub wyłącza powtarzanie.\n\n`/skip`\nRozpoczyna głosowanie na pominięcie piosenki.\n\n`/forceskip`\nPomija piosenkę.\n\n`/nowplaying`\nInformacje o obecnej piosence.\n\n`/pause`\nZatrzymuje odtwarzanie piosenki.\n\n`/resume`\nWznawia zatrzymaną piosenkę.\n\n`/shuffle`\nPrzetasowuje bieżącą playlistę.\n\n`/queue`\nWyświetla listę piosenek w playliście.\n\n`/seek <hh:mm:ss>`\nZmienia pozycję odtwarzania.\n\n`/previous`\nOdtwarza poprzednią piosenkę.\n\n`/remove <pozycja>`\nPozwala usunąć z playlisty wybraną piosenkę.\n\n`/jump <pozycja>`\nPozwala przeskoczyć odtwarzanie na wybraną piosenkę.\n\n`/move <z> <do>`\nPrzenosi piosenkę do wybranego miejsca w playliście.\n\n`/replay`\nDodaje na początek playlisty aktualnie odtwarzaną piosenkę.\n\n`/lyrics [tytuł]`\nWyświetla tekst dla wybranej lub aktualnej piosenki.\n\n`/duplicates`\nUsuwa zduplikowane piosenki z playlisty.\n\n`/settings`\nSprawdza ustawienia dla serwera.')
                    .setColor(embedOptions.defaultColor);

                const levelsEmbed = new EmbedBuilder()
                    .setTitle(`${emojisConfig.first} Poziomy`)
                    .setDescription('`=rank [użytkownik]`\nSprawdź swoją kartę rangi lub innej osoby.\n\n`=leaderboard` **/** `=lb`\nSprawdź topkę serwera.')
                    .setColor(embedOptions.defaultColor);

                const infoEmbed = new EmbedBuilder()
                    .setTitle(`${emojisConfig.information} Informacje`)
                    .setDescription('`/userinfo [użytkownik]`\nSprawdź informacje o użytkowniku lub o sobie.\n\n`/serverinfo`\nSprawdź informacje o serwerze.\n\n`/avatar [użytkownik]`\nWyświetl avatar swój lub innego użytkownika.\n\n`/channelinfo [kanał]`\nSprawdź informacje o wybranym lub aktualnym kanale.\n\n`/randomcolor`\nGeneruje losowy kolor.\n\n`/dlc`\nPoradnik dotyczący instalacji DLC do ETS2.')
                    .setColor(embedOptions.defaultColor);

                const vipEmbed = new EmbedBuilder()
                    .setTitle(`${emojisConfig.diamond} V.I.P`)
                    .setDescription('`/nick [pseudonim]`\nPozwala edytować pseudonim lub go usunąć.')
                    .setColor(embedOptions.defaultColor);

                const embedsToSend = [funEmbed, musicEmbed, levelsEmbed, infoEmbed, vipEmbed];
                const messages = await Promise.all(embedsToSend.map(embed => interaction.channel.send({ embeds: [embed] })));

                const helpEmbed = new EmbedBuilder()
                    .setTitle('Spis treści')
                    .setDescription(
                        `\`▶️\` [**4Fun**](${messages[0].url})\n\n` +
                        `\`▶️\` [**Muzyka**](${messages[1].url})\n\n` +
                        `\`▶️\` [**Poziomy**](${messages[2].url})\n\n` +
                        `\`▶️\` [**Informacje**](${messages[3].url})\n\n` +
                        `\`▶️\` [**V.I.P**](${messages[4].url})`
                    )
                    .setColor(embedOptions.defaultColor);

                await interaction.channel.send({ embeds: [helpEmbed] });
                break;
            }
            default:
                await interaction.reply({ content: '❌ Nieznany parametr.', flags: MessageFlags.Ephemeral });
        }
    },
};