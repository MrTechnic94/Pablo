'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { embeds } = require('../../config/default.json');

module.exports = {
    customId: 'snitch_ban_',
    isPrefix: true,
    botPermissions: [PermissionFlagsBits.BanMembers],
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        try {
            const targetId = interaction.customId.replace('snitch_ban_', '');

            if (!targetId.bannable) {
                return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
            }

            const reporterField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłaszający'));
            const reporterIdMatch = reporterField ? reporterField.value.match(/<@!?(\d+)>/) : null;
            const reporterId = reporterIdMatch ? reporterIdMatch[1] : null;

            const reasonField = interaction.message.embeds[0].fields.find(f => f.name.includes('Powód') || f.name.includes('wiadomości'));

            let rawReason = reasonField ? reasonField.value : "Naruszenie regulaminu.";
            rawReason = rawReason.replace(/[`*•]|```/g, '').trim();

            const fullReason = `ZGŁOSZENIE: Zaakceptowane przez ${interaction.user.tag} | POWÓD: ${rawReason}`;
            const auditLogReason = fullReason.length > 500 ? `${fullReason.slice(0, 497)}...` : fullReason;

            // Powiadomienie zglaszajacego
            if (reporterId) {
                const description = utils.reply.getString('success', 'SNITCH_ACCEPTED', 'zbanowany', interaction.guild.name);
                const firstEmbedDM = utils.createEmbed({ title: 'Zgłoszenie zaakceptowane', description });
                await interaction.client.users.send(reporterId, { embeds: [firstEmbedDM] }).catch(() => logger.warn(`[Button ▸ SnitchBan] Failed to send DM to '${reporterId}'`));
            }

            // Powiadomienie zbanowanego
            const secondEmbedDM = utils.createEmbed({
                title: 'Zostałeś zbanowany',
                description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${rawReason}`
            });

            await interaction.client.users.send(targetId, { embeds: [secondEmbedDM] }).catch(() => logger.warn(`[Button ▸ SnitchBan] Failed to send DM to '${reporterId}'`));

            // Ban
            await interaction.guild.bans.create(targetId, { reason: auditLogReason });

            // Usuwania duplikatow
            const messages = await interaction.channel.messages.fetch({ limit: 50 }).catch(() => null);

            const duplicates = messages.filter(msg =>
                msg.embeds.length > 0 && msg.id !== interaction.message.id &&
                msg.embeds[0].fields.some(f => f.value.includes(targetId))
            );

            for (const msg of duplicates.values()) await msg.delete().catch(() => null);

            const finishedEmbed = interaction.message.embeds[0].toJSON();
            finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
            finishedEmbed.color = embeds.secondaryColor;

            return await interaction.update({
                content: `\`🔨\` Użytkownik został zbanowany przez <@${interaction.user.id}>.`,
                embeds: [finishedEmbed],
                components: []
            });
        } catch (err) {
            logger.error(`[Button ▸ SnitchBan] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'COMMAND_ERROR');
        }
    },
};