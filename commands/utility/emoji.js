'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, RESTJSONErrorCodes } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    botPermissions: [PermissionFlagsBits.ManageGuildExpressions],
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Zarządzanie emoji na serwerze.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
        .addSubcommand(sub => sub
            .setName('steal')
            .setDescription('Dodaje emoji z linku lub z innego serwera.')
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('Emoji lub link do obrazka.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('nazwa')
                .setDescription('Nazwa dla nowego emoji.')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'steal': {
                    const emojiInput = interaction.options.getString('emoji');
                    const name = interaction.options.getString('nazwa');
                    const url = utils.parseEmojiUrl(emojiInput);

                    if (!url) return await utils.reply.error(interaction, 'INVALID_FILE');

                    const createdEmoji = await interaction.guild.emojis.create({ attachment: url, name: name });
                    const createdAt = Math.floor(createdEmoji.createdTimestamp / 1000);
                    const emojiURL = createdEmoji.imageURL({ animated: createdEmoji.animated });

                    const successEmbed = utils.createEmbed({
                        title: 'Dodano emoji',
                        fields: [
                            { name: '`🔎` Nazwa', value: `**•** ${createdEmoji.name}`, inline: false },
                            { name: '`🔑` ID', value: `**•** ${createdEmoji.id}`, inline: false },
                            { name: '`✨` Animowana', value: `**•** ${createdEmoji.animated ? 'Tak' : 'Nie'}`, inline: false },
                            { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                            { name: '`👤` Dodane przez', value: `**•** <@${interaction.user.id}>`, inline: false },
                            { name: '`🔗` Link', value: `**•** [KLIKNIJ🡭](${emojiURL})`, inline: false }
                        ],
                        thumbnail: emojiURL
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Emoji] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);

            if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached || err.code === RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached) {
                return await utils.reply.error(interaction, 'EMOJI_FULL_SLOT');
            }

            if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.code === RESTJSONErrorCodes.InvalidFileUploaded) {
                return await utils.reply.error(interaction, 'INVALID_FILE');
            }
            await utils.reply.error(interaction, 'STEAL_EMOJI_ERROR');
        }
    },
};