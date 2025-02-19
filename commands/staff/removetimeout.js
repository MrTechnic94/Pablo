'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetimeout')
        .setDescription('Odcisz użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, z którego chcesz odciszyć.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód odciszenia.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do odciszania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do odciszania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Sprawdzenie, czy uzytkownik jest wyciszony
            if (!member.isCommunicationDisabled()) {
                return await interaction.reply({ content: '❌ Ten użytkownik nie jest wyciszony.', flags: MessageFlags.Ephemeral });
            }

            // Wysylanie wiadomosci prywatnej do odciszonego uzytkownika
            await targetUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Zostałeś odciszony!')
                        .setDescription(`\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                        .setColor(embedOptions.defaultColor)
                ]
            }).catch(() => logger.warn(`[Cmd - removetimeout] Failed to send DM to ${targetUser.user.tag}`));

            // Odciszenie uzytkownika
            await member.timeout(null, reason);

            const successEmbed = new EmbedBuilder()
                .setTitle('Użytkownik został odciszony')
                .setDescription(`\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - removetimeout] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas usuwania wyciszenia użytkownikowi.', flags: MessageFlags.Ephemeral });
        }
    },
};