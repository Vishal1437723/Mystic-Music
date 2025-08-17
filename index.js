const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Discord Player
client.player = new Player(client);
client.player.extractors.loadDefault();

// Interaction handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ There was an error executing that command.', ephemeral: true });
    }
});

// Bot status
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
    client.user.setActivity(`Mystic Vibes | ${client.guilds.cache.size} servers`, { type: 3 }); // WATCHING
});

client.login(config.TOKEN);