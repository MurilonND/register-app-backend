-- Dump do banco de dados para o projeto

-- Banco de dados
CREATE DATABASE IF NOT EXISTS estoque_db;
USE estoque_db;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    history JSON
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Dados iniciais para a tabela de usuários
INSERT INTO users (name, email, password)
VALUES 
('Admin', 'admin@example.com', '$2b$10$KixPQiWrQJeLBz8GYeF2keScwQ70RFLFJAFoJIoTI1Qa8tD/zyhkW'); -- Senha: admin123

-- Dados iniciais para a tabela de produtos
INSERT INTO products (name, quantity, history)
VALUES 
('Produto A', 100, '[{"type": "entrada", "quantity": 50, "date": "2025-01-01"}, {"type": "saida", "quantity": 20, "date": "2025-01-05"}]'),
('Produto B', 50, '[{"type": "entrada", "quantity": 30, "date": "2025-01-02"}]'),
('Produto C', 200, '[{"type": "entrada", "quantity": 200, "date": "2025-01-03"}]');
