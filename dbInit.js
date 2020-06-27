// Execute node dbInit.js to create the database tables. 
// Unless you make a change to the models, you'll never need to touch the file again. 
// If you do make a change to a model, you can execute node dbInit.js --force or node dbInit.js -f to force sync your tables. 
// It's important to note that this will empty out and remake your model tables.

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const CurrencyShop = sequelize.import('models/CurrencyShop');
sequelize.import('models/Users');
sequelize.import('models/UserItems');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: 'Chip', cost: 1 }),
		CurrencyShop.upsert({ name: 'Scoop', cost: 2 }),
		CurrencyShop.upsert({ name: 'Gamer Fuel', cost: 5 }),
	];
	await Promise.all(shop);
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);