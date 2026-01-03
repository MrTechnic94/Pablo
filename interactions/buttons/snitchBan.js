'use strict';

const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    customId: 'snitch_ban_',
    isPrefix: true,
    async execute(interaction) {
        const targetId = interaction.customId.replace('snitch_ban_', '');

        const reporterField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłaszający'));
        const reporterIdMatch = reporterField ? reporterField.value.match(/<@!?(\d+)>/) : null;
        const reporterId = reporterIdMatch ? reporterIdMatch[1] : null;

        const reasonField = interaction.message.embeds[0].fields.find(f => f.name.includes('Powód') || f.name.includes('wiadomości'));

        let rawReason = reasonField ? reasonField.value : "Naruszenie regulaminu.";
        rawReason = rawReason.replace(/[`*•]|```/g, '').trim();

        const fullReason = `ZGŁOSZENIE: Zaakceptowane przez ${interaction.user.tag} | POWÓD: ${rawReason}`;
        const auditLogReason = fullReason.length > 500 ? `${fullReason.slice(0, 497)}...` : fullReason;

        // Powiadomienie reportera
        if (reporterId) {
            const description = reply.getString('success', 'SNITCH_ACCEPTED', interaction.guild.name);
            const firstEmbedDM = createEmbed({ title: 'Zgłoszenie zaakceptowane', description });
            await interaction.client.users.send(reporterId, { embeds: [firstEmbedDM] }).catch(() => null);
        }

        // Powiadomienie zbanowanego
        const secondEmbedDM = createEmbed({
            title: 'Zostałeś zbanowany',
            description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${rawReason}`
        });
        await interaction.client.users.send(targetId, { embeds: [secondEmbedDM] }).catch(() => null);

        // Ban i czyszczenie
        await interaction.guild.members.ban(targetId, { reason: auditLogReason });

        // Logika usuwania duplikatow
        const messages = await interaction.channel.messages.fetch({ limit: 50 });
        const duplicates = messages.filter(msg =>
            msg.embeds.length > 0 && msg.id !== interaction.message.id &&
            msg.embeds[0].fields.some(f => f.value.includes(targetId))
        );
        for (const msg of duplicates.values()) await msg.delete().catch(() => null);

        const finishedEmbed = interaction.message.embeds[0].toJSON();
        finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
        finishedEmbed.color = 0x2b2d31;

        await interaction.update({
            content: `\`🔨\` Użytkownik został zbanowany przez ${interaction.user}.`,
            embeds: [finishedEmbed],
            components: []
        });
    }
};