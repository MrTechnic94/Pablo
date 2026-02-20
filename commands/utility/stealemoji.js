'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, RESTJSONErrorCodes } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    botPermissions: [PermissionFlagsBits.ManageGuildExpressions],
    data: new SlashCommandBuilder()
        .setName('stealemoji')
        .setDescription('Dodaje emoji z linku lub z innego serwera.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji lub link do obrazka.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nazwa')
                .setDescription('Nazwa dla nowego emoji.')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const emojiInput = interaction.options.getString('emoji');
        const name = interaction.options.getString('nazwa');
        const url = utils.parseEmojiUrl(emojiInput);

        if (!url) {
            return await utils.reply.error(interaction, 'INVALID_FILE');
        }

        try {
            const createdEmoji = await interaction.guild.emojis.create({
                attachment: url,
                name: name
            });

            const createdAt = Math.floor(createdEmoji.createdTimestamp / 1000);
            const animated = createdEmoji.animated ? 'Tak' : 'Nie';
            const emojiURL = createdEmoji.imageURL({ animated: createdEmoji.animated });

            const successEmbed = utils.createEmbed({
                title: 'Dodano emoji',
                fields: [
                    { name: '`🔎` Nazwa', value: `**•** ${createdEmoji.name}`, inline: false },
                    { name: '`🔑` ID', value: `**•** ${createdEmoji.id}`, inline: false },
                    { name: '`✨` Animowana', value: `**•** ${animated}`, inline: false },
                    { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                    { name: '`👤` Dodane przez', value: `**•** <@${interaction.user.id}>`, inline: false },
                    { name: '`🔗` Link', value: `**•** [KLIKNIJ🡭](${emojiURL})`, inline: false }
                ],
                thumbnail: emojiURL
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Stealemoji] An error occurred for '${interaction.guild.id}':\n${err}`);

            if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached || err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached) {
                return await utils.reply.error(interaction, 'EMOJI_FULL_SLOT');
            }

            if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.code === RESTJSONErrorCodes.InvalidFileUploaded) {
                return await utils.reply.error(interaction, 'INVALID_FILE');
            }

            await utils.reply.error(interaction, 'EMOJI_ERROR');
        }
    },
};