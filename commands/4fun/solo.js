'use strict';

const { SlashCommandBuilder, InteractionContextType, Collection } = require('discord.js');
const { others } = require('../../config/default.json');

const activeBattles = new Collection();

module.exports = {
    category: '`💎` 4Fun',
    data: new SlashCommandBuilder()
        .setName('solo')
        .setDescription('Stocz walkę 1v1 z innym użytkownikiem.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option =>
            option.setName('przeciwnik')
                .setDescription('Wybierz użytkownika do walki.')
                .setRequired(true)
        ),
    async execute(interaction, logger) {
        const { guildId } = interaction;
        const { utils } = interaction.client;

        const currentGuildBattles = activeBattles.get(guildId) || 0;

        if (currentGuildBattles >= others.maxBattlesPerGuild) {
            return await utils.reply.error(interaction, 'TOO_MANY_FIGHTS', others.maxBattlesPerGuild);
        }

        const player1 = interaction.user;
        const player2 = interaction.options.getUser('przeciwnik');

        if (player1.id === player2.id) {
            return await utils.reply.error(interaction, 'CANT_FIGHT_YOURSELF');
        }

        activeBattles.set(guildId, currentGuildBattles + 1);

        try {
            const players = [
                { user: player1, hp: 100 },
                { user: player2, hp: 100 }
            ];

            const battleLog = [];

            const countdownEmbed = utils.createEmbed({
                title: '`💢` SOLÓWA ! `💢`',
                description: '*Walka zacznie się za 3...*'
            });

            const message = await interaction.reply({ embeds: [countdownEmbed] }).then(sent => sent.fetch()).catch(() => null);
            await new Promise(resolve => setTimeout(resolve, 1000));

            for (let i = 2; i > 0; i--) {
                countdownEmbed.setDescription(`*Walka zacznie się za ${i}...*`);
                await message.edit({ embeds: [countdownEmbed] });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            let round = 0;

            while (players[0].hp > 0 && players[1].hp > 0) {
                const attacker = players[round % 2];
                const defender = players[(round + 1) % 2];

                // 15% szans na krytyka
                const isCrit = Math.random() < 0.15;
                // 10% szans na unik
                const isMiss = Math.random() < 0.10;
                let damage = Math.floor(Math.random() * (25 - 10 + 1) + 10);
                let actionText = '';

                if (isMiss) {
                    actionText = `\`💨\` **${defender.user.username}** zrobił zwinny unik! **Zero obrażeń.**`;
                } else {
                    if (isCrit) {
                        damage = Math.floor(damage * 1.8);
                        actionText = `\`💥\` **CIOS KRYTYCZNY!** **${attacker.user.username}** potężnie uderzył **${defender.user.username}** za **${damage}** HP!`;
                    } else {
                        actionText = `\`⚔️\` **${attacker.user.username}** zadaje **${damage}** obrażeń użytkownikowi **${defender.user.username}**.`;
                    }
                    defender.hp = Math.max(0, defender.hp - damage);
                }

                battleLog.push(actionText);
                if (battleLog.length > 5) battleLog.shift();

                const battleEmbed = utils.createEmbed({
                    title: '`💢` TRWA WALKA ! `💢`',
                    description: battleLog.join('\n'),
                    fields: [
                        { name: `\`🩸\` ${players[0].user.username}`, value: `${players[0].hp} / 100 HP`, inline: true },
                        { name: `\`🩸\` ${players[1].user.username}`, value: `${players[1].hp} / 100 HP`, inline: true }
                    ],
                });

                await message.edit({ embeds: [battleEmbed] });
                if (defender.hp <= 0) break;

                round++;
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            const winner = players.find(p => p.hp > 0);

            const finalEmbed = utils.createEmbed({
                title: '`🥊` PODSUMOWANIE ! `🥊`',
                description: `\`👑\` **Zwycięzca:** <@${winner.user.id}>\n\n${battleLog.join('\n')}`,
                fields: [
                    { name: `${players[0].hp <= 0 ? '`💀`' : '`🩸`'} ${players[0].user.username}`, value: `${players[0].hp} / 100 HP`, inline: true },
                    { name: `${players[1].hp <= 0 ? '`💀`' : '`🩸`'} ${players[1].user.username}`, value: `${players[1].hp} / 100 HP`, inline: true }
                ]
            });

            await message.edit({ embeds: [finalEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Solo] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'FIGHT_ERROR');
        } finally {
            const updatedCount = activeBattles.get(guildId) || 1;
            activeBattles.set(guildId, Math.max(0, updatedCount - 1));
        }
    },
};