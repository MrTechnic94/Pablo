'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { formatDuration } = require('../../lib/utils/parseTime');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika na serwerze.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do zbanowania.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód zbanowania.')
                .setRequired(false)
                .setMaxLength(450)
        )
        .addIntegerOption(option =>
            option.setName('usuń_wiadomości')
                .setDescription('Wybierz czas, przez jaki wiadomości użytkownika mają zostać usunięte.')
                .setRequired(false)
                .addChoices(
                    { name: 'Nie usuwaj', value: 0 },
                    { name: 'Ostatnia godzina', value: 3600 },
                    { name: '6 godzin', value: 21600 },
                    { name: '12 godzin', value: 43200 },
                    { name: '24 godziny', value: 86400 },
                    { name: '3 dni', value: 259200 },
                    { name: '7 dni', value: 604800 }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await reply.error(interaction, 'MANAGE_MESSAGE_PERMISSION_DENY');
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await reply.error(interaction, 'BOT_BAN_MEMBERS_PERMISSION_DENY');
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';
        const deleteMessageDuration = interaction.options.getInteger('usuń_wiadomości') || 0;

        if (!targetUser) {
            return await reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.member.roles.highest.position <= targetUser.roles.highest.position) {
            return await reply.error(interaction, 'ROLE_TOO_HIGH');
        }

        if (!targetUser.bannable) {
            return await reply.error(interaction, 'BAN_USER_NOT_PUNISHABLE');
        }

        try {
            const embedDM = createEmbed({
                title: 'Zostałeś zbanowany',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Ban] Failed to send DM to '${targetUser.user.tag}'.`));

            await targetUser.ban({ reason, deleteMessageSeconds: deleteMessageDuration });

            const successEmbed = createEmbed({
                title: 'Użytkownik zbanowany',
                description: `\`👤\` **Wyrzucono:** ${targetUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}\n\`🗑️\` **Usunięcie wiadomości:** ${deleteMessageDuration ? formatDuration(deleteMessageDuration * 1000, { fullWords: true }) : 'Nie usuwaj'}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Ban] ${err}`);
            await reply.error(interaction, 'BAN_ERROR');
        }
    },
};