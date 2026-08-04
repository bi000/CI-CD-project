function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionList({ transactions, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="bg-white border border-line rounded-sm p-8 text-center text-ink/40 text-sm">
        Loading entries…
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white border border-line rounded-sm p-8 text-center">
        <p className="font-display text-lg text-ink/60">No entries yet</p>
        <p className="text-sm text-ink/40 mt-1">Add your first income or expense using the form.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60">
            <th className="text-left font-mono text-[11px] uppercase tracking-widest text-ink/50 px-4 py-3">Date</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-widest text-ink/50 px-4 py-3">Category</th>
            <th className="text-left font-mono text-[11px] uppercase tracking-widest text-ink/50 px-4 py-3 hidden sm:table-cell">Note</th>
            <th className="text-right font-mono text-[11px] uppercase tracking-widest text-ink/50 px-4 py-3">Amount</th>
            <th className="text-right font-mono text-[11px] uppercase tracking-widest text-ink/50 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper/40 transition">
              <td className="px-4 py-3 font-mono text-xs text-ink/60 whitespace-nowrap">{formatDate(t.txn_date)}</td>
              <td className="px-4 py-3">
                <span className="font-medium">{t.category}</span>
                <span
                  className={`ml-2 inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                    t.type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                  }`}
                >
                  {t.type}
                </span>
              </td>
              <td className="px-4 py-3 text-ink/50 hidden sm:table-cell truncate max-w-[200px]">
                {t.description || '—'}
              </td>
              <td className={`px-4 py-3 text-right font-mono ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                {t.type === 'income' ? '+' : '−'} {formatCurrency(t.amount)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(t)}
                  className="text-xs font-mono uppercase tracking-wider text-accent hover:underline mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-xs font-mono uppercase tracking-wider text-expense hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
