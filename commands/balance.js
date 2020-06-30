module.exports = {
	name: 'balance',
	description: 'balance',
	execute(message, args) {
        const Discord = require('discord.js');
        const currency = new Discord.Collection();

        Reflect.defineProperty(currency, 'getBalance', {
            value: function getBalance(id) {
                const user = currency.get(id);
                return user ? user.balance : 0;
            },
        });
        console.log(storedBalances.currency)
        const target = message.mentions.users.first() || message.author;
        const money =  currency.getBalance(message.author.id);

		message.channel.send(`${target.tag} has ${money} 💰`);
	},
};

