// Modules import
const bcrypt = require('bcrypt');
const db = require('../index');
const jwt = require("jsonwebtoken");
// We define users to User variable
const User = db.users;
const BlacklistToken = db.token;
const express = require('express')
const app = express()

const signup = async (req, res) => {

    try {
        const {userName, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // We hash the user password
        const data = {
            userName,
            email,
            password: hashedPassword,
        };
        const user = await User.create(data);

        if (user) {
            const token = jwt.sign({id: user.id}, process.env.secretKey, {
                expiresIn: 1 * 24 * 60 * 60 * 1000,
            });
            res.cookie("jwt", token, {maxAge: 1 * 24 * 60 * 60, httpOnly: true});
            const userWithoutPassword = {...user.dataValues, password: password};
            res.status(201).json({user: userWithoutPassword});
        } else {
            return res.status(409).send("Detail are not correct!");
        }
    } catch (error) {
        res.status(500).json({message: 'Error occurred during registration.'});
    }
};

// We keep the identity and session information of the users in this veriable
const activeSessions = {};
// Login authentication
const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Check if users is in database
        const user = await User.findOne({where: {email}});
        if (!user) {
            return res.status(401).json({message: 'Wrong email or password!'});
        }
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Wrong email or password!'});
        }
        // Is there an active login? Checked
        if (activeSessions[user.id]) {
            return res.status(403).json({message: 'You already have an active session. Please log out!'})
        }
        // JWT create
        const token = jwt.sign({id: user.id}, process.env.secretKey, {expiresIn: '1h'});
        // Store session object with user's credential to activate session
        activeSessions[user.id] = {token, userId: user.id};
        res.status(200).json({message: 'Login successfully!', token, userID: user.id});
    } catch (error) {
        res.status(500).json({message: 'Error occurred login.'});
    }
};
const logout = async (req, res) => {

    try {
        const {token} = req.body;

        if (!token) {
            return res.status(400).json({message: 'Token not found!'});
        }
        // Store the token in a structure such as a blacklist or a whitelist
        await BlacklistToken.create({token});

        const userID = getUserIdFromToken(token);
        if (!userID) {
            return res.status(401).json({message: 'Invalid token'});
        }
        delete activeSessions[userID];
        res.status(200).json({message: 'Logout successfully.'});
    } catch (error) {
        res.status(500).json({message: 'Error occurred logout!'});
    }
};
// A helper function to get user id using token
const getUserIdFromToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.secretKey);
        return decodedToken.id;
    } catch (error) {
        return null;
    }
};
module.exports = {signup, login, logout};