'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { colors } = require('../../locales/pl_PL');

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
                .setDescription('Kod koloru.')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'random': {
                const dec = Math.floor(Math.random() * 16777216);
                const hex = dec.toString(16).padStart(6, '0').toUpperCase();
                const r = (dec >> 16) & 255;
                const g = (dec >> 8) & 255;
                const b = dec & 255;

                const successEmbed = utils.createEmbed({
                    title: 'Losowy kolor',
                    description: `\`📟\` **Decimal:** ${dec}\n\`🎨\` **Hex:** #${hex}\n\`🌈\` **RGB:** ${r}, ${g}, ${b}`,
                    thumbnail: `https://dummyimage.com/400x400/${hex}/${hex}`,
                    color: dec
                });

                await interaction.reply({ embeds: [successEmbed] });
                break;
            }

            case 'get': {
                const input = interaction.options.getString('kolor').trim();
                const upperInput = input.toUpperCase();
                let dec = null;

                if (colors && Object.hasOwn(colors, upperInput)) {
                    dec = colors[upperInput];
                } else if (/^\d+$/.test(input)) {
                    const val = parseInt(input, 10);
                    if (val >= 0 && val <= 16777215) dec = val;
                } else if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {
                    dec = parseInt(input.replace('#', ''), 16);
                } else if (/^#?[0-9A-Fa-f]{3}$/.test(input)) {
                    const clean = input.replace('#', '');
                    const fullHex = clean.split('').map(x => x + x).join('');
                    dec = parseInt(fullHex, 16);
                } else if (/^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/.test(input)) {
                    const [r, g, b] = input.split(',').map(n => parseInt(n.trim(), 10));
                    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                        dec = (r << 16) + (g << 8) + b;
                    }
                }

                if (dec === null || Number.isNaN(dec)) {
                    return await utils.reply.error(interaction, 'INVALID_COLOR_FORMAT');
                }

                const finalHex = dec.toString(16).padStart(6, '0').toUpperCase();
                const r = (dec >> 16) & 255;
                const g = (dec >> 8) & 255;
                const b = dec & 255;

                const successEmbed = utils.createEmbed({
                    title: `Podgląd koloru`,
                    description: `\`📟\` **Decimal:** ${dec}\n\`🎨\` **Hex:** #${finalHex}\n\`🌈\` **RGB:** ${r}, ${g}, ${b}`,
                    thumbnail: `https://dummyimage.com/400x400/${finalHex}/${finalHex}`,
                    color: dec
                });

                await interaction.reply({ embeds: [successEmbed] });
                break;
            }

            default:
                await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
        }
    },
};