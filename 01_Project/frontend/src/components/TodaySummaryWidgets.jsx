import React, { useState, useEffect } from 'react';
import { IndianRupee, ShoppingBag, Star, Clock } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0, fontWeight: '500' }}>{label}</p>
      <p style={{ fontSize: '1.4rem', fontWeight: '700', margin: '2px 0 0', color: '#111827', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: '3px 0 0' }}>{sub}</p>}
    </div>
  </div>
);

const TodaySummaryWidgets = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const go = async () => {
      try { const r = await api.get('/forecasting/dashboard/today'); setData(r.data); } catch (e) {}
    };
    go();
    const id = setInterval(go, 60000);
    return () => clearInterval(id);
  }, []);

  const revenue = data?.total_revenue ?? 0;
  const transactions = data?.transaction_count ?? 0;
  const topProduct = data?.top_product_today ?? '--';
  const pendingPOs = data?.pending_purchase_orders ?? 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <StatCard icon={<IndianRupee size={22} />} label="Today Revenue"
        value={'Rs.' + revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        sub="From POS sales today" color="#10B981" />
      <StatCard icon={<ShoppingBag size={22} />} label="Transactions Today"
        value={transactions} sub={transactions === 1 ? 'bill today' : 'bills today'} color="#3B82F6" />
      <StatCard icon={<Star size={22} />} label="Top Seller Today"
        value={topProduct !== '--' ? topProduct.split(' ').slice(0, 2).join(' ') : '--'}
        sub={topProduct !== '--' ? topProduct : 'No sales yet'} color="#F59E0B" />
      <StatCard icon={<Clock size={22} />} label="Pending POs"
        value={pendingPOs} sub={pendingPOs === 0 ? 'All fulfilled' : 'awaiting delivery'}
        color={pendingPOs > 0 ? '#EF4444' : '#10B981'} />
    </div>
  );
};

export default TodaySummaryWidgets;
