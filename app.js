const fs = require('fs');
const { prefix, token } = require('./config.json');
const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop, UserItems, UserStats } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () => {
	// add here to sync
	// UserStats.sync();
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log(`Logged in as ${client.user.tag}!`);
});

const PREFIX = '!';

client.on('message', async message => {
	
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}

	currency.add(message.author.id, 1);
    
     if (command === 'inventory' || command === 'inv' || command === 'i') {
		const target = message.mentions.users.first() || message.author;
		const user = await Users.findOne({ where: { user_id: target.id } });
		const items = await user.getItems();

		if (!items.length) return message.channel.send(`${target.tag} has nothing!`);
		return message.channel.send(`${target.tag} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
    } 
    
    else if (command === 'give') {
		const currentAmount = currency.getBalance(message.author.id);
		const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));
		const transferTarget = message.mentions.users.first();

		if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount`);
		if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author} you don't have that much.`);
		if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}`);

		currency.add(message.author.id, -transferAmount);
		currency.add(transferTarget.id, transferAmount);

		return message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);
	} 
	
    
    else if (command === 'buy') {
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
		if (!item) return message.channel.send('That item doesn\'t exist.');
		if (item.cost > currency.getBalance(message.author.id)) {
			return message.channel.send(`You don't have enough currency, ${message.author}`);
		}

		const user = await Users.findOne({ where: { user_id: message.author.id } });
		currency.add(message.author.id, -item.cost);
		await user.addItem(item);

		if(item.name === 'Scoop'){
			message.channel.send(`You've bought a ${item.name} <:scoop:259512211557449729>`);
			return;
		} else if (item.name === 'Chip'){
			message.channel.send(`You've bought a ${item.name} <:chip:725911717149802516>`);
			return;
		} else if (item.name === 'Gamer Fuel'){
			message.channel.send(`You've bought a ${item.name} <:gfuel:725912048872980541>`);
			return;
		} else if (item.name === 'Panchos Burrito'){
			message.channel.send(`You've bought a ${item.name} <:burrito:>`);
			return;
		}
		else if (item.name === 'Video Card'){
			message.channel.send(`You've bought a ${item.name}`);
			return;
		}
		else if (item.name === 'DX Racer Gaming Chair'){
			message.channel.send(`You've bought a ${item.name}`);
			return message.channel.send('https://media.giphy.com/media/9GI7UsVM786CLzhz84/giphy.gif')
		}

		message.channel.send(`You've bought a ${item.name}`);
	}
    
    else if (command === 'shop') {
		const items = await CurrencyShop.getItems();
		return message.channel.send(items.map(i => `${i.name}: ${i.cost}💰`).join('\n'), { code: true });
    } 
    
    else if (command === 'leaderboard') {
		return message.channel.send(
			currency.sort((a, b) => b.balance - a.balance)
				.filter(user => client.users.cache.has(user.user_id))
				.first(10)
				.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
				.join('\n'),
			{ code: true }
		);
    } 
});

client.login(token);
