const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');

// Summary routes (kept above /:id so "summary" is never treated as an id)
router.get('/summary/daily', controller.getDailySummary);
router.get('/summary/by-day', controller.getSummaryByDay);
router.get('/summary', controller.getSummary);
router.get('/health', (req, res) => {res.status(200).send('OK');});
// CRUD routes
router.get('/', controller.getTransactions);
router.get('/:id', controller.getTransactionById);
router.post('/', controller.createTransaction);
router.put('/:id', controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

module.exports = router;
