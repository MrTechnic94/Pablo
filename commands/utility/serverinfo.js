'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { formatDuration } = require('../../plugins/parseTime');
const { embedOptions } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Wyświetla informacje o serwerze.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const guild = interaction.guild;

        const owner = await guild.fetchOwner();

        const onlineMembers = guild.members.cache.filter(member => member.presence?.status && ['online', 'idle', 'dnd'].includes(member.presence.status)).size;

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

        const successEmbed = new EmbedBuilder()
            // .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setTitle('Podgląd serwera')
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '\`🛡️\` Poziom weryfikacji', value: verificationLevels[guild.verificationLevel], inline: false },
                { name: '\`👥\` Użytkownicy', value: `**• Łącznie:** ${guild.memberCount}\n**• Online:** ${onlineMembers}`, inline: false },
                { name: '\`🎭\` Role', value: `**• Łącznie:** ${guild.roles.cache.size - 1}`, inline: false },
                { name: '\`👑\` Właściciel', value: `<@${owner.id}>`, inline: false },
                { name: '\`🌙\` AFK', value: afkInfo, inline: false },
                { name: '\`❓\` Inne', value: `**• Nazwa:** ${guild.name}\n**• Widget:** ${guild.widgetEnabled ? 'włączony' : 'wyłączony'}\n**• ID:** ${guild.id}`, inline: false }
            )
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [successEmbed] });
    },
};