const { prefix, token } = require('./config.json');
const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop, UserItems } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();

const PREFIX = '!';


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
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (message.author.bot) return;
	currency.add(message.author.id, 1);

	if(message.content.match(/cooldown/i)){
		message.channel.send('Pong.');
	}

	if (!message.content.startsWith(PREFIX)) return;
	const input = message.content.slice(PREFIX.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance' || command === 'bal' || command === 'b') {
		const target = message.mentions.users.first() || message.author;
		return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)} 💰`);
    } 

    else if (command === 'help') {
		return message.channel.send(`Commands: !shop | !buy | !inventory | !profile | !give User Amount | !leaderboard`);
    } 
    
    else if (command === 'inventory' || command === 'inv' || command === 'i') {
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
		}

		message.channel.send(`You've bought a ${item.name}`);
    } 
    
    else if (command === 'shop') {
		const items = await CurrencyShop.findAll();
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

    else if (command === 'profile' || command === 'p'){
		const target = message.mentions.users.first() || message.author;
		console.log(target)
		var avatar = target.displayAvatarURL({ format: "png", dynamic: true });
		var money = `${currency.getBalance(target.id)}`

		var ss = currency.sort((a, b) => b.balance - a.balance)
		.filter(user => client.users.cache.has(user.user_id))
		.first(100)
		.map((user, position) => `${position + 1} ${(client.users.cache.get(user.user_id).tag)}`)

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .setTitle('Noob')
            .addFields(
                { name: 'PROGRESS', value: 'Level: 1 (0.00%)\nXP: 0 (0.00%)\nArea: Starting' },
                { name: 'STATS', value: ':dagger: ATK: 1\n:shield: DEF: 1\n:heart: LIFE: 10/10' },
                { name: 'EQUIPMENT', value: '<:orb:684419011760750623> Orb [Regular]\n:shield: Armor [Regular]', inline: true },
                { name: 'MONEY', value: `<:oldgaycoin:259774901454503936> ${money}`, inline: true },
            )
            .setAuthor(`${target.username}`, avatar, '')
            .setThumbnail(avatar)
            // .setImage('https://media1.tenor.com/images/0390f1b0853b4957c8d8ccf88ae2b65f/tenor.gif')
            .setTimestamp()
            .setFooter(`Current Leader: ${ss[0].slice(2,9)}`, 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/ea701046715833.588f83572fcfe.gif');

            message.channel.send(exampleEmbed);
    }
});

client.login(token);