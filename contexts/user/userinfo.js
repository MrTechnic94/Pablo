'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Informacje o użytkowniku')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const targetMember = interaction.targetMember;

        if (!targetMember) {
            return await interaction.reply({ content: '❌ Użytkownik nie jest na serwerze.', flags: MessageFlags.Ephemeral });
        }

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

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};