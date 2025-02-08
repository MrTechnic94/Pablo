'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Wyświetla informacje o użytkowniku.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, o którym chcesz zobaczyć informacje.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getMember('użytkownik') || interaction.member;

        // Pobranie roli użytkownika
        const roles = targetUser.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak';

        // Sprawdzenie, czy uzytkownik to bot
        const isBot = targetUser.user.bot ? 'Tak' : 'Nie';

        // Obliczanie daty utworzenia konta z ID
        const createdAt = Math.floor(targetUser.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetUser.joinedTimestamp / 1000);

        // Tworzenie embeda
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${targetUser.user.tag}`, iconURL: targetUser.user.displayAvatarURL() })
            .setThumbnail(targetUser.user.displayAvatarURL())
            .addFields(
                { name: '❯ Pseudonim', value: targetUser.nickname || 'Nie ustawiono', inline: false },
                { name: '❯ Dołączył na serwer', value: `<t:${joinedAt}> (<t:${joinedAt}:R>)`, inline: false },
                { name: '❯ Stworzył konto', value: `<t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: `❯ Role (${targetUser.roles.cache.size - 1})`, value: roles, inline: false },
                { name: '❯ Inne', value: `**• Bot:** ${isBot}\n**• ID:** ${targetUser.user.id}`, inline: false }
            )
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [embed] });
    }
};