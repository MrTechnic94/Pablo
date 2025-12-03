'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
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
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
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

            if (!member.isCommunicationDisabled()) {
                return await interaction.reply({ content: '❌ Ten użytkownik nie jest wyciszony.', flags: MessageFlags.Ephemeral });
            }

            const embedDM = createEmbed({
                title: 'Zostałeś odciszony',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Removetimeout] Failed to send DM to '${targetUser.user.tag}'.`));

            await member.timeout(null, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik odciszony',
                description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Removetimeout] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas usuwania wyciszenia użytkownikowi.', flags: MessageFlags.Ephemeral });
        }
    },
};