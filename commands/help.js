module.exports = {
	name: 'help',
	description: 'help',
	execute(message, args) {
		message.channel.send(`Commands: !shop | !buy | !inventory | !profile | !give User Amount | !leaderboard`);
	},
};