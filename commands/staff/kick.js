'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do wyrzucenia.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód wyrzucenia.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do wyrzucania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do wyrzucania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        if (!targetUser) {
            return await interaction.reply({ content: '❌ Nie znaleziono użytkownika.', flags: MessageFlags.Ephemeral });
        }

        if (interaction.member.roles.highest.position <= targetUser.roles.highest.position) {
            return await interaction.reply({ content: '❌ Nie możesz wyrzucić tego użytkownika, ponieważ jego ranga jest równa lub wyższa od Twojej.', flags: MessageFlags.Ephemeral });
        }

        if (!targetUser.kickable) {
            return await interaction.reply({ content: '❌ Nie mogę wyrzucić tego użytkownika.', flags: MessageFlags.Ephemeral });
        }

        try {
            // Wysylanie wiadomosci prywatnej do wyrzuconego uzytkownika
            await targetUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Zostałeś wyrzucony!')
                        .setDescription(`\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                        .setColor(embedOptions.defaultColor)
                ]
            }).catch(() => logger.warn(`[Cmd - kick] Failed to send DM to ${targetUser.user.tag}`));

            await targetUser.kick(reason);

            // Tworzenie embed dla kanalu, w ktorym komenda zostala uzyta
            const successEmbed = new EmbedBuilder()
                .setTitle('Użytkownik wyrzucony')
                .setDescription(`\`👤\` **Wyrzucono:** ${targetUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - kick] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas wyrzucania użytkownika.', flags: MessageFlags.Ephemeral });
        }
    },
};