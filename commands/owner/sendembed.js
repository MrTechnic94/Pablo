'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { roles } = require('../../config/default.json');

module.exports = {
    index: false,
    data: new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Wyślij osadzoną wiadomość.')
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Rodzaj embedu.')
                .setRequired(true)
                .addChoices(
                    { name: 'Weryfikacja', value: 'weryfikacja' },
                    { name: 'Menu - Kolory', value: 'menu-kolory' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '`❌` Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const type = interaction.options.getString('rodzaj');

        switch (type) {
            case 'weryfikacja': {
                const verifyEmbed = createEmbed({
                    description: (
                        '> `ℹ️` **OGÓLNE INFORMACJE.**\n\n' +
                        '`🔹` Nie pinguj.\n' +
                        '`🔹` Staraj się nie pisać caps lockiem.\n' +
                        '`🔹` Rasizm/homofobia = ban.\n' +
                        '`🔹` Nie wysyłamy treści niezwiązanych z tematem kanału.\n' +
                        '`🔹` Nadmierny spam = mute (20 min).\n\n' +
                        '> `❗` **WAŻNE INFORMACJE.**\n\n' +
                        '`🔹` Reklamowanie się = ban.\n' +
                        '`🔹` Nieznajomość regulaminu nie zwalnia cię z jego przestrzegania.\n' +
                        '`🔹` Nie spoileruj, jeśli ktoś nie chce.\n' +
                        '`🔹` Administracja ma zawsze rację.'
                    )
                });

                const buttonVerify = new ButtonBuilder()
                    .setCustomId('accept_rules')
                    .setLabel('Akceptuję')
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(buttonVerify);

                await interaction.channel.send({ embeds: [verifyEmbed], components: [row] });
                break;
            }

            case 'menu-kolory': {
                const colorsEmbed = createEmbed({
                    description: (
                        '```ansi\n[2;34m🔹Menu kolorów🔹[0m\n```\n``➖ ➖ ➖ ➖ ➖ ``\n' +
                        `\`🖤\` • <@&${roles.black}>\n` +
                        `\`❤️\` • <@&${roles.red}>\n` +
                        `\`💙\` • <@&${roles.blue}>\n` +
                        `\`💜\` • <@&${roles.magenta}>\n` +
                        `\`💚\` • <@&${roles.green}>`
                    )
                });

                const menuColors = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('colors_menu')
                        .setPlaceholder('Wybierz swój kolor...')
                        .addOptions([
                            {
                                label: 'Czarny',
                                emoji: '🖤',
                                value: 'colors_black',
                            },
                            {
                                label: 'Czerwony',
                                emoji: '❤️',
                                value: 'colors_red',
                            },
                            {
                                label: 'Niebieski',
                                emoji: '💙',
                                value: 'colors_blue',
                            },
                            {
                                label: 'Fioletowy',
                                emoji: '💜',
                                value: 'colors_magenta',
                            },
                            {
                                label: 'Zielony',
                                emoji: '💚',
                                value: 'colors_green',
                            },
                        ])
                );

                await interaction.channel.send({ embeds: [colorsEmbed], components: [menuColors] });
                break;
            }

            default:
                await interaction.reply({ content: '`❌` Nieznany parametr.', flags: MessageFlags.Ephemeral });
        }
    },
};