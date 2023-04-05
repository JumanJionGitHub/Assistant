const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ComponentType, userMention, inlineCode } = require('discord.js');
const { Emojis } = require('../../config.json');
const database = require('../../database/schemas/PunishmentSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View a punishment case.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addStringOption(option => option
            .setName('id')
            .setDescription('The id of the punishment.')
            .setRequired(true)
    ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { guildId, options, channel } = interaction;

        const PunishmentID = options.getString('id');
        const data = await database.findOne({ GuildID: guildId, CaseID: PunishmentID });

        if (!data) return interaction.reply({
            content: `${Emojis.Error_Emoji} No punishment found.`
        });

        const CaseOptions = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId('case-options-menu')
            .setPlaceholder('Case Options')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(
                { label: 'Delete', description: 'Delete this case.', emoji: '🛑', value: 'delete' }
            )
        )
        
        const CaseEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle(`${data.Type} - Case #${data.CaseID}`)
        .setFields(
            { name: 'User', value: `${data.UserTag} (${userMention(data.UserID)})`, inline: true },
            { name: 'Moderator', value: `${data.Content[0].Moderator}`, inline: true },
            { name: `${data.Content[0].PunishmentDate}:`, value: `${data.Content[0].Reason}` }
        )

        switch (data.Type) {
            case 'Ban':
                CaseEmbed.setColor('Red')
                break;
            case 'Kick':
                CaseEmbed.setColor('Red')
                break;
            case 'Mute':
                CaseEmbed.setColor('Yellow')
                break;
            case 'Warn':
                CaseEmbed.setColor('Orange')
                break;
            case 'Unmute':
                CaseEmbed.setColor('Green')
                break;
            case 'Unban':
                CaseEmbed.setColor('Green')
                break;
        };

        try {
            if (data.Content[0].Duration) {
                CaseEmbed.setFields(
                    { name: 'User', value: `${data.UserTag} (<@${data.UserID}>)`, inline: true },
                    { name: 'Moderator', value: `${data.Content[0].Moderator}`, inline: true },
                    { name: 'Duration', value: `${data.Content[0].Duration}`, inline: true },
                    { name: `${data.Content[0].PunishmentDate}:`, value: `${data.Content[0].Reason}` }
                )
            };
        } catch (error) {};

        const collector = channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect });

        collector.on('collect', (i) => {
            if (!i.customId === 'case-options-menu' || !i.member.permissions.has('ModerateMembers')) return;

            let chosenOption = ''
            i.values.forEach((value) => { chosenOption = value });

            switch (chosenOption) {
                case 'delete':
                    database.deleteOne({ GuildID: guildId, CaseID: PunishmentID }).then(() => {
                        i.reply({
                            content: `${Emojis.Success_Emoji} Case ${inlineCode(PunishmentID)} has been deleted successfully.`,
                            ephemeral: true
                        });
                    });
                    
                    interaction.editReply({
                        embeds: [CaseEmbed.setColor('Grey').setTitle('Case Deleted')],
                        components: []
                    });
            }
        });

        interaction.reply({
            embeds: [CaseEmbed],
            components: [CaseOptions]
        });
    },
};