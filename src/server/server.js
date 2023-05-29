const express = require('express')
const sequelize = require('sequelize')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const db = require('../index')
const userRoutes = require('../routes/userRoutes')
const productRoutes = require('../routes/productRoutes')


// Port settings
const PORT = process.env.PORT || 8080

// Let's express the application variable
const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// We synchronize the database and force error so we do not lose data
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronize successfully.');
        // Perform any other steps required to launch your app here
    })
    .catch((error) => {
        console.error('An error occurred database synchronize:', error);
    });

app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes);

app.listen(PORT, () => console.log(`Server ${PORT} port is running!`))
