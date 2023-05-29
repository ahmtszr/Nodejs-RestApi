// modülleri içe aktaralım
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

//Veritabanı bağlantısını kontrol edelim.
try {
    sequelize.authenticate();
    console.log('Veritabanına bağlandı');
} catch (error) {
    console.error('Veritabanına bağlanırken hata oluştu!')
}


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


// modele bağlanılıyor
db.users = UserModel(sequelize, DataTypes)
db.products = ProductModel(sequelize, DataTypes)
db.token = TokenModel(sequelize, DataTypes)

// modülü export ediyoruz
module.exports = db