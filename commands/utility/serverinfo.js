'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { formatDuration } = require('../../lib/utils/parseTime');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Wyświetla informacje o serwerze.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const guild = interaction.guild;

        const owner = await guild.fetchOwner();

        const onlineMembers = guild.members.cache.filter(m =>
            ['online', 'idle', 'dnd'].includes(m.presence?.status)
        ).size;

        const verificationLevels = [
            '**• Brak:** Bez ograniczeń.',
            '**• Niski:** Wymaga potwierdzenia adresu e-mail konta Discord.',
            '**• Średni:** Wymaga rejestracji na Discordzie przez co najmniej 5 minut.',
            '**• Wysoki:** Wymaga członkostwa na serwerze przez co najmniej 10 minut.',
            '**• Bardzo wysoki:** Wymaga potwierdzenia numeru telefonu.'
        ];

        const afkChannelName = guild.afkChannel ? `${guild.afkChannel}` : 'Brak.';
        const afkTimeout = guild.afkTimeout ? formatDuration(guild.afkTimeout * 1000, { fullWords: true }) : 'Brak';
        const afkInfo = `**• Kanał:** ${afkChannelName}\n**• Limit czasu:** ${afkTimeout}`;

        const successEmbed = createEmbed({
            title: 'Podgląd serwera',
            thumbnail: guild.iconURL(),
            fields: [
                { name: '`🛡️` Poziom weryfikacji', value: verificationLevels[guild.verificationLevel] },
                { name: '`👥` Użytkownicy', value: `**• Łącznie:** ${guild.memberCount}\n**• Online:** ${onlineMembers}` },
                { name: '`🎭` Role', value: `**• Łącznie:** ${guild.roles.cache.size - 1}` },
                { name: '`👑` Właściciel', value: `<@${owner.id}>` },
                { name: '`🌙` AFK', value: afkInfo },
                { name: '`❓` Inne', value: `**• Nazwa:** ${guild.name}\n**• Widget:** ${guild.widgetEnabled ? 'włączony' : 'wyłączony'}\n**• ID:** ${guild.id}` }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};