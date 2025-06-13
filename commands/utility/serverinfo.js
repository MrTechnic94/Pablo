'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Wyświetla informacje o serwerze.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const guild = interaction.guild;

        // Pobieranie wlasciciela serwera
        const owner = await guild.fetchOwner();

        // Pobieranie liczby użytkownikow online
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status && ['online', 'idle', 'dnd'].includes(member.presence.status)).size;

        // Mapowanie poziomow weryfikacji na opisy
        const verificationLevels = [
            '**• Brak:** Bez ograniczeń.',
            '**• Niski:** Wymaga potwierdzenia adresu e-mail konta Discord.',
            '**• Średni:** Wymaga rejestracji na Discordzie przez co najmniej 5 minut.',
            '**• Wysoki:** Wymaga członkostwa na serwerze przez co najmniej 10 minut.',
            '**• Bardzo wysoki:** Wymaga potwierdzenia numeru telefonu.'
        ];

        // Pobieranie informacji o kanale AFK
        let afkInfo = 'Brak';
        if (guild.afkChannel) {
            const afkMinutes = guild.afkTimeout / 60;
            afkInfo = `**• Kanał:** ${guild.afkChannel}\n**• Limit czasu:** ${afkMinutes} minut`;
        }

        const serverEmbed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '❯ Poziom weryfikacji', value: verificationLevels[guild.verificationLevel], inline: false },
                { name: '❯ Użytkownicy', value: `**• Łącznie:** ${guild.memberCount}\n**• Online:** ${onlineMembers}`, inline: false },
                { name: '❯ Role', value: `**• Łącznie:** ${guild.roles.cache.size - 1}`, inline: false },
                { name: '❯ Właściciel', value: `<@${owner.id}>`, inline: false },
                { name: '❯ AFK', value: afkInfo, inline: false },
                { name: '❯ Inne', value: `**• Widget:** ${guild.widgetEnabled ? 'włączony' : 'wyłączony'}\n**• ID:** ${guild.id}`, inline: false }
            )
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [serverEmbed] });
    },
};