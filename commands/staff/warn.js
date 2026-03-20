'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const crypto = require('node:crypto');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Zarządzanie ostrzeżeniami użytkowników.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Nadaje ostrzeżenie użytkownikowi.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Użytkownik do ostrzeżenia')
                .setRequired(true)
            )
            .addStringOption(o => o
                .setName('powód')
                .setDescription('Powód ostrzeżenia')
                .setMaxLength(500)
            )
        )
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Usuwa konkretne ostrzeżenie po ID.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz usunąć ostrzeżenie.')
                .setRequired(true)
            )
            .addStringOption(o => o
                .setName('id_ostrzeżenia')
                .setDescription('ID ostrzeżenia.')
                .setRequired(true)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getMember('użytkownik');

        if (!target) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        const dbKey = `guilds:${interaction.guild.id}:warns:${target.id}`;

        try {
            switch (subcommand) {
                case 'add': {
                    if (target.user.bot) {
                        return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
                    }

                    if (target.id === interaction.user.id) {
                        return await utils.reply.error(interaction, 'CANT_REPORT_SELF');
                    }

                    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
                        return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
                    }

                    const warnId = crypto.randomBytes(3).toString('hex').toUpperCase();
                    const reason = interaction.options.getString('powód') || 'Brak.';

                    const warnData = {
                        id: warnId,
                        mod: interaction.user.id,
                        reason,
                        time: Date.now()
                    };

                    await utils.db.lPush(dbKey, JSON.stringify(warnData));

                    const successEmbedDM = utils.createEmbed({
                        title: 'Zostałeś ostrzeżony',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`📛\` **Moderator:** <@${interaction.user.id}>\n\`📝\` **Powód:** ${reason}`
                    });

                    await target.send({ embeds: [successEmbedDM] }).catch(() => logger.warn(`[Slash ▸ Warn] Failed to send DM to '${target.id}'.`));

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik ostrzeżony',
                        description: `\`👤\` **Użytkownik:** <@${target.id}>\n\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🆔\` **ID:** ${warnId}\n\`📝\` **Powód:** \`\`\`${reason}\`\`\``
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove': {
                    const warnId = interaction.options.getString('id_ostrzeżenia').toUpperCase();
                    const allWarns = await utils.db.lRange(dbKey, 0, -1);

                    const foundWarn = allWarns.map(w => JSON.parse(w)).find(w => w.id === warnId);

                    if (!foundWarn) {
                        return await utils.reply.error(interaction, 'WARN_NOT_FOUND');
                    }

                    const warnTimestamp = Math.floor(foundWarn.time / 1000);

                    const successEmbedDM = utils.createEmbed({
                        title: 'Usunięto ostrzeżenie',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`📛\` **Moderator:** <@${interaction.user.id}>\n\`📅\` **Ostrzeżenie z dnia:** <t:${warnTimestamp}>\n\`📝\` **Oryginalny powód:** ${foundWarn.reason}`
                    });

                    await target.send({ embeds: [successEmbedDM] }).catch(() => logger.warn(`[Slash ▸ Warn] Failed to send DM to '${target.id}'.`));

                    await utils.db.lRem(dbKey, 1, JSON.stringify(foundWarn));

                    const successEmbed = utils.createEmbed({
                        title: 'Usunięto ostrzeżenie',
                        description: `\`👤\` **Użytkownik:** <@${target.user.id}>\n\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🆔\` **ID:** ${warnId}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Warn] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'remove' ? 'WARN_REMOVE_ERROR' : 'WARN_ERROR';
            await utils.reply.error(interaction, errorKey);
        }
    }
};