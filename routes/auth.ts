import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database.js';

const router = express.Router();

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Register a new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password }: { name: string; email: string; password: string } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// Login a user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user: User = rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
