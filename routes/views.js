const express = require('express');
const router = express.Router();
const fs = require('fs');

const productsFilePath = './data/products.json';
const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

router.get('/', (req, res) => {
    const products = getProducts();
    res.render('home', { products });
});

router.get('/realtimeproducts', (req, res) => {
    const products = getProducts();
    res.render('realTimeProducts', { products });
});

module.exports = router;