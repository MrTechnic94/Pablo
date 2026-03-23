'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Zarządzanie wiadomościami osadzonymi.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub
            .setName('create')
            .setDescription('Tworzy nową wiadomość osadzoną z wybranymi opcjami.')
            .addStringOption(option => option
                .setName('opis')
                .setDescription('Główna treść.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('tytuł')
                .setDescription('Tytuł.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('kolor')
                .setDescription('Kolor HEX.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_nazwa')
                .setDescription('Nazwa autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_ikona')
                .setDescription('Link do ikony autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_url')
                .setDescription('Link dla autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('tytuł_url')
                .setDescription('Link dla tytułu.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('miniatura')
                .setDescription('Link do miniatury.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('obraz')
                .setDescription('Link do dużego obrazu.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('stopka_tekst')
                .setDescription('Tekst stopki.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('stopka_ikona')
                .setDescription('Link do ikony stopki.')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('znacznik_czasu')
                .setDescription('Czy dodać czas wysłania?')
                .setRequired(false)
            )
            .addChannelOption(option => option
                .setName('kanał')
                .setDescription('Kanał, na który wysłać.')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Edytuje istniejącą wiadomość osadzoną bota.')
            .addStringOption(option => option
                .setName('id_wiadomości')
                .setDescription('ID wiadomości do edycji.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('opis')
                .setDescription('Nowa treść.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('tytuł')
                .setDescription('Nowy tytuł.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('kolor')
                .setDescription('Nowy kolor HEX.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_nazwa')
                .setDescription('Nowa nazwa autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_ikona')
                .setDescription('Nowy link do ikony autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('autor_url')
                .setDescription('Nowy link dla autora.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('tytuł_url')
                .setDescription('Nowy link dla tytułu.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('miniatura')
                .setDescription('Nowy link do miniatury.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('obraz')
                .setDescription('Nowy link do dużego obrazu.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('stopka_tekst')
                .setDescription('Nowy tekst stopki.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('stopka_ikona')
                .setDescription('Nowy link do ikony stopki.')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('znacznik_czasu')
                .setDescription('Czy zmienić znacznik czasu?')
                .setRequired(false)
            )
            .addChannelOption(option => option
                .setName('kanał')
                .setDescription('Kanał, na którym jest wiadomość.')
                .setRequired(false)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();

        try {
            const targetChannel = interaction.options.getChannel('kanał') || interaction.channel;
            const messageId = interaction.options.getString('id_wiadomości');

            const description = interaction.options.getString('opis');
            const title = interaction.options.getString('tytuł');
            const color = interaction.options.getString('kolor');
            const url = interaction.options.getString('tytuł_url');
            const thumbnail = interaction.options.getString('miniatura');
            const image = interaction.options.getString('obraz');
            const timestampOption = interaction.options.getBoolean('znacznik_czasu');

            const authorName = interaction.options.getString('autor_nazwa');
            const authorIcon = interaction.options.getString('autor_ikona');
            const authorUrl = interaction.options.getString('autor_url');

            const footerText = interaction.options.getString('stopka_tekst');
            const footerIcon = interaction.options.getString('stopka_ikona');

            const finalColor = color && /^#([A-Fa-f0-9]{6})$/.test(color) ? color : null;

            switch (subcommand) {
                case 'create': {
                    const successEmbed = utils.createEmbed({
                        title,
                        url,
                        description,
                        thumbnail,
                        image,
                        color: finalColor,
                        timestamp: timestampOption ? Date.now() : null,
                        author: authorName ? { name: authorName, iconURL: authorIcon, url: authorUrl } : null,
                        footer: footerText ? { text: footerText, iconURL: footerIcon } : null
                    });

                    await targetChannel.send({ embeds: [successEmbed] });
                    await utils.reply.success(interaction, 'EMBED_CREATED', targetChannel.id);
                    break;
                }

                case 'edit': {
                    const message = await targetChannel.messages.fetch(messageId).catch(() => null);
                    const oldEmbed = message?.embeds[0];

                    if (!message || message.author.id !== interaction.client.user.id || !oldEmbed) {
                        return await utils.reply.error(interaction, 'NO_EMBED_FOUND');
                    }

                    const editedEmbed = utils.createEmbed({
                        title: title ?? oldEmbed.title,
                        description: description ?? oldEmbed.description,
                        url: url ?? oldEmbed.url,
                        color: finalColor || oldEmbed.color,
                        thumbnail: thumbnail ?? oldEmbed.thumbnail?.url,
                        image: image ?? oldEmbed.image?.url,
                        timestamp: timestampOption === null ? (oldEmbed.timestamp ? new Date(oldEmbed.timestamp).getTime() : null) : (timestampOption ? Date.now() : null),
                        author: (authorName || authorIcon || authorUrl) ? {
                            name: authorName ?? oldEmbed.author?.name,
                            iconURL: authorIcon ?? oldEmbed.author?.iconURL,
                            url: authorUrl ?? oldEmbed.author?.url
                        } : (oldEmbed.author ? { name: oldEmbed.author.name, iconURL: oldEmbed.author.iconURL, url: oldEmbed.author.url } : null),
                        footer: (footerText || footerIcon) ? {
                            text: footerText ?? oldEmbed.footer?.text,
                            iconURL: footerIcon ?? oldEmbed.footer?.iconURL
                        } : (oldEmbed.footer ? { text: oldEmbed.footer.text, iconURL: oldEmbed.footer.iconURL } : null)
                    });

                    await message.edit({ embeds: [editedEmbed] });
                    await utils.reply.success(interaction, 'EMBED_EDIT');
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Embed] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'create' ? 'EMBED_ADD_ERROR' : 'EMBED_EDIT_ERROR';
            await utils.reply.error(interaction, errorKey);
        }
    }
};