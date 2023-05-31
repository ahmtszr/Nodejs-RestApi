const jwt = require('jsonwebtoken');
const db = require('../index');
const User = db.users;
const Token = db.token;
const authenticateToken = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({message: 'Token not found!'});
    }
    const decodedToken = jwt.verify(token, process.env.secretKey);
    const user = await User.findOne({where: {id: decodedToken.id}});

    if (!user) {
        return res.status(401).json({message: 'Invalid token!'});
    }

    const isValidToken = await isTokenValid(token);

    if (!isValidToken) {
        return res.status(401).json({message: 'Invalid token! Please activate your session.'});
    }
    req.user = user;
    next();

};
const isTokenValid = async (token) => {
    const blacklistedToken = await Token.findOne({where: {token}});
    return !blacklistedToken;
}
module.exports = {authenticateToken};