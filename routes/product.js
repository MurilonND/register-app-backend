const express = require('express');
const pool = require('../database');
const router = express.Router();

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



module.exports = router;