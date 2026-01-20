'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    index: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Wyświetla listę poleceń.')
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

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
            return await utils.reply.error(interaction, 'NO_COMMANDS_AVAILABLE');
        }

        const pages = categoryKeys.map((category, index) => {
            return utils.createEmbed({
                title: 'Menu pomocy',
                description: `**• Kategoria: ${category}**\n\n ${categories[category].join('\n\n')}`,
                footer: { text: `Strona ${index + 1} z ${categoryKeys.length} • Poleceń: ${categories[category].length}` }
            });
        });

        await utils.sendPaginatedEmbed(interaction, pages);
    },
};