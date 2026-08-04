function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function SummaryCards({ summary, label }) {
  const { totalIncome = 0, totalExpense = 0, balance = 0 } = summary || {};

  const cards = [
    { title: 'Income', value: totalIncome, color: 'text-income', sign: '+' },
    { title: 'Expenditure', value: totalExpense, color: 'text-expense', sign: '−' },
    { title: 'Net Balance', value: balance, color: balance >= 0 ? 'text-income' : 'text-expense', sign: balance >= 0 ? '+' : '−' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white border border-line rounded-sm p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20" style={{ color: card.color.includes('income') ? '#1E7B57' : '#C4432B' }} />
          <p className="font-mono text-[11px] tracking-widest uppercase text-ink/50 mb-2">
            {card.title} {label ? `· ${label}` : ''}
          </p>
          <p className={`font-display text-3xl ${card.color}`}>
            {card.sign} {formatCurrency(Math.abs(card.value)).replace('₹', '₹ ')}
          </p>
        </div>
      ))}
    </div>
  );
}
