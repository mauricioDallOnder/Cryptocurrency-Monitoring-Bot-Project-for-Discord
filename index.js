const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits,ActivityType } = require('discord.js');
require('dotenv').config()
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async () => {
	console.log('Ready!');
	await updateApecoinPrice();  // Atualiza o preço na inicialização
	setInterval(updateApecoinPrice, 60 * 1000);  // Atualiza o preço a cada minuto
    
});

async function updateApecoinPrice() {
	try {
		const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=apecoin&vs_currencies=usd');
		const price = response.data.apecoin.usd;
		client.user.setPresence({ activities: [{ name: `$ ${price} `, type: ActivityType.Watching }], status: 'online' });
	} catch (error) {
		console.error('Error updating Bitcoin price:', error);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(process.env.token);
