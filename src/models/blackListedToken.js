//token black list
module.exports = (sequelize, DataTypes) => {
    const BlacklistToken = sequelize.define('blacklist_token', {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {timestamps: true});
    return BlacklistToken;
}