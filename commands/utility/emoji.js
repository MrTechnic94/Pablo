'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

const emojiRegex = /<?(?:a:)?(?<name>\w+):(?<id>\d+)>?/;

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Wyświetla informacje o wybranym emoji.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Wklej emoji, o którym chcesz uzyskać informacje.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const rawEmoji = interaction.options.getString('emoji');

        const match = rawEmoji.match(emojiRegex);

        if (!match) {
            return await utils.reply.error(interaction, 'INVALID_EMOJI');
        }

        const emojiId = match.groups.id;
        const emoji = interaction.guild.emojis.cache.get(emojiId);

        if (!emoji) {
            return await utils.reply.error(interaction, 'EMOJI_NOT_FOUND');
        }

        const createdAt = Math.floor(emoji.createdTimestamp / 1000);
        const animated = emoji.animated ? 'Tak' : 'Nie';
        const author = await emoji.fetchAuthor().catch(() => 'Brak uprawnień.');
        const emojiURL = emoji.imageURL({ animated: emoji.animated });

        const fields = [
            { name: '`🔎` Nazwa', value: `**•** \`:${emoji.name}:\``, inline: false },
            { name: '`🔑` ID', value: `**•** ${emoji.id}`, inline: false },
            { name: '`✨` Animowana', value: `**•** ${animated}`, inline: false },
            { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
            { name: '`👤` Dodane przez', value: `**•** ${author}`, inline: false },
            { name: '`🔗` Link', value: `**•** [KLIKNIJ🡭](${emojiURL})`, inline: false }
        ];

        if (emoji.managed) {
            fields.push({ name: '`📦` Integracja', value: '**•** Tak (Zewnętrzna usługa)', inline: false });
        }

        const successEmbed = utils.createEmbed({
            title: 'Podgląd emoji',
            fields: fields,
            thumbnail: emojiURL
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};