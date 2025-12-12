'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const { presence, device } = require('../../config/lang/messages.json');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Informacje o użytkowniku')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const targetMember = interaction.targetMember;

        if (!targetMember) {
            return await interaction.reply({ content: '`❌` Użytkownik nie jest na serwerze.', flags: MessageFlags.Ephemeral });
        }

        // Role
        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak.';

        // Sprawdza czy bot
        const isBot = targetMember.user.bot ? 'Tak' : 'Nie';

        // Kiedy utworzono konto i kiedy dolaczyl na serwer
        const createdAt = Math.floor(targetMember.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetMember.joinedTimestamp / 1000);

        // Zaproszenia
        let inviteCount = 0;

        const invites = await interaction.guild.invites.fetch();
        inviteCount = invites
            .filter(i => i.inviter && i.inviter.id === targetMember.id)
            .reduce((acc, invite) => acc + invite.uses, 0);

        // Urzadzenie
        const clientStatus = targetMember.presence?.clientStatus;

        const deviceNames = clientStatus
            ? Object.keys(clientStatus).map(key => device[key]?.name)
            : [];

        const deviceString = deviceNames.join(', ') || 'Użytkownik jest offline.';

        const deviceEmoji = clientStatus ? Object.keys(clientStatus).map(key => device[key]?.emoji).join(' ') : '❓';

        // Status
        const rawStatus = targetMember.presence?.status || 'Niedostępny.';
        const userStatus = presence[rawStatus]?.name || 'Niedostępny';
        const statusEmoji = presence[rawStatus]?.emoji || '🎱';

        const successEmbed = createEmbed({
            title: 'Podgląd użytkownika',
            thumbnail: targetMember.user.displayAvatarURL(),
            fields: [
                { name: '`👤` Użytkownik', value: `**•** <@${targetMember.id}>`, inline: false },
                { name: '`🔑` ID', value: `**•** ${targetMember.user.id}`, inline: false },
                { name: '`✏️` Pseudonim', value: `**•** ${targetMember.nickname || 'Nie ustawiono'}`, inline: false },
                { name: `\`${deviceEmoji}\` Urządzenie`, value: `**•** ${deviceString}`, inline: false },
                { name: `\`${statusEmoji}\` Status`, value: `**•** ${userStatus}`, inline: false },
                { name: '`🚪` Dołączył na serwer', value: `**•** <t:${joinedAt}> (<t:${joinedAt}:R>)`, inline: false },
                { name: '`📆` Stworzył konto', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: `\`🎭\` Role (${targetMember.roles.cache.size - 1})`, value: roles, inline: false },
                { name: '`❓` Inne', value: `**• Bot:** ${isBot}\n**• Zaproszonych:** ${inviteCount}`, inline: false }
            ]
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};