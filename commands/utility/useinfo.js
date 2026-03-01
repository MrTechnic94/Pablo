'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { presence, device } = require('../../locales/pl_PL');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Wyświetla informacje o użytkowniku.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, o którym chcesz zobaczyć informacje.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const targetMember = interaction.options.getMember('użytkownik') ?? interaction.member;

        if (interaction.options.getUser('użytkownik') && !interaction.options.getMember('użytkownik')) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        // Role
        const roles = targetMember.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.toString())
            .join(', ') || 'Brak.';

        // Sprawdza czy bot
        const isBot = targetMember.user.bot ? 'Tak.' : 'Nie.';

        // Kiedy utworzono konto i kiedy dolaczyl na serwer
        const createdAt = Math.floor(targetMember.user.createdTimestamp / 1000);
        const joinedAt = Math.floor(targetMember.joinedTimestamp / 1000);

        // Urzadzenie
        const clientStatus = targetMember.presence?.clientStatus;

        const deviceNames = clientStatus ? Object.keys(clientStatus).map(key => device[key]?.name) : [];

        const deviceString = deviceNames.join(', ') || 'Użytkownik jest offline.';

        const deviceEmoji = Object.keys(clientStatus || {}).map(key => device[key]?.emoji).join(' ') || '❓';

        // Status
        const rawStatus = targetMember.presence?.status || 'Niedostępny.';
        const userStatus = presence[rawStatus]?.name || 'Niedostępny.';
        const statusEmoji = presence[rawStatus]?.emoji || '🎱';

        const successEmbed = utils.createEmbed({
            title: 'Podgląd użytkownika',
            thumbnail: targetMember.user.displayAvatarURL(),
            fields: [
                { name: '`👤` Użytkownik', value: `**•** <@${targetMember.id}>`, inline: false },
                { name: '`🔑` ID', value: `**•** ${targetMember.user.id}`, inline: false },
                { name: '`✏️` Pseudonim', value: `**•** ${targetMember.nickname || 'Nie ustawiono.'}`, inline: false },
                { name: `\`${deviceEmoji}\` Urządzenie`, value: `**•** ${deviceString}`, inline: false },
                { name: `\`${statusEmoji}\` Status`, value: `**•** ${userStatus}`, inline: false },
                { name: '`🚪` Dołączył na serwer', value: `**•** <t:${joinedAt}> (<t:${joinedAt}:R>)`, inline: false },
                { name: '`📆` Stworzył konto', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: `\`🎭\` Role (${targetMember.roles.cache.size - 1})`, value: roles, inline: false },
                { name: '`🤖` Bot', value: `**•** ${isBot}`, inline: false }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};