'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.BanMembers],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika na serwerze.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do zbanowania.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód zbanowania.')
                .setRequired(false)
                .setMaxLength(500)
        )
        .addIntegerOption(option =>
            option.setName('usuń_wiadomości')
                .setDescription('Wybierz czas, przez jaki wiadomości użytkownika mają zostać usunięte.')
                .setRequired(false)
                .addChoices(
                    { name: 'Nie usuwaj', value: 0 },
                    { name: 'Ostatnia godzina', value: 3600 },
                    { name: 'Ostatnie 6 godzin', value: 21600 },
                    { name: 'Ostatnie 12 godzin', value: 43200 },
                    { name: 'Ostatnie 24 godziny', value: 86400 },
                    { name: 'Ostatnie 3 dni', value: 259200 },
                    { name: 'Ostatnie 7 dni', value: 604800 }
                )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';
        const deleteMessageDuration = interaction.options.getInteger('usuń_wiadomości') || 0;

        if (targetUser.id === interaction.user.id) {
            return await utils.reply.error(interaction, 'CANT_BAN_SELF');
        }

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (targetMember) {
                if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
                    return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
                }

                if (!targetMember.bannable) {
                    return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
                }
            }

            const embedDM = utils.createEmbed({
                title: 'Zostałeś zbanowany',
                description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Ban] Failed to send DM to '${targetUser.id}'.`));

            await interaction.guild.bans.create(targetUser.id, { reason: reason, deleteMessageSeconds: deleteMessageDuration });

            const successEmbed = utils.createEmbed({
                title: 'Użytkownik zbanowany',
                description: `\`👤\` **Wyrzucono:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}\n\`🗑️\` **Usunięcie wiadomości:** ${deleteMessageDuration ? utils.formatDuration(deleteMessageDuration * 1000, { fullWords: true }) : 'Nie usuwaj'}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Ban] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'BAN_ERROR');
        }
    },
};