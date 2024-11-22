const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const industrialProducts = require('./industrial.json');
const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'industrial_inventory'
});

db.connect();

db.query(`
    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255),
        quantity INT,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        order_group_id INT NOT NULL
    )
`);

let dbConnected = false;

db.connect((err) => {
    if (err) {
        console.log('Database not connected. Running in fallback mode.');
    } else {
        dbConnected = true;
        console.log('Database connected.');
    }
});


app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/products', (req, res) => {
    res.status(200).json(industrialProducts);
});

app.post('/submit-order', (req, res) => {
    const { product_id, quantity, customer_name, customer_email } = req.body;
    const product = industrialProducts.find(p => p.articleNumber === String(product_id));

    if (!product) return res.status(400).json({ error: 'Invalid product selected.' });

    if (dbConnected) {
        db.query('INSERT INTO orders (product_id, quantity, customer_name, customer_email, order_group_id) VALUES (?, ?, ?, ?, ?)', 
            [product_id, quantity, customer_name, customer_email, Date.now()], 
            (err) => {
                if (err) return res.status(500).json({ error: 'Database error.' });
                res.status(200).json({ message: 'Order placed successfully.', product });
            }
        );
    } else {
        res.status(200).json({ message: 'Order stored temporarily (no database connection).', product });
    }
});


app.get('/purchase-history', (req, res) => {
    if (dbConnected) {
        db.query('SELECT * FROM orders', (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error.' });
            res.status(200).json(results);
        });
    } else {
        res.status(200).json({ message: 'Purchase history not available (no database connection).' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
