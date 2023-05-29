const db = require('../index');

const Product = db.products
const User = db.users

const { authenticateToken } = require('../middleware/auth')
const {verify} = require("jsonwebtoken");

const createProduct = async (req, res) => {

    await authenticateToken(req, res, async () => {

        try {
            const {name, quantity, price, image} = req.body;

            // Kullanıcı id'sini user modelinden alıyoruz
            const user = await User.findByPk(req.user.id); //findByPk fonksiyonunu kullanarak kullanıcının id'sini 'req.user' üzerinden doğrudan alıyoru.
            const userId = user.id;

            const product = await Product.create({
                name,
                quantity,
                price,
                image,
                userId
            });
            res.status(201).json(product);
            console.log(req.session)

        } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Ürün oluştururken bir hata oluştu!'});

        }

    })
};


// Fetch all products
const getAllProducts = async (req, res) => {

    await authenticateToken(req, res, async () => {

    try {
            const products = await Product.findAll();
            res.status(200).json({ products });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürünleri listelerken hata oluştu.' });
    }

    })
}


// Fetch a product from id
const getProductById = async (req, res) => {

    await authenticateToken(req, res, async () => {

        try {
            const {token} = req.body;

            const decodedToken = verify(token, process.env.secretKey);

            const productId = req.params.id;

            const product = await Product.findOne({where: {id: productId, userId: decodedToken.id}});

            if (product) {
                res.status(200).json({product});
            } else {
                res.status(404).json({message: 'Size ait ürün bulunamadı!'});
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Ürünleri listelerken hata oluştu.'});

        }
    })
};




// Update a product
const updateProduct = async (req, res) => {
    await authenticateToken(req, res, async () => {
        try {
            const product = req.body;

            if (!product.id) {
                return res.status(400).send('Ürün kimliği gerekli!');
            }

            // Kullanıcı id'sini user modelinden alıyoruz
            const user = await User.findByPk(req.user.id);
            const userId = user.id;

            const [rowsUpdated] = await Product.update(
                {
                    name: product.name,
                    quantity: product.quantity,
                    price: product.price,
                    image: product.image,
                    userId: userId,
                },
                {
                    where: {
                        id: product.id,
                        userId: userId,
                    },
                }
            );

            if (rowsUpdated === 0) {
                return res.status(404).send('Ürün bulunamadı veya güncelleme izniniz yok');
            }

            res.send('Güncelleme başarılı');
        } catch (err) {
            console.log(err);
            res.status(500).send('Ürün güncellenirken bir hata oluştu');
        }
    });
};




// Delete a product
const deleteProduct = async (req, res) => {
    await authenticateToken(req, res, async () => {

        try {
            const { userName } = req.user; // Kullanıcının kimlik bilgisi (userName)
            const productId = req.params.id; // Silinecek ürünün id'si

            // Kullanıcının ürününe erişimi olduğunu kontrol etmek için userId'yi al
            const user = await User.findOne({ where: { userName } });
            const userId = user.id;

            // Ürünü bul ve sil
            const product = await Product.findOne({ where: { id: productId, userId } });

            if (!product) {
                return res.status(404).json({ error: 'Bu ürünü silmek için erişim yetkiniz bulunmamaktadır!' });
            }

            await product.destroy();

            res.json({ message: 'Ürün başarıyla silindi!' });
        } catch (error) {
            console.error('Ürün silinirken bir hata oluştu:', error);
            res.status(500).json({ error: 'Error!' });
        }
    })

};


module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
}




