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
            return await interaction.reply({ content: '`❌` Użytkownik nie jest na serwerze.', flags: MessageFlags.Ephemeral });
        }

        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak';

        const isBot = targetMember.user.bot ? 'Tak' : 'Nie';

        const createdAt = Math.floor(targetMember.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetMember.joinedTimestamp / 1000);

        // Zaproszenia
        let inviteCount = 0;

        const invites = await interaction.guild.invites.fetch();
        inviteCount = invites
            .filter(i => i.inviter && i.inviter.id === targetMember.id)
            .reduce((acc, invite) => acc + invite.uses, 0);

        // Urzadzenie
        const fullDeviceMap = {
            desktop: { text: 'Komputer', emoji: '🖥️' },
            mobile: { text: 'Telefon', emoji: '📱' },
            web: { text: 'Przeglądarka', emoji: '🌐' },
        };

        const clientStatus = targetMember.presence?.clientStatus;

        const devices = clientStatus
            ? Object.keys(clientStatus).map(key => fullDeviceMap[key]?.text)
            : [];

        const deviceString = devices.join(', ') || 'Użytkownik jest offline.';

        const deviceEmoji =
            clientStatus?.desktop ? '🖥️' :
                clientStatus?.mobile ? '📱' :
                    clientStatus?.web ? '🌐' :
                        '❓';

        // Status
        const fullStatusMap = {
            online: { text: 'Dostępny', emoji: '🟢' },
            idle: { text: 'Zaraz wracam', emoji: '🌙' },
            dnd: { text: 'Nie przeszkadzać', emoji: '⛔' },
            invisible: { text: 'Niedostępny', emoji: '🎱' },
            offline: { text: 'Offline', emoji: '🎱' },
        };

        const statusKey = targetMember.presence?.status || 'Niedostępny';

        const userStatus = fullStatusMap[statusKey]?.text || 'Niedostępny';
        const statusEmoji = fullStatusMap[statusKey]?.emoji || '🎱';

        const successEmbed = createEmbed({
            title: 'Podgląd użytkownika',
            thumbnail: targetMember.user.displayAvatarURL(),
            fields: [
                { name: '`👤` Użytkownik', value: `<@${targetMember.id}>` },
                { name: '`✏️` Pseudonim', value: targetMember.nickname || 'Nie ustawiono' },
                { name: `\`${deviceEmoji}\` Urządzenie`, value: deviceString },
                { name: `\`${statusEmoji}\` Status`, value: userStatus },
                { name: '`🚪` Dołączył na serwer', value: `<t:${joinedAt}> (<t:${joinedAt}:R>)` },
                { name: '`📆` Stworzył konto', value: `<t:${createdAt}> (<t:${createdAt}:R>)` },
                { name: `\`🎭\` Role (${targetMember.roles.cache.size - 1})`, value: roles },
                { name: '`❓` Inne', value: `**• Bot:** ${isBot}\n**• Zaproszeń:** ${inviteCount}\n**• ID:** ${targetMember.user.id}` }
            ]
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};