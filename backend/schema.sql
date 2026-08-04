-- Run this once to create the database and table:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  amount DECIMAL(12, 2) NOT NULL,
  txn_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Helpful index for date-range and daily summary queries
CREATE INDEX idx_transactions_txn_date ON transactions (txn_date);

-- A few sample rows (optional, safe to delete)
INSERT INTO transactions (type, category, description, amount, txn_date) VALUES
  ('income', 'Salary', 'Monthly salary', 50000.00, CURDATE()),
  ('expense', 'Food', 'Lunch with friends', 450.00, CURDATE()),
  ('expense', 'Transport', 'Bus fare', 60.00, CURDATE());
