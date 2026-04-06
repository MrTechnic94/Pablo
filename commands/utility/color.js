'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Narzędzia do wyświetlania kolorów.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub
            .setName('random')
            .setDescription('Generuje losowy kolor.')
        )
        .addSubcommand(sub => sub
            .setName('get')
            .setDescription('Wyświetla informacje o wybranym kolorze.')
            .addStringOption(option => option
                .setName('kolor')
                .setDescription('Kod koloru albo nazwa.')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const { utils } = interaction.client;
        const subcommand = interaction.options.getSubcommand();

        let dec;

        if (subcommand === 'random') {
            dec = (Math.random() * 0x1000000) >>> 0;
        } else {
            const input = interaction.options.getString('kolor');
            dec = utils.parser.color(input);

            if (dec === null) {
                return utils.interface.sendError(interaction, 'INVALID_COLOR_FORMAT');
            }
        }

        const hex = dec.toString(16).padStart(6, '0').toUpperCase();

        const r = (dec >> 16) & 255;
        const g = (dec >> 8) & 255;
        const b = dec & 255;

        const successEmbed = utils.interface.createEmbed({
            title: subcommand === 'random' ? 'Losowy kolor' : 'Podgląd koloru',
            description: `\`📟\` **Decimal:** ${dec}\n\`🎨\` **Hex:** #${hex}\n\`🌈\` **RGB:** ${r}, ${g}, ${b}`,
            thumbnail: `https://placehold.co/80x80/${hex}/${hex}.webp`,
            color: dec
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};