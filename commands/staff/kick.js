'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
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
                .setMaxLength(450)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await reply.error(interaction, 'KICK_MEMBERS_PERMISSION_DENY');
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await reply.error(interaction, 'BOT_KICK_MEMBERS_PERMISSION_DENY');
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        if (!targetUser) {
            return await reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.member.roles.highest.position <= targetUser.roles.highest.position) {
            return await reply.error(interaction, 'ROLE_TOO_HIGH');
        }

        if (!targetUser.kickable) {
            return await reply.error(interaction, 'KICK_USER_NOT_PUNISHABLE');
        }

        try {
            const embedDM = createEmbed({
                title: 'Zostałeś wyrzucony',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Kick] Failed to send DM to '${targetUser.user.tag}'.`));

            await targetUser.kick(reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik wyrzucony',
                description: `\`👤\` **Wyrzucono:** ${targetUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Kick] ${err}`);
            await reply.error(interaction, 'KICK_ERROR');
        }
    },
};