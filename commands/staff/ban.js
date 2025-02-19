'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika na serwerze.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do zbanowania.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód zbanowania.')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('usuń_wiadomości')
                .setDescription('Wybierz, przez jak długi czas usunąć wiadomości użytkownika.')
                .setRequired(false)
                .addChoices(
                    { name: 'Nie usuwaj', value: 0 },
                    { name: 'Ostatnia godzina', value: 3600 },
                    { name: '6 godzin', value: 21600 },
                    { name: '12 godzin', value: 43200 },
                    { name: '24 godziny', value: 86400 },
                    { name: '3 dni', value: 259200 },
                    { name: '7 dni', value: 604800 }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do banowania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do banowania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';
        const deleteMessageDuration = interaction.options.getInteger('usuń_wiadomości') || 0;

        if (!targetUser) {
            return await interaction.reply({ content: '❌ Nie znaleziono użytkownika.', flags: MessageFlags.Ephemeral });
        }

        if (interaction.member.roles.highest.position <= targetUser.roles.highest.position) {
            return await interaction.reply({ content: '❌ Nie możesz zbanować tego użytkownika, ponieważ jego ranga jest równa lub wyższa od Twojej.', flags: MessageFlags.Ephemeral });
        }

        if (!targetUser.bannable) {
            return await interaction.reply({ content: '❌ Nie mogę zbanować tego użytkownika.', flags: MessageFlags.Ephemeral });
        }

        // Funckja konwertujaca czas
        const formatHours = (seconds) => {
            if (seconds === 0) return 'Nie usuwaj';
            const hours = seconds / 3600;
            return hours === 1 ? '1 godzina' : `${hours} godzin`;
        };

        try {
            // Wysylanie wiadomosci prywatnej do zbanowanego uzytkownika
            await targetUser.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Zostałeś zbanowany!')
                        .setDescription(`\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                        .setColor(embedOptions.defaultColor)
                ]
            }).catch(() => logger.warn(`[Cmd - ban] Failed to send DM to ${targetUser.user.tag}`));

            await targetUser.ban({ reason, deleteMessageSeconds: deleteMessageDuration });

            // Tworzenie embed dla kanalu, w ktorym komenda zostala uzyta
            const successEmbed = new EmbedBuilder()
                .setTitle('Użytkownik zbanowany')
                .setDescription(`\`👤\` **Wyrzucono:** ${targetUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}\n\`🗑️\` **Usunięcie wiadomości:** ${formatHours(deleteMessageDuration)}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - ban] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas banowania użytkownika.', flags: MessageFlags.Ephemeral });
        }
    },
};