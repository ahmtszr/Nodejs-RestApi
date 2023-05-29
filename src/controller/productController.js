const db = require('../index');

const Product = db.products
const User = db.users

const { authenticateToken } = require('../middleware/auth')
const {verify} = require("jsonwebtoken");

const createProduct = async (req, res) => {

    await authenticateToken(req, res, async () => {

        try {
            const {name, quantity, price, image} = req.body;

            // We get the user id from the user model
            const user = await User.findByPk(req.user.id); //Using the findByPk function we get the user's id directly from 'req.user'.
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
        res.status(500).json({message: 'An error occurred while creating the product!'});

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
        res.status(500).json({ message: 'An error occurred while listing the products.' });
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
                res.status(404).json({message: 'You are not authorized to view this product information!'});
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'An error occurred while listing the product.'});

        }
    })
};




// Update a product
const updateProduct = async (req, res) => {
    await authenticateToken(req, res, async () => {
        try {
            const product = req.body;

            if (!product.id) {
                return res.status(400).send('Product id is required!');
            }

            // We get the user id from the user model
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
                return res.status(404).send('Product not found or you do not have permission to update!');
            }

            res.send('Update successfully!');
        } catch (err) {
            console.log(err);
            res.status(500).send('An error occurred while updating the product');
        }
    });
};




// Delete a product
const deleteProduct = async (req, res) => {
    await authenticateToken(req, res, async () => {

        try {
            const { userName } = req.user; // User's credential (userName)
            const productId = req.params.id; // The id of the product to be deleted

            // Get userId to check if user has access to your product
            const user = await User.findOne({ where: { userName } });
            const userId = user.id;

            // Ürünü bul ve sil
            const product = await Product.findOne({ where: { id: productId, userId } });

            if (!product) {
                return res.status(404).json({ error: 'You do not have access to delete this product!' });
            }

            await product.destroy();

            res.json({ message: 'Product deleted successfully!' });
        } catch (error) {
            console.error('An error occurred deleting product:', error);
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




