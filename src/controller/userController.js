// Modülleri import ediyoruz
const bcrypt = require('bcrypt');
const db = require('../index');
const jwt = require("jsonwebtoken");

// Kullanıcılarını User değişkenine tanımlıyoruz
const User = db.users;
const BlacklistToken = db.token;

// Kullanıcı şifresini hash liyoruz
const signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            userName,
            email,
            password: hashedPassword,
        };
        const user = await User.create(data);
        if (user) {
            const token = jwt.sign({ id: user.id }, process.env.secretKey, {
                expiresIn: 1 * 24 * 60 * 60 * 1000,
            });

            res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly:true });

            const userWithoutPassword = { ...user.dataValues, password: password };

            res.status(201).json({ user: userWithoutPassword });
        } else {
            return res.status(409).send("Detaylar doğru değil!");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kayıt sırasında hata oluştu.' });
    }
};


// Kullanıcıların kimlik ve oturum bilgilerini bu değişkende tutuyoruz.
const activeSessions = {};

// Giriş kimliği doğrulaması
const login = async (req, res) => {


    const { email, password } = req.body;

    try {
        // Kullanıcının veritabanında olup olmadığını kontrol edin
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Hatalı e-posta adresi veya şifre.' });
        }

        // Şifre kontrolü yapın
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Hatalı e-posta adresi veya şifre.' });
        }

        // Aktif oturum mevcut mu? kontrol edelim
        if (activeSessions[user.id]) {
            return res.status(403).json({ message: 'Zaten aktif bir oturumunuz var. Lütfen çıkış yapınız!'})
        }

        // JWT oluşturun
        const token = jwt.sign({ id: user.id }, process.env.secretKey, { expiresIn: '1h' });

        // Oturumu aktif etmek için kullanıcının kimlik bilgisi ile birlikte oturum nesnesini sakla
        activeSessions[user.id] = { token, userId: user.id};

        res.status(200).json({ message:'Giriş başarılı!', token , userID: user.id});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Giriş yapılırken hata oluştu.' });
    }
};


const logout = async (req, res) => {

    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({message: 'Token eksik'});
        }

        // Tokeni kara liste (blacklist) veya geçerli tokenler listesi (whitelist) gibi bir yapıda saklayın
        await BlacklistToken.create({ token });

        const userID = getUserIdFromToken(token);
        if (!userID) {
            return res.status(401).json({ message: 'Geçersiz token'});
        }

        delete activeSessions[userID];

        res.status(200).json({ message: 'Çıkış yapıldı.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Çıkış yapılırken hata oluştu.' });
    }
};

// Tokeni kullanarak kullanıcı kimliğini almak için yardımcı bir fonksiyon
const getUserIdFromToken = (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.secretKey);
        return decodedToken.id;
    } catch (error) {
        return null;
    }
};


module.exports = {
    signup,
    login,
    logout
};