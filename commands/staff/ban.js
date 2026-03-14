'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.BanMembers],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zarządzanie banami na serwerze.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Zbanuj użytkownika na serwerze.')
            .addUserOption(option => option
                .setName('użytkownik')
                .setDescription('Użytkownik do zbanowania.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('powód')
                .setDescription('Powód zbanowania.')
                .setRequired(false)
                .setMaxLength(500)
            )
            .addIntegerOption(option => option
                .setName('usuń_wiadomości')
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
            )
        )
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Odbanuj użytkownika.')
            .addStringOption(option => option
                .setName('id_użytkownika')
                .setDescription('ID użytkownika do odbanowania.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('powód')
                .setDescription('Powód odbanowania.')
                .setRequired(false)
                .setMaxLength(500)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            switch (subcommand) {
                case 'add': {
                    const targetUser = interaction.options.getUser('użytkownik');
                    const deleteMessageDuration = interaction.options.getInteger('usuń_wiadomości') || 0;

                    if (targetUser.id === interaction.user.id) {
                        return await utils.reply.error(interaction, 'CANT_BAN_SELF');
                    }

                    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

                    if (targetMember) {
                        if (interaction.member.roles.highest.position <= targetMember.roles.highest.position) {
                            return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
                        }

                        if (!targetMember.bannable) {
                            return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
                        }
                    }

                    const successEmbedDM = utils.createEmbed({
                        title: 'Zostałeś zbanowany',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [successEmbedDM] }).catch(() => logger.warn(`[Slash ▸ Ban Add] Failed to send DM to '${targetUser.id}'.`));

                    await interaction.guild.bans.create(targetUser.id, { reason: reason, deleteMessageSeconds: deleteMessageDuration });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik zbanowany',
                        description: `\`👤\` **Zbanowano:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}\n\`🗑️\` **Usunięcie wiadomości:** ${deleteMessageDuration ? utils.formatDuration(deleteMessageDuration * 1000, { fullWords: true }) : 'Nie usuwaj.'}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove': {
                    const userId = interaction.options.getString('id_użytkownika');
                    const userInfo = await interaction.guild.bans.fetch(userId).catch(() => null);

                    if (!userInfo) {
                        return await utils.reply.error(interaction, 'USER_NOT_BANNED');
                    }

                    await interaction.guild.bans.remove(userId, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik odbanowany',
                        description: `\`👤\` **Odbanowano:** <@${userInfo.user.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Ban] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);

            const errorKey = subcommand === 'add' ? 'BAN_ERROR' : 'UNBAN_ERROR';

            await utils.reply.error(interaction, errorKey);
        }
    },
};