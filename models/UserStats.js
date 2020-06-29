module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_stat', {
		user_id: {
			type: DataTypes.STRING
		},
		base: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
        },
        current: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
        },
        modified: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};