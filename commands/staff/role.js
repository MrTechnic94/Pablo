'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Zarządza rolami użytkowników.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Nadaje wybraną rolę użytkownikowi.')
            .addUserOption(option => option
                .setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz nadać rolę.')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('rola')
                .setDescription('Rola, którą chcesz nadać.')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Zabiera wybraną rolę użytkownikowi.')
            .addUserOption(option => option
                .setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz zabrać rolę.')
                .setRequired(true)
            )
            .addRoleOption(option => option
                .setName('rola')
                .setDescription('Rola, którą chcesz zabrać.')
                .setRequired(true)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const targetMember = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!targetMember) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await utils.reply.error(interaction, 'ROLE_HIGHER_THAN_BOT');
        }

        if (interaction.member.roles.highest.position <= role.position && interaction.guild.ownerId !== interaction.user.id) {
            return await utils.reply.error(interaction, 'ROLE_HIGHER_THAN_USER');
        }

        try {
            switch (subcommand) {
                case 'add': {
                    if (targetMember.roles.cache.has(role.id)) {
                        return await utils.reply.error(interaction, 'USER_ALREADY_HAS_ROLE', role.id);
                    }

                    await targetMember.roles.add(role);

                    const addEmbed = utils.createEmbed({
                        title: 'Rola nadana',
                        description: `\`🎭\` **Nadano rolę:** <@&${role.id}>\n\`👤\` **Użytkownikowi:** <@${targetMember.id}>\n\`📛\` **Moderator:** <@${interaction.user.id}>`
                    });

                    await interaction.reply({ embeds: [addEmbed] });
                    break;
                }

                case 'remove': {
                    if (!targetMember.roles.cache.has(role.id)) {
                        return await utils.reply.error(interaction, 'USER_NOT_HAS_ROLE', role.id);
                    }

                    await targetMember.roles.remove(role);

                    const removeEmbed = utils.createEmbed({
                        title: 'Rola zabrana',
                        description: `\`🎭\` **Usunięto rolę:** <@&${role.id}>\n\`👤\` **Użytkownikowi:** <@${targetMember.id}>\n\`📛\` **Moderator:** <@${interaction.user.id}>`
                    });

                    await interaction.reply({ embeds: [removeEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Role] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'add' ? 'ROLE_ADD_ERROR' : 'ROLE_REMOVE_ERROR'
            await utils.reply.error(interaction, errorKey);
        }
    },
};