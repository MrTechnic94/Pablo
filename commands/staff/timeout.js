'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { parseTimeString } = require('../../plugins/parseTime');
const { createEmbed } = require('../../plugins/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Nałóż wyciszenie na użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do wyciszenia.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('czas')
                .setDescription('Czas trwania wyciszenia (np. 1d, 1h, 30m).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód wyciszenia.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do wyciszenia użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do wyciszenia użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getUser('użytkownik');
        const rawTime = interaction.options.getString('czas');
        const reason = interaction.options.getString('powód') || 'Brak.';

        const timeInfo = parseTimeString(rawTime);

        if (!timeInfo) {
            return await interaction.reply({ content: '❌ Nieprawidłowy format czasu. Użyj np. 1h, 30m, 1d.', flags: MessageFlags.Ephemeral });
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            if (member.isCommunicationDisabled()) {
                return await interaction.reply({ content: '❌ Ten użytkownik jest już wyciszony.', flags: MessageFlags.Ephemeral });
            }

            const embedDM = createEmbed({
                title: 'Zostałeś wyciszony',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🕒\` **Czas wyciszenia:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Cmd - timeout] Failed to send DM to ${targetUser.tag}.`));

            await member.timeout(timeInfo.seconds * 1000, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik wyciszony',
                description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🕒\` **Czas wyciszenia:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - timeout] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas nakładania wyciszenia na użytkownika.', flags: MessageFlags.Ephemeral });
        }
    },
};