const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CART = [];
const TAX_RATE = 0.125;
const PRICE_API_BASE_URL = 'http://localhost:3001/products';

async function getProductPrice(productName) {
    try {
        const response = await axios.get(`${PRICE_API_BASE_URL}/${productName}`);
        return response.data.price;
    } catch (error) {
        throw new Error(`Error retrieving price for ${productName}`);
    }
}

app.post('/cart/add', async (req, res) => {
    const { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product or quantity' });
    }
    
    try {
        const price = await getProductPrice(product);
        CART.push({ product, quantity, price });
        res.json({ message: `${quantity} x ${product} added to cart` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/cart', (req, res) => {
    let subtotal = CART.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let tax = Math.ceil(subtotal * TAX_RATE * 100) / 100;
    let total = subtotal + tax;
    
    res.json({ cart: CART, subtotal, tax, total });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Shopping cart service running on port ${PORT}`));

module.exports = app;
