const { ChatInputCommandInteraction, SlashCommandBuilder, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock } = require('discord.js');
const { Colours } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows a list of commands.')
        .setDMPermission(false),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { guild } = interaction;

        const Buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Github').setStyle(ButtonStyle.Link).setURL('https://github.com/JayCordDev/Assistant')
        )

        const HelpEmbed = new EmbedBuilder()
        .setColor(Colours.Default_Colour)
        .setTitle('Help')
        .setDescription(`${client.user.username} is a private moderation and utility bot for ${guild.name}, currently managed and maintaned by the lovely development team!`)
        .setThumbnail(client.user.avatarURL())
        .setFields(
            {
                name: '• Info',
                value: codeBlock('help, membercount, serverinfo, userinfo')
            },
            {
                name: '• Moderation',
                value: codeBlock('ban, block, case, kick, lock, mod, mute, nick, purge, rmpunish, slowmode, unban, unblock, unlock, unmute, warn')
            },
            {
                name: '• Misc',
                value: codeBlock('archive, avatar, botnick, icon, roles, say')
            },
            {
                name: '• Games',
                value: codeBlock('8ball')
            },
            {
                name: '• Util',
                value: codeBlock('blacklist, customrole, debug, ping, status')
            },
            {
                name: '• Developer',
                value: codeBlock('invite')
            }
        )

        interaction.reply({ 
            embeds: [HelpEmbed],
            components: [Buttons]
        });
    },
};