const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFilePath = './data/carts.json';
const productsFilePath = './data/products.json';

const getCarts = () => JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
const saveCarts = (carts) => fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

// Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = getCarts();
    const id = carts.length ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id, products: [] };
    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

// Listar productos de un carrito por ID
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = getCarts();
    const cart = carts.find(c => c.id === Number(cid));
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ message: 'Carrito no encontrado' });
    }
});

// Agregar producto a un carrito por ID de carrito e ID de producto
router.post('/:cid/products/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = getCarts();
    const cart = carts.find(c => c.id === Number(cid));
    if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const products = getProducts();
    const product = products.find(p => p.id === Number(pid));
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const productInCart = cart.products.find(p => p.product === Number(pid));
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ product: Number(pid), quantity: 1 });
    }

    saveCarts(carts);
    res.json(cart);
});

module.exports = router;