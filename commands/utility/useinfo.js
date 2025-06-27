'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Wyświetla informacje o użytkowniku.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, o którym chcesz zobaczyć informacje.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const targetUser = interaction.options.getMember('użytkownik') || interaction.member;

        const roles = targetUser.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak';

        const isBot = targetUser.user.bot ? 'Tak' : 'Nie';

        const createdAt = Math.floor(targetUser.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetUser.joinedTimestamp / 1000);

        const successEmbed = createEmbed({
            title: 'Podgląd użytkownika',
            thumbnail: targetUser.user.displayAvatarURL(),
            fields: [
                { name: '`👤` Użytkownik', value: `<@${targetUser.id}>` },
                { name: '`✏️` Pseudonim', value: targetUser.nickname || 'Nie ustawiono' },
                { name: '`🚪` Dołączył na serwer', value: `<t:${joinedAt}> (<t:${joinedAt}:R>)` },
                { name: '`📆` Stworzył konto', value: `<t:${createdAt}> (<t:${createdAt}:R>)` },
                { name: `\`🎭\` Role (${targetUser.roles.cache.size - 1})`, value: roles },
                { name: '`❓` Inne', value: `**• Bot:** ${isBot}\n**• ID:** ${targetUser.user.id}` }
            ]
        });

        return await interaction.reply({ embeds: [successEmbed] });
    },
};