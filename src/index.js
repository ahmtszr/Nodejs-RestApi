// Modules import
const {Sequelize, DataTypes} = require('sequelize')
const UserModel = require('./models/userModel')
const ProductModel = require('./models/productModel')
const TokenModel = require('./models/blackListedToken')

// postgres veri tabanı bağlantımızı yapalım
const sequelize = new Sequelize(`${process.env.DB_DATABASE}`, `${process.env.DB_USER}`, `${process.env.DB_PASSWORD}`, {
    host: process.env.DB_HOST,
    port: 5432,
    dialect:"postgres"
})

// We are check database connection
try {
    sequelize.authenticate();
    console.log('Database connection successfully!');
} catch (error) {
    console.error('Error occurred database connection!')
}


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


// Models connection...
db.users = UserModel(sequelize, DataTypes)
db.products = ProductModel(sequelize, DataTypes)
db.token = TokenModel(sequelize, DataTypes)

// Module export
module.exports = db