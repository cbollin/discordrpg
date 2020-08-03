// Execute node dbInit.js to create the database tables. 
// Unless you make a change to the models, you'll never need to touch the file again. 
// If you do make a change to a model, you can execute node dbInit.js --force or node dbInit.js -f to force sync your tables. 
// It's important to note that this will empty out and remake your model tables.

const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: "database.sqlite"
});

const CurrencyShop = sequelize.import("models/CurrencyShop");
sequelize.import("models/Users");
sequelize.import("models/UserItems");
sequelize.import("models/UserStats");

const force = process.argv.includes("--force") || process.argv.includes("-f");


// User.sync() - This creates the table if it doesn't exist (and does nothing if it already exists)
// User.sync({ force: true }) - This creates the table, dropping it first if it already existed
// User.sync({ alter: true }) - This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
sequelize.sync().then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: "Chip", cost: 1 }),
		CurrencyShop.upsert({ name: "Scoop", cost: 2 }),
		CurrencyShop.upsert({ name: "Gamer Fuel", cost: 5 }),
		CurrencyShop.upsert({ name: "Pancho's Burrito", cost: 5 }),
		CurrencyShop.upsert({ name: "Video Card", cost: 500 }),
		CurrencyShop.upsert({ name: "DX Racer Gaming Chair", cost: 1000 })
	];
	await Promise.all(shop);
	sequelize.close();
}).catch(console.error);

// use force for testing
 //sequelize.sync({ force: true, match: UserStats});
