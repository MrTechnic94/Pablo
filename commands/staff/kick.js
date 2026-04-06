'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.KickMembers],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Użytkownik do wyrzucenia.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Powód wyrzucenia.')
            .setRequired(false)
            .setMaxLength(500)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        if (targetUser.id === interaction.user.id) {
            return await utils.interface.sendError(interaction, 'CANT_KICK_SELF');
        }

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!targetMember) {
                return await utils.interface.sendError(interaction, 'USER_NOT_FOUND');
            }

            if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
                return await utils.interface.sendError(interaction, 'ROLE_TOO_HIGH');
            }

            if (!targetMember.kickable) {
                return await utils.interface.sendError(interaction, 'USER_NOT_PUNISHABLE');
            }

            const successEmbedDM = utils.interface.createEmbed({
                title: 'Zostałeś wyrzucony',
                description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
            });

            await targetMember.send({ embeds: [successEmbedDM] }).catch(() => logger.warn(`[Slash ▸ Kick] Failed to send DM to '${targetMember.id}'.`));

            await targetMember.kick({ reason: reason });

            const successEmbed = utils.interface.createEmbed({
                title: 'Użytkownik wyrzucony',
                description: `\`👤\` **Wyrzucono:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Kick] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.interface.sendError(interaction, 'KICK_ERROR');
        }
    },
};