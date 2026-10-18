import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, AlertTriangle, ShoppingCart } from 'lucide-react';
import api from '../api/axios';

const RecentFeedsPanel = () => {
  const [bills, setBills] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      try {
        const [b, l] = await Promise.all([
          api.get('/forecasting/dashboard/recent-bills'),
          api.get('/products/low-stock'),
        ]);
        setBills(b.data);
        setLowStock(l.data);
      } catch (e) {}
    };
    go();
    const id = setInterval(go, 60000);
    return () => clearInterval(id);
  }, []);

  const fmt = ts => {
    try { return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Receipt size={16} color="#714B67" /> Recent Sales
        </h3>
        {bills.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No recent sales.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {bills.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#F9FAFB', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Bill #{b.id}</span>
                  <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>{b.item_count} item{b.item_count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#10B981' }}>Rs.{b.total_amount.toFixed(2)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{fmt(b.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={16} color="#EF4444" /> Low Stock Alerts
        </h3>
        {lowStock.length === 0 ? (
          <p style={{ color: '#10B981', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0', fontWeight: '500' }}>All stock levels healthy</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#FEF2F2', borderRadius: '6px', border: '1px solid #FECACA', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{p.name}</div>
                  <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: '500' }}>Stock: {p.quantity_in_stock} / Reorder at: {p.reorder_level}</div>
                </div>
                <button
                  onClick={() => navigate('/po', { state: { targetProduct: p.name } })}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '3px 8px', fontSize: '11px', fontWeight: '600', background: '#714B67', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <ShoppingCart size={11} /> Create PO
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentFeedsPanel;
