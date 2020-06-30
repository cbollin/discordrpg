module.exports = {
	name: 'profile',
	description: 'profile',
	execute(message, args) {
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
                { name: 'STATS', value: `:dagger: ATK: \n:shield: DEF: 1\n:heart: LIFE: 10/10` },
                { name: 'EQUIPMENT', value: '<:orb:684419011760750623> Orb [Regular]\n:shield: Armor [Regular]', inline: true },
                { name: 'MONEY', value: `<:oldgaycoin:259774901454503936> ${money}`, inline: true },
            )
            .setAuthor(`${target.username}`, avatar, '')
            .setThumbnail(avatar)
            // .setImage('https://media1.tenor.com/images/0390f1b0853b4957c8d8ccf88ae2b65f/tenor.gif')
            .setTimestamp()
            .setFooter(`Current Leader: ${ss[0].slice(2,9)}`, 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/ea701046715833.588f83572fcfe.gif');
    
            message.channel.send(exampleEmbed);	},
};
