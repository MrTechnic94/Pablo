'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.KickMembers],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        if (targetUser.id === interaction.user.id) {
            return await utils.reply.error(interaction, 'CANT_KICK_SELF');
        }

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!targetMember) {
                return await utils.reply.error(interaction, 'USER_NOT_FOUND');
            }

            if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
                return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
            }

            if (!targetMember.kickable) {
                return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
            }

            const embedDM = utils.createEmbed({
                title: 'Zostałeś wyrzucony',
                description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await targetMember.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Kick] Failed to send DM to '${targetMember.user.tag}'.`));

            await targetMember.kick({ reason: reason });

            const successEmbed = utils.createEmbed({
                title: 'Użytkownik wyrzucony',
                description: `\`👤\` **Wyrzucono:** ${targetMember.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Kick] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'KICK_ERROR');
        }
    },
};