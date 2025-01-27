import express, { Request, Response } from 'express';
import pool from '../database.js';

const router = express.Router();

interface Product {
  id: number;
  name: string;
  quantity: number;
  history: string;
}

// Get product by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product: Product = rows[0];
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new product
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, quantity }: { name: string; quantity: number } = req.body;
  if (!name || quantity === undefined) {
    res.status(400).json({ error: 'Name and quantity are required' });
    return;
  }
  try {
    const [result]: any = await pool.query(
      'INSERT INTO products (name, quantity, history) VALUES (?, ?, ?)',
      [name, quantity, JSON.stringify([])]
    );
    res.json({ id: result.insertId, name, quantity, history: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (name and quantity)
router.put('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, quantity }: { name: string; quantity: number } = req.body;

  if (!name || quantity === undefined) {
    res.status(400).json({ error: 'Name and quantity are required' });
    return;
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product: Product = rows[0];

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await pool.query('UPDATE products SET name = ?, quantity = ? WHERE id = ?', [
      name,
      quantity,
      id,
    ]);

    res.json({ id, name, quantity });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update product quantity (register entry/exit)
router.patch('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, type }: { amount: number; type: 'entry' | 'exit' } = req.body;

  if (!amount || !['entry', 'exit'].includes(type)) {
    res.status(400).json({ error: 'Amount and valid type are required' });
    return;
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product: Product = rows[0];

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const newQuantity =
      type === 'entry' ? product.quantity + amount : product.quantity - amount;

    if (newQuantity < 0) {
      res.status(400).json({ error: 'Quantity cannot be negative' });
      return;
    }

    const history = JSON.parse(product.history || '[]');
    history.push({ type, amount, date: new Date().toISOString() });

    await pool.query(
      'UPDATE products SET quantity = ?, history = ? WHERE id = ?',
      [newQuantity, JSON.stringify(history), id]
    );

    res.json({ id, name: product.name, quantity: newQuantity, history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result]: any = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
