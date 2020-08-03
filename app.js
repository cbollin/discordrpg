const config = require('./config.json');
const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop } = require('./dbObjects');
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

	if (!message.content.startsWith(PREFIX)) return;
	const input = message.content.slice(PREFIX.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance' || command === 'bal') {
		const target = message.mentions.users.first() || message.author;
		return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}💰`);
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
		} else if (item.name === 'Panchos Burrito'){
			message.channel.send(`You've bought a ${item.name} 🌯`);
			return;
		}
		else if (item.name === 'Video Card'){
			message.channel.send(`You've bought a ${item.name}`);
			return message.channel.send('https://giphy.com/gifs/90s-retro-commercials-d2Z7NqwF3yImFNHW');
        }
		else if (item.name === 'DX Racer Gaming Chair'){
			message.channel.send(`You've bought a ${item.name}`);
			return message.channel.send('https://media.giphy.com/media/9GI7UsVM786CLzhz84/giphy.gif');
        }

		message.channel.send(`You've bought a ${item.name}`);
	} 
	
	else if (command === 'shop') {
		const items = await CurrencyShop.findAll();
		return message.channel.send(items.map(i => `${i.name}: ${i.cost}💰`).join('\n'), { code: true });
	}

	//else if (command === 'lose') {
 //       const currentAmount = currency.getBalance(message.author.id);
 //       const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));

 //       if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount`);
 //       if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author} you don't have that much.`);
	//	if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}`);

	//	currency.add(message.author.id, -transferAmount - 1);

 //       return message.channel.send(` ${transferAmount} lost! Balance: ${currency.getBalance(message.author.id)}.`);
 //   }

	else if (command === 'cf'){

		const currentAmount = currency.getBalance(message.author.id);
		const transferAmount = commandArgs.split(/ +/).find(arg => !/<@!?\d+>/.test(arg));

		if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount`);
		if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author} you don't have that much.`);
		if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}`);

		x = (Math.floor(Math.random() * 2) === 0);

		if(x)
		{
			currency.add(message.author.id, transferAmount - 1);
			console.log(transferAmount);
			return message.channel.send(`Heads! 🎉 ${transferAmount} won! Balance: ${currency.getBalance(message.author.id)}.`);
		} else
		{
			currency.add(message.author.id, -transferAmount - 1);
			console.log(transferAmount);
			return message.channel.send(`Tails! 😣 ${transferAmount} lost! Balance: ${currency.getBalance(message.author.id)}.`);
		}
	}

	else if (command === 'q' || command === 'quest') {
		var level = Math.floor((Math.random() * 3) + 1);
		const target = message.mentions.users.first() || message.author;

		var bal = currency.getBalance(target.id);

		if (bal <= 1000) {
            if (level === 1) {
                currency.add(message.author.id, 20);
				return message.channel.send(`🐛 Zone: You killed da 🐗. 💰 +20!`);
            } else if (level === 2) {
                currency.add(message.author.id, 5);
				return message.channel.send(`🐛 Zone: You found some spare change on a 🐀. 💰 +5!`);
            }
            currency.add(message.author.id, 10);
			return message.channel.send(`🐛 Zone: Skittle Skaddle you receive the 🐛 blessing. 💰 +10!`);
		} else if (bal >= 1000 && bal <= 5000) {
            if (level === 1) {
                currency.add(message.author.id, 50);
				return message.channel.send(`Spoop City 👻: Spooper slain 👻. 💰 +20!`);
			} else if (level === 2) {
                currency.add(message.author.id, 75);
				return message.channel.send(`Spoop City 👻: Mouse gang appears! 🐭🐭🐭. You kill them. 💰 +40!`);
            }
            currency.add(message.author.id, 100);
			return message.channel.send(`Spoop City 👻: Lobster dinner 🦞. 💰 +60!`);
        };
	} else if (command === 'dkp') {
        const target = message.mentions.users.first() || message.author;
        var bal = currency.getBalance(target.id);

        if (bal <= 1000) {
            return message.channel.send(
                `Every post a beautiful baby boar is slain, please say sorry. Total 🐗 kills: ${
                currency.getBalance(target.id)}/1000 `);
		} else if (bal >= 1000 && bal <= 5000) {
            return message.channel.send(
                `Welcome to Spoop City 👻 Total kills: ${currency.getBalance(target.id)}/5000`);
        } else if (bal > 5000) {
            return message.channel.send(`Nothin here yet! ${currency.getBalance(target.id)}/3000`);
        }

        return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)} 🐲`);
    }

	else if (command === 'qinfo' || command === 'questinfo' || command === 'qi') {

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .setTitle('Quest Areas')
            .addFields(
                { name: 'Area 1', value: '🐛 Bug Zone' },
				{ name: 'Area 2', value: '1000+ Unlocks: 👻 Spoop City' },
            );

        message.channel.send(exampleEmbed);
    } else if (command === 'help') {
        return message.channel.send(
            `Commands: !quest/!q | !shop | !buy | !inventory/!i | !profile/!p | !give User Amount | !leaderboard/!lb`);
    } else if (command === 'profile' || command === 'p') {
        const target = message.mentions.users.first() || message.author;
        var avatar = target.displayAvatarURL({ format: "png", dynamic: true });
        var money = `${currency.getBalance(target.id)}`;

        var ss = currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.cache.has(user.user_id))
            .first(100)
            .map((user, position) => `${position + 1} ${(client.users.cache.get(user.user_id).tag)}`);

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .setTitle('Noob')
            .addFields(
                { name: 'PROGRESS', value: 'Level: 1 (0.00%)\nXP: 0 (0.00%)\nArea: Starting' },
                { name: 'STATS', value: ':dagger: ATK: 1\n:shield: DEF: 1\n:heart: LIFE: 10/10' },
                {
                    name: 'EQUIPMENT',
                    value: '<:orb:684419011760750623> Orb [Regular]\n:shield: Armor [Regular]',
                    inline: true
                },
                { name: 'MONEY', value: `<:oldgaycoin:259774901454503936> ${money}`, inline: true },
            )
            .setAuthor(`${target.username}`, avatar, '')
            .setThumbnail(avatar)
            // .setImage('https://media1.tenor.com/images/0390f1b0853b4957c8d8ccf88ae2b65f/tenor.gif')
            .setTimestamp()
            .setFooter(`Current Leader: ${ss[0].slice(2, 9)}`,
                'https://mir-s3-cdn-cf.behance.net/project_modules/disp/ea701046715833.588f83572fcfe.gif');

        message.channel.send(exampleEmbed);
    } else if (command === 'leaderboard' || command === 'lb') {
        return message.channel.send(
            currency.sort((a, b) => b.balance - a.balance)
            .filter(user => client.users.cache.has(user.user_id))
            .first(10)
            .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}`)
            .join('\n'),
            { code: true }
        );
    }
});

client.login(config.token);
