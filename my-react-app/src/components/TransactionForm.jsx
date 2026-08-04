import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  type: 'expense',
  category: '',
  description: '',
  amount: '',
  txn_date: new Date().toISOString().slice(0, 10),
};

export default function TransactionForm({ editingTransaction, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        category: editingTransaction.category,
        description: editingTransaction.description || '',
        amount: String(editingTransaction.amount),
        txn_date: editingTransaction.txn_date?.slice(0, 10) || EMPTY_FORM.txn_date,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors([]);
  }, [editingTransaction]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const errs = [];
    if (!form.category.trim()) errs.push('Category is required.');
    if (!form.amount || Number(form.amount) <= 0) errs.push('Amount must be a positive number.');
    if (!form.txn_date) errs.push('Date is required.');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
      setForm(EMPTY_FORM);
      setErrors([]);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors || [err?.response?.data?.error || 'Failed to save transaction.'];
      setErrors(apiErrors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-sm p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-xl">
          {editingTransaction ? 'Edit entry' : 'New entry'}
        </h2>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="font-mono text-xs uppercase tracking-wider text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mb-4 border border-expense/40 bg-expense/5 text-expense text-sm px-3 py-2 rounded-sm">
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, type: 'income' }))}
          className={`py-2 rounded-sm text-sm font-medium border transition ${
            form.type === 'income'
              ? 'bg-income text-white border-income'
              : 'border-line text-ink/60 hover:border-income/50'
          }`}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, type: 'expense' }))}
          className={`py-2 rounded-sm text-sm font-medium border transition ${
            form.type === 'expense'
              ? 'bg-expense text-white border-expense'
              : 'border-line text-ink/60 hover:border-expense/50'
          }`}
        >
          Expense
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-1">
            Category
          </label>
          <input
            type="text"
            value={form.category}
            onChange={handleChange('category')}
            placeholder="e.g. Food, Salary, Transport"
            className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Short note"
            className="w-full border border-line rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={handleChange('amount')}
              placeholder="0.00"
              className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ink/50 mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.txn_date}
              onChange={handleChange('txn_date')}
              className="w-full border border-line rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 w-full bg-ink text-paper py-2.5 rounded-sm text-sm font-medium tracking-wide hover:bg-ink/90 disabled:opacity-50 transition"
      >
        {saving ? 'Saving…' : editingTransaction ? 'Update entry' : 'Add entry'}
      </button>
    </form>
  );
}
