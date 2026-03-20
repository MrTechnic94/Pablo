'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, MessageFlags, ActionRowBuilder, ButtonStyle, ButtonBuilder, ComponentType } = require('discord.js');
const { embeds } = require('../../config/default.json');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Zarządzanie notatkami o użytkownikach.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('Wyświetla notatkę wybranego użytkownika.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Wybierz użytkownika.')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Dodaje notatkę użytkownikowi.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Wybierz użytkownika.')
                .setRequired(true)
            )
            .addStringOption(o => o
                .setName('treść')
                .setDescription('Treść notatki.')
                .setRequired(true)
                .setMaxLength(200)
            )
        )
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edytuje istniejącą notatkę użytkownika.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Wybierz użytkownika.')
                .setRequired(true)
            )
            .addStringOption(o => o
                .setName('treść')
                .setDescription('Nowa treść notatki.')
                .setRequired(true)
                .setMaxLength(200)
            )
        )
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Usuwa notatkę wybranego użytkownika.')
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Wybierz użytkownika.')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('restart')
            .setDescription('Usuwa wszystkie notatki użytkownika lub całego serwera.')
            .addStringOption(o => o
                .setName('rodzaj')
                .setDescription('Co chcesz wyczyścić?')
                .setRequired(true)
                .addChoices(
                    { name: 'Serwer', value: 'guild' },
                    { name: 'Użytkownik', value: 'user' }
                )
            )
            .addUserOption(o => o
                .setName('użytkownik')
                .setDescription('Wymagane, jeśli wybrałeś restart notatek użytkownika.')
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const dbKey = `guilds:${interaction.guild.id}:notes`;

        try {
            switch (subcommand) {
                case 'view': {
                    const target = interaction.options.getUser('użytkownik');
                    const rawNote = await utils.db.hGet(dbKey, target.id);

                    if (!rawNote) return await utils.reply.error(interaction, 'USER_NOTE_NOT_FOUND');

                    const noteData = JSON.parse(rawNote);
                    const createdAt = Math.floor(noteData.createdAt / 1000);

                    const container = new ContainerBuilder()
                        .setAccentColor(embeds.defaultColor);

                    container.addTextDisplayComponents(new TextDisplayBuilder()
                        .setContent(`## Podgląd notatki\n\`👤\` **Dotyczy:** <@${target.id}>`));

                    container.addSeparatorComponents(new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(1)
                    );

                    container.addTextDisplayComponents(new TextDisplayBuilder()
                        .setContent(`\`📛\` **Autor:** <@${noteData.createdBy}>\n\`📅\` **Data utworzenia:** <t:${createdAt}:f>`));

                    container.addSeparatorComponents(new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(1)
                    );

                    if (noteData.lastEditedBy) {
                        const editedAt = Math.floor(noteData.lastEditedAt / 1000);
                        container.addTextDisplayComponents(new TextDisplayBuilder()
                            .setContent(`\`🔄\` **Ostatnia edycja:** <@${noteData.lastEditedBy}>\n\`🕒\` **Kiedy:** <t:${editedAt}:f>`)
                        );

                        container.addSeparatorComponents(new SeparatorBuilder()
                            .setDivider(true)
                            .setSpacing(1)
                        );
                    }

                    container.addTextDisplayComponents(new TextDisplayBuilder()
                        .setContent(`\`📝\` **Treść notatki:**\n\`\`\`${noteData.content}\`\`\``));

                    await interaction.reply({
                        flags: MessageFlags.IsComponentsV2,
                        components: [container],
                    });
                    break;
                }

                case 'add':
                case 'edit': {
                    const target = interaction.options.getUser('użytkownik');
                    const content = interaction.options.getString('treść');
                    const exists = await utils.db.hExists(dbKey, target.id);
                    const now = Date.now();

                    let noteData;

                    if (subcommand === 'add') {
                        if (exists) {
                            return await utils.reply.error(interaction, 'USER_NOTE_ALREADY_EXISTS');
                        }

                        if (target.bot) {
                            return await utils.reply.error(interaction, 'CANNOT_NOTE_BOT');
                        }

                        if (target.id === interaction.user.id) {
                            return await utils.reply.error(interaction, 'CANNOT_ADD_NOTE_YOURSELF');
                        }

                        noteData = {
                            content,
                            createdAt: now,
                            createdBy: interaction.user.id,
                            lastEditedAt: null,
                            lastEditedBy: null
                        };
                    } else {
                        if (!exists) {
                            return await utils.reply.error(interaction, 'USER_NOTE_NOT_FOUND');
                        }

                        const oldData = JSON.parse(await utils.db.hGet(dbKey, target.id));

                        noteData = {
                            ...oldData,
                            content,
                            lastEditedAt: now,
                            lastEditedBy: interaction.user.id
                        };
                    }

                    await utils.db.hSet(dbKey, target.id, JSON.stringify(noteData));

                    const successEmbed = utils.createEmbed({
                        title: subcommand === 'add' ? 'Dodano notatkę' : 'Zaktualizowano notatkę',
                        description: `\`👤\` **Użytkownik:** <@${target.id}>\n\`📛\` **Moderator:** <@${interaction.user.id}>\n\`📝\` **Treść notatki:** \`\`\`${content}\`\`\``
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove': {
                    const target = interaction.options.getUser('użytkownik');
                    const deleted = await utils.db.hDel(dbKey, target.id);

                    if (!deleted) {
                        return await utils.reply.error(interaction, 'USER_NOTE_NOT_FOUND');
                    }

                    if (target.id === interaction.user.id) {
                        return await utils.reply.error(interaction, 'CANNOT_REMOVE_NOTE_YOURSELF');
                    }

                    await utils.reply.success(interaction, 'NOTE_REMOVED', target.id);
                    break;
                }

                case 'restart': {
                    const scope = interaction.options.getString('rodzaj');

                    if (scope === 'user') {
                        const target = interaction.options.getUser('użytkownik');

                        if (!target) {
                            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
                        }

                        const hasNote = await utils.db.hExists(dbKey, target.id);

                        if (!hasNote) {
                            return await utils.reply.error(interaction, 'USER_NOTE_NOT_FOUND');
                        }

                        await utils.db.hDel(dbKey, target.id);

                        return await utils.reply.success(interaction, 'NOTE_CLEARED', target.id);
                    }
                    const allNotes = await utils.db.hGetAll(dbKey);
                    const notesCount = Object.keys(allNotes).length;

                    if (!notesCount) {
                        return await utils.reply.error(interaction, 'DATABASE_EMPTY');
                    }

                    const confirmButton = new ButtonBuilder()
                        .setCustomId('restart_confirm')
                        .setLabel('Potwierdzam usunięcie')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder().addComponents(confirmButton);

                    const label = utils.getPlural(notesCount, 'notatkę', 'notatki', 'notatek');
                    const countString = `\`${notesCount}\` ${label}`;

                    const queryEmbed = utils.createEmbed({
                        description: `\`❓\` Czy na pewno chcesz usunąć ${countString} z tego serwera?\n\`❗\` Tej operacji nie da się cofnąć!`
                    });

                    await interaction.reply({
                        embeds: [queryEmbed],
                        components: [row]
                    });

                    const msg = await interaction.fetchReply();
                    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

                    collector.on('collect', async i => {
                        if (i.user.id !== interaction.user.id) {
                            return await utils.reply.error(i, 'BUTTON_ERROR');
                        }

                        await utils.db.del(dbKey);

                        const deletedTimestamp = Math.floor(Date.now() / 1000);

                        const successEmbed = utils.createEmbed({
                            title: 'Akcja wykonana',
                            description: `\`💥\` **Info:** Wszystkie notatki serwerowe zostały pomyślnie usunięte.\n\`🗑️\` **Usunięto:** ${notesCount}\n\`📅\` **Data:** <t:${deletedTimestamp}:f>\n\`📛\` **Moderator:** <@${interaction.user.id}>`,
                        });

                        await i.update({
                            embeds: [successEmbed],
                            components: []
                        });
                    });

                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Notes] Error in ${subcommand}: ${err}`);
            await utils.reply.error(interaction, 'SETTINGS_ERROR');
        }
    }
};