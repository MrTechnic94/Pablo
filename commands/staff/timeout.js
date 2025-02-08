'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { parseTime, formatTime } = require('../../plugins/paseTime');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Nałóż wyciszenie na użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, który zostanie wyciszony.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('czas')
                .setDescription('Czas trwania wyciszenia (np. 1h, 30m, 1d).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód nałożenia wyciszenia.')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do wyciszenia użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do wyciszenia użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getUser('użytkownik');
        const rawTime = interaction.options.getString('czas');
        const reason = interaction.options.getString('powód') || 'Brak.';

        const timeoutDuration = parseTime(rawTime);

        if (!timeoutDuration) {
            return await interaction.reply({ content: '❌ Nieprawidłowy format czasu. Użyj np. 1h, 30m, 1d.', flags: MessageFlags.Ephemeral });
        }

        const formattedTime = formatTime(rawTime);

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Sprawdzenie, czy uzytkownik jest juz wyciszony
            if (member.isCommunicationDisabled()) {
                return await interaction.reply({ content: '❌ Ten użytkownik jest już wyciszony.', flags: MessageFlags.Ephemeral });
            }

            // Wysylanie wiadomosci prywatnej do wyciszonego uzytkownika
            await targetUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Zostałeś wyciszony!')
                        .setDescription(`\`👤\` **Serwer:** ${interaction.guild.name}\n\`🕒\` **Czas wyciszenia:** ${formattedTime}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                        .setColor(embedOptions.defaultColor)
                ]
            }).catch(() => logger.warn(`[Cmd - timeout] Failed to send DM to ${targetUser.user.tag}`));

            // Nalozenie wyciszenia na uzytkownika
            await member.timeout(timeoutDuration * 1000, reason);

            const successEmbed = new EmbedBuilder()
                .setTitle('Użytkownik został wyciszony')
                .setDescription(`\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🕒\` **Czas wyciszenia:** ${formattedTime}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - timeout] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas nakładania wyciszenia na użytkownika.', flags: MessageFlags.Ephemeral });
        }
    }
};