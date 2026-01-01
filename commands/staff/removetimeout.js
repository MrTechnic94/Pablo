'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('removetimeout')
        .setDescription('Odcisz użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do odciszenia.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód odciszenia.')
                .setRequired(false)
                .setMaxLength(450)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await reply.error(interaction, 'MODERATE_MEMBERS_PERMISSION_DENY')
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await reply.error(interaction, 'MODERATE_MEMBERS_PERMISSION_DENY');
        }

        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            if (!member.isCommunicationDisabled()) {
                return await reply.error(interaction, 'USER_IS_NOT_TIMED_OUT');
            }

            const embedDM = createEmbed({
                title: 'Zostałeś odciszony',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Removetimeout] Failed to send DM to '${targetUser.user.tag}'.`));

            await member.timeout(null, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik odciszony',
                description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Removetimeout] ${err}`);
            await reply.error(interaction, 'TIMEOUT_REMOVE_ERROR');
        }
    },
};