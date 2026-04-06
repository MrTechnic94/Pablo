'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ChannelType } = require('discord.js');

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
                .setName('tytuł')
                .setDescription('Tytuł.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('opis')
                .setDescription('Główna treść.')
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
                .setName('miniaturka')
                .setDescription('Link do miniaturki.')
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
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread)
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
                .setName('tytuł')
                .setDescription('Nowy tytuł.')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('opis')
                .setDescription('Nowa treść.')
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
                .setName('miniaturka')
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
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();

        try {
            const targetChannel = interaction.options.getChannel('kanał') || interaction.channel;
            const messageId = interaction.options.getString('id_wiadomości');

            const title = interaction.options.getString('tytuł');
            const description = interaction.options.getString('opis');
            const color = interaction.options.getString('kolor');
            const url = interaction.options.getString('tytuł_url');
            const thumbnail = interaction.options.getString('miniaturka');
            const image = interaction.options.getString('obraz');
            const timestampOption = interaction.options.getBoolean('znacznik_czasu');

            const authorName = interaction.options.getString('autor_nazwa');
            const authorIcon = interaction.options.getString('autor_ikona');
            const authorUrl = interaction.options.getString('autor_url');

            const footerText = interaction.options.getString('stopka_tekst');
            const footerIcon = interaction.options.getString('stopka_ikona');

            const finalColor = utils.parser.color(color);

            if (color && !finalColor) {
                return await utils.interface.sendError(interaction, 'INVALID_COLOR_FORMAT');
            }

            switch (subcommand) {
                case 'create': {
                    const hasAnyContent = [
                        title, description, thumbnail,
                        image, authorName, footerText
                    ].some(option => option !== null && option !== undefined && option !== '');

                    if (!hasAnyContent) {
                        return await utils.interface.sendError(interaction, 'EMPTY_EMBED_CONTENT');
                    }

                    const successEmbed = utils.interface.createEmbed({
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
                    await utils.interface.sendSuccess(interaction, 'EMBED_CREATED', targetChannel.id);
                    break;
                }

                case 'edit': {
                    const hasAnyContent = [
                        title, description, color, url, thumbnail, image,
                        timestampOption, authorName, authorIcon, authorUrl,
                        footerText, footerIcon, finalColor
                    ].some(option => option !== null && option !== undefined && option !== '');

                    if (!hasAnyContent) {
                        return await utils.interface.sendError(interaction, 'EMPTY_CONTENT');
                    }

                    const message = await targetChannel.messages.fetch(messageId).catch(() => null);
                    const oldEmbed = message?.embeds[0];

                    if (!message || message.author.id !== interaction.client.user.id || !oldEmbed) {
                        return await utils.interface.sendError(interaction, 'NO_EMBED_FOUND');
                    }

                    const isUnchanged =
                        (title === null || title === oldEmbed.title) &&
                        (description === null || description === oldEmbed.description) &&
                        (url === null || url === oldEmbed.url) &&
                        (finalColor === null || finalColor === oldEmbed.hexColor) &&
                        (thumbnail === null || thumbnail === oldEmbed.thumbnail?.url) &&
                        (image === null || image === oldEmbed.image?.url) &&
                        (timestampOption === null || (timestampOption === !!oldEmbed.timestamp)) &&
                        (authorName === null || authorName === oldEmbed.author?.name) &&
                        (authorIcon === null || authorIcon === oldEmbed.author?.iconURL) &&
                        (authorUrl === null || authorUrl === oldEmbed.author?.url) &&
                        (footerText === null || footerText === oldEmbed.footer?.text) &&
                        (footerIcon === null || footerIcon === oldEmbed.footer?.iconURL);

                    if (isUnchanged) {
                        return await utils.interface.sendError(interaction, 'NO_EMBED_CHANGES_DETECTED');
                    }

                    const editedEmbed = utils.interface.createEmbed({
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
                    await utils.interface.sendSuccess(interaction, 'EMBED_EDITED');
                    break;
                }

                default:
                    await utils.interface.sendError(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Embed] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'create' ? 'EMBED_CREATE_ERROR' : 'EMBED_EDIT_ERROR';
            await utils.interface.sendError(interaction, errorKey);
        }
    }
};