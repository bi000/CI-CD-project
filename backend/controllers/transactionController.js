const { pool } = require('../config/db');

const VALID_TYPES = ['income', 'expense'];

function validateTransactionInput(body, { partial = false } = {}) {
  const errors = [];
  const { type, category, amount, txn_date } = body;

  if (!partial || type !== undefined) {
    if (!VALID_TYPES.includes(type)) errors.push("type must be 'income' or 'expense'");
  }
  if (!partial || category !== undefined) {
    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.push('category is required');
    }
  }
  if (!partial || amount !== undefined) {
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.push('amount must be a positive number');
    }
  }
  if (!partial || txn_date !== undefined) {
    if (!txn_date || isNaN(Date.parse(txn_date))) {
      errors.push('txn_date must be a valid date (YYYY-MM-DD)');
    }
  }
  return errors;
}

// GET /api/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&type=income|expense
exports.getTransactions = async (req, res) => {
  try {
    const { from, to, type } = req.query;
    const clauses = [];
    const params = [];

    if (from) {
      clauses.push('txn_date >= ?');
      params.push(from);
    }
    if (to) {
      clauses.push('txn_date <= ?');
      params.push(to);
    }
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: "type must be 'income' or 'expense'" });
      }
      clauses.push('type = ?');
      params.push(type);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM transactions ${where} ORDER BY txn_date DESC, id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// GET /api/transactions/:id
exports.getTransactionById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const errors = validateTransactionInput(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { type, category, description = '', amount, txn_date } = req.body;
    const [result] = await pool.query(
      `INSERT INTO transactions (type, category, description, amount, txn_date)
       VALUES (?, ?, ?, ?, ?)`,
      [type, category.trim(), description.trim(), amount, txn_date]
    );
    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// PUT /api/transactions/:id  (full or partial update)
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ error: 'Transaction not found' });

    const errors = validateTransactionInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const existing = existingRows[0];
    const updated = {
      type: req.body.type ?? existing.type,
      category: (req.body.category ?? existing.category).trim(),
      description: (req.body.description ?? existing.description ?? '').trim(),
      amount: req.body.amount ?? existing.amount,
      txn_date: req.body.txn_date ?? existing.txn_date,
    };

    await pool.query(
      `UPDATE transactions SET type = ?, category = ?, description = ?, amount = ?, txn_date = ?
       WHERE id = ?`,
      [updated.type, updated.category, updated.description, updated.amount, updated.txn_date, id]
    );

    const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// GET /api/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
// Overall totals (optionally scoped to a date range)
exports.getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clauses = [];
    const params = [];
    if (from) { clauses.push('txn_date >= ?'); params.push(from); }
    if (to) { clauses.push('txn_date <= ?'); params.push(to); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions ${where}`,
      params
    );

    const totalIncome = Number(rows[0].totalIncome);
    const totalExpense = Number(rows[0].totalExpense);
    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// GET /api/summary/daily?date=YYYY-MM-DD (defaults to today)
exports.getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions WHERE txn_date = ?`,
      [date]
    );
    const totalIncome = Number(rows[0].totalIncome);
    const totalExpense = Number(rows[0].totalExpense);
    res.json({ date, totalIncome, totalExpense, balance: totalIncome - totalExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
};

// GET /api/summary/by-day?from=YYYY-MM-DD&to=YYYY-MM-DD
// Totals grouped per day, useful for charts/history views
exports.getSummaryByDay = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clauses = [];
    const params = [];
    if (from) { clauses.push('txn_date >= ?'); params.push(from); }
    if (to) { clauses.push('txn_date <= ?'); params.push(to); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
         txn_date AS date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions ${where}
       GROUP BY txn_date
       ORDER BY txn_date DESC`,
      params
    );

    const data = rows.map(r => ({
      date: r.date,
      totalIncome: Number(r.totalIncome),
      totalExpense: Number(r.totalExpense),
      balance: Number(r.totalIncome) - Number(r.totalExpense),
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch daily breakdown' });
  }
};
