// nodemon index.js - Start Bot
const { prefix, token } = require('./config.json');

const Discord = require('discord.js');
const Sequelize = require('sequelize');

const client = new Discord.Client();

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

client.once('ready', () => {
	/*
	 * equivalent to: CREATE TABLE tags(
	 * name VARCHAR(255),
	 * description TEXT,
	 * username VARCHAR(255),
	 * usage INT
	 * );
	 */
    // to clear all for testing Tags.sync({ force: true })
	Tags.sync();
});


client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (message.content === 'ping') {
        message.reply('pong');
    }

    if (message.content === `${prefix}ping`) {
        message.channel.send('Pong.');
    } else if (message.content === `${prefix}server`) {
        message.channel.send(`Server name: ${message.guild.name}\nTotal morons: ${message.guild.memberCount}\nSuffering Online Since : ${message.guild.createdAt}`);
    } else if (message.content === `${prefix}user`) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    } else if (message.content === 'https://www.youtube.com/watch?v=pW_jsS_JnMY&t=182s') {
        message.channel.send('gg');
    } else if (command === 'args-info') {
        if (!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }
        else if (args[0] === 'foo') {
            return message.channel.send('bar');
        }
        message.channel.send(`First argument: ${args[0]}`);
    } else if (command === 'kick') {
        // grab the "first" mentioned user from the message
        // this will return a `User` object, just like `message.author`
        const taggedUser = message.mentions.users.first();

        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to kick them!');
        }
    
        message.channel.send(`You wanted to kick: ${taggedUser.username}`);
    } else if (command === 'avatar') {
        if (!message.mentions.users.size) {
            return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
        }
    
        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
        });
    
        // send the entire array of strings as a message
        // by default, discord.js will `.join()` the array with `\n`
        message.channel.send(avatarList);
    } else if (command === 'profile' || command === 'p'){
        const avatarList = message.mentions.users.map(user => {
            // return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
        let joinedDiscordDate = (user.createdAt)
        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .setTitle('Professionally Online')
            .addFields(
                { name: 'PROGRESS', value: 'Scoops: 1 (50.00%)\nHorny Level: 69 (42.00%)\nZone: Gamer Realm 3' },
                { name: 'STATS', value: 'ARMS: 90\nDEF: 55\nLIFE: 39/140' },
                { name: 'EQUIPMENT', value: '<:orb:684419011760750623> Battle Orb [Regular]\n<:oldgaycoin:259774901454503936> Old Coin Armor [Regular]', inline: true },
                { name: 'MONEY', value: '<:burymewithmymoney:689857949371596802> Money: 2,000', inline: true },
            )
            .setAuthor('Gamer', 'https://i.imgur.com/PIQ1V7j.png', '')
            .setDescription('Freaky Deaky')
            .setThumbnail(avatar)
            .setImage('https://media1.tenor.com/images/0390f1b0853b4957c8d8ccf88ae2b65f/tenor.gif')
            .setTimestamp()
            .setFooter('Chips', 'https://media0.giphy.com/media/nsKCHXMmNb7yM/giphy.gif?cid=ecf05e47d20a459f2dfb1bb0faabafc472df8e0daf3102c7&rid=giphy.gif');

            message.channel.send(exampleEmbed);
        })
    } else if (command === 'prune') {
        const amount = parseInt(args[0]);
    
        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.');
        }
    }

    // Now, you can use the message variable inside
    // if (message.content === "x") { 
    //     var interval = setInterval (function () {
    //         // use the message's channel (TextChannel) to send a new message
    //         message.channel.send("rpg hunt")
    //         .catch(console.error); // add error handling here
    //     }, 2000); 
    // }

 });
 

// add message as a parameter to your callback function
client.on('message', function(message) {

});

client.login(token);