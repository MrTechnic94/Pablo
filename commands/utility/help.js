'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { sendPaginatedEmbed } = require('../../lib/utils/buttonPaginator');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    index: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Wyświetla listę poleceń.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const clientCommands = await interaction.client.application.commands.fetch().catch(() => null);
        const localCommands = interaction.client.commands;
        const categories = {};

        localCommands.forEach(cmd => {
            const name = cmd.data.name;
            const index = cmd.index;

            if (index === false) return;

            const cat = cmd.category || '`❓` Inne';
            if (!categories[cat]) categories[cat] = [];

            const registered = clientCommands.find(c => c.name === name);
            const commandLink = registered ? `</${name}:${registered.id}>` : `\`/${name}\``;
            const description = cmd.data.description || 'Brak opisu.';

            categories[cat].push(`\`🔹\` ${commandLink}\n> ${description}`);
        });

        const categoryKeys = Object.keys(categories);

        if (!categoryKeys) {
            return await reply.error(interaction, 'NO_COMMANDS_AVAILABLE');
        }

        const pages = categoryKeys.map((category, index) => {
            return createEmbed({
                title: 'Menu pomocy',
                description: `**• Kategoria: ${category}**\n\n ${categories[category].join('\n\n')}`,
                footer: { text: `Strona ${index + 1} z ${categoryKeys.length} • Poleceń: ${categories[category].length}` }
            });
        });

        await sendPaginatedEmbed(interaction, pages);
    },
};