const express = require('express');
const pool = require('../database');
const router = express.Router();

// Get product by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        const product = rows[0];
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    const { name, quantity } = req.body;

    if (!name || quantity === undefined) {
        return res.status(400).json({ error: 'Name and quantity are required' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, quantity, history) VALUES (?, ?, ?)',
            [name, quantity, JSON.stringify([])]
        );
        res.json({ id: result.insertId, name, quantity, history: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product quantity (register entry/exit)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { amount, type } = req.body;
    if (!amount || !['entry', 'exit'].includes(type)) {
        return res.status(400).json({ error: 'Amount and valid type are required' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        const product = rows[0];
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const newQuantity =
            type === 'entry' ? product.quantity + amount : product.quantity - amount;
        if (newQuantity < 0) {
            return res.status(400).json({ error: 'Quantity cannot be negative' });
        }
        const history = JSON.parse(product.history);
        history.push({ type, amount, date: new Date().toISOString() });
        await pool.query(
            'UPDATE products SET quantity = ?, history = ? WHERE id = ?',
            [newQuantity, JSON.stringify(history), id]
        );
        res.json({ id, name: product.name, quantity: newQuantity, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;