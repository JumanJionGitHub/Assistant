const { ChatInputCommandInteraction, SlashCommandBuilder, Client } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns with the bot\'s ping.'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { createdTimestamp } = interaction;

        const sentMessage = await interaction.reply({ content: 'Pinging..', fetchReply: true });
        const latency = sentMessage.createdTimestamp - createdTimestamp;

        interaction.editReply({ content: `Latency: **${latency}ms** - API: **${Math.round(client.ws.ping)}ms**`});
    },
};