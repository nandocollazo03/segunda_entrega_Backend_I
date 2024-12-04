const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const exphbs = require('express-handlebars');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 8080;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.emit('updateProducts', getProducts());

    socket.on('newProduct', (product) => {
        const products = getProducts();
        const id = products.length ? products[products.length - 1].id + 1 : 1;
        const newProduct = { id, ...product };
        products.push(newProduct);
        saveProducts(products);
        io.emit('updateProducts', products);
    });

    socket.on('deleteProduct', (productId) => {
        let products = getProducts();
        products = products.filter(p => p.id !== productId);
        saveProducts(products);
        io.emit('updateProducts', products);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

httpServer.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto: ${PORT}`);
});

const fs = require('fs');
const productsFilePath = './data/products.json';
const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const saveProducts = (products) => fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));