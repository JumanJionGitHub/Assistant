const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Emojis, Links, PunishmentTypes, IDs } = require('../../config.json');
const { createCaseId } = require('../../util/generateCaseId');
const database = require('../../database/schemas/PunishmentSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption(option => option
            .setName('target')
            .setDescription('User to ban.')
            .setRequired(true)
    )
    .addStringOption(option => option
            .setName('reason')
            .setDescription('The ban reason.')
            .setMaxLength(1000)
            .setMinLength(1)
    )
    .addBooleanOption(option => option
            .setName('appeal')
            .setDescription('Whether or not they can appeal.')
    ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { guild, guildId, options, user, createdTimestamp } = interaction;

        const TargetUser = options.getUser('target');
        const TargetMember = await guild.members.fetch(TargetUser.id);
        const BanReason = options.getString('reason') || 'No reason provided.';
        const CanAppeal = options.getBoolean('appeal');

        const BanDate = new Date(createdTimestamp).toDateString();
        const LogChannel = guild.channels.cache.get(IDs.ModerationLogs);
        const CaseId = createCaseId();

        if (!TargetMember.bannable) return interaction.reply({ 
            content: `${Emojis.Error_Emoji} Unable to perform action.`
        });

        if (CanAppeal) {
            await TargetUser.send({
                content: `You have been banned from **${guild.name}** for the reason: **${BanReason}**\n\nIf you wish to appeal follow this link: ${Links.Appeal_Link}`
            }).catch(console.error);
        } else {
            await TargetUser.send({ 
                content: `You have been banned from **${guild.name}** for the reason: **${BanReason}**\n\nYou cannot appeal this ban.`
            }).catch(console.error);
        };
        
        await TargetMember.ban({ deleteMessageSeconds: 86400, reason: BanReason }).then(async () => {
            interaction.reply({ 
                content: `${Emojis.Success_Emoji} Banned **${TargetUser.tag}** (Case #${CaseId})`
             });

             const ban = await database.create({
                Type: PunishmentTypes.Ban,
                CaseID: CaseId,
                GuildID: guildId,
                UserID: TargetUser.id,
                UserTag: TargetUser.tag,
                Content: [
                    {
                        Moderator: user.tag,
                        PunishmentDate: BanDate,
                        Reason: BanReason,
                        Appeal: CanAppeal
                    }
                ],
             });

             ban.save();
        });

        const LogEmbed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
        .setDescription(`**Member**: <@${TargetUser.id}> | \`${TargetUser.id}\`\n**Type**: Ban\n**Reason**: ${BanReason}`)
        .setFooter({ text: `Punishment ID: ${CaseId}` })
        .setTimestamp()

        LogChannel.send({ embeds: [LogEmbed] });
    },
};