import express from 'express';
import bodyParser from 'body-parser';
import pool from './database.js';
import productRoutes from './routes/product.js';
import authRoutes from './routes/auth.js';

const app = express();
app.use(bodyParser.json());

(async () => {
  const connection = await pool.getConnection();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      history JSON
    );
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `);
  connection.release();
})();

app.use('/products', productRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
