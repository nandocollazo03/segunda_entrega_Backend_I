const express = require('express');
const fs = require('fs');
const router = express.Router();

const productsFilePath = './data/products.json';

const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const saveProducts = (products) => fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

// Listar todos los productos
router.get('/', (req, res) => {
    const limit = req.query.limit;
    let products = getProducts();
    if (limit) {
        products = products.slice(0, limit);
    }
    res.json(products);
});

// Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = getProducts();
    const product = products.find(p => p.id === Number(pid));
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ message: 'Todos los campos son requeridos excepto thumbnails' });
    }

    const products = getProducts();
    const id = products.length ? products[products.length - 1].id + 1 : 1;
    const newProduct = { id, title, description, code, price, status, stock, category, thumbnails };
    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

// Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const updatedData = req.body;
    delete updatedData.id;

    const products = getProducts();
    const index = products.findIndex(p => p.id === Number(pid));
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedData };
        saveProducts(products);
        res.json(products[index]);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    let products = getProducts();
    const index = products.findIndex(p => p.id === Number(pid));
    if (index !== -1) {
        products = products.filter(p => p.id !== Number(pid));
        saveProducts(products);
        res.json({ message: 'Producto borrado' });
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

module.exports = router;