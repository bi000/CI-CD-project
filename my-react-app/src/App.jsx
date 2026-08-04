import { useCallback, useEffect, useState } from 'react';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDailySummary,
  getOverallSummary,
} from './services/api.js';

const today = new Date().toISOString().slice(0, 10);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [view, setView] = useState('today'); // 'today' | 'all'
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [errorBanner, setErrorBanner] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorBanner('');
    try {
      const params = view === 'today' ? { from: today, to: today } : {};
      const [txnRes, summaryRes] = await Promise.all([
        getTransactions(params),
        view === 'today' ? getDailySummary(today) : getOverallSummary(),
      ]);
      setTransactions(txnRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setErrorBanner(
        err?.response?.data?.error ||
          'Could not reach the server. Make sure the backend is running and MySQL is connected.'
      );
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, formData);
      setEditingTransaction(null);
    } else {
      await createTransaction(formData);
    }
    await loadData();
  };

  const handleEdit = (t) => {
    setEditingTransaction(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setErrorBanner(err?.response?.data?.error || 'Failed to delete entry.');
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">Daily Finance Tracker</p>
            <h1 className="font-display text-3xl mt-1">Ledger</h1>
          </div>
          <div className="font-mono text-xs text-ink/40 text-right">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {errorBanner && (
          <div className="border border-expense/40 bg-expense/5 text-expense text-sm px-4 py-3 rounded-sm">
            {errorBanner}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('today')}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium border transition ${
              view === 'today' ? 'bg-ink text-paper border-ink' : 'border-line text-ink/60 hover:border-ink/40'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium border transition ${
              view === 'all' ? 'bg-ink text-paper border-ink' : 'border-line text-ink/60 hover:border-ink/40'
            }`}
          >
            All time
          </button>
        </div>

        <SummaryCards summary={summary} label={view === 'today' ? 'today' : 'all time'} />

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          <TransactionForm
            editingTransaction={editingTransaction}
            onSubmit={handleCreateOrUpdate}
            onCancelEdit={() => setEditingTransaction(null)}
          />
          <TransactionList
            transactions={transactions}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
