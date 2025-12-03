'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

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
        const targetMember = interaction.options.getMember('użytkownik') || interaction.member;

        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak';

        const isBot = targetMember.user.bot ? 'Tak' : 'Nie';

        const createdAt = Math.floor(targetMember.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetMember.joinedTimestamp / 1000);

        const successEmbed = createEmbed({
            title: 'Podgląd użytkownika',
            thumbnail: targetMember.user.displayAvatarURL(),
            fields: [
                { name: '`👤` Użytkownik', value: `<@${targetMember.id}>` },
                { name: '`✏️` Pseudonim', value: targetMember.nickname || 'Nie ustawiono' },
                { name: '`🚪` Dołączył na serwer', value: `<t:${joinedAt}> (<t:${joinedAt}:R>)` },
                { name: '`📆` Stworzył konto', value: `<t:${createdAt}> (<t:${createdAt}:R>)` },
                { name: `\`🎭\` Role (${targetMember.roles.cache.size - 1})`, value: roles },
                { name: '`❓` Inne', value: `**• Bot:** ${isBot}\n**• ID:** ${targetMember.user.id}` }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};