const express = require('express')
const sequelize = require('sequelize')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const db = require('../index')
const userRoutes = require('../routes/userRoutes')
const productRoutes = require('../routes/productRoutes')


// port ayarları
const PORT = process.env.PORT || 8080

// app değişkenini ifadeye alalım
const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Veritabanını senkronize ediyoruz ve hata yapmaya zorluyoruz böylece veri kaybetmeyiz
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Veritabanı senkronize edildi.');
        // Uygulamanızı başlatmak için gerekli diğer adımları burada gerçekleştirin
    })
    .catch((error) => {
        console.error('Veritabanı senkronize edilirken bir hata oluştu:', error);
    });

app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes);

app.listen(PORT, () => console.log(`Server ${PORT}'u üzerinde çalışıyor!`))
