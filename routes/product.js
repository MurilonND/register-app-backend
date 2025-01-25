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

module.exports = router;