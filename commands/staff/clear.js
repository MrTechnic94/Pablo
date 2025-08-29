'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Usuwa wybraną ilość wiadomości z kanału.')
        .addIntegerOption(option =>
            option.setName('ilość')
                .setDescription('Ilość wiadomości do usunięcia.')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('usuń_przypięte')
                .setDescription('Wybierz, czy chcesz usunąć również przypięte wiadomości.')
                .setRequired(false)
                .addChoices(
                    { name: 'Tak', value: 'true' },
                    { name: 'Nie', value: 'false' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do usuwania wiadomości.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do usuwania wiadomości.', flags: MessageFlags.Ephemeral });
        }

        const amount = interaction.options.getInteger('ilość');
        const removePinnedStr = interaction.options.getString('usuń_przypięte') ?? 'false';
        const removePinned = removePinnedStr === 'true';

        const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });

        const messagesToDelete = removePinned ? fetchedMessages : fetchedMessages.filter(msg => !msg.pinned);

        if (!messagesToDelete.size) {
            return await interaction.reply({ content: '❌ Nie znaleziono wiadomości do usunięcia z podanymi opcjami.', flags: MessageFlags.Ephemeral });
        }

        try {
            await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = createEmbed({
                title: 'Akcja wykonana',
                description: `\`💬\` **Usunięto: ** ${messagesToDelete.size > 1 ? `${messagesToDelete.size} wiadomości` : `${messagesToDelete.size} wiadomość`}\n\`📌\` **W tym przypięte:** ${removePinned ? 'Tak.' : 'Nie.'}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            logger.error(`[Slash ▸ Clear] ${error}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas usuwania wiadomości.', flags: MessageFlags.Ephemeral });
        }
    },
};