import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown } from 'lucide-react';
import api from '../api/axios';

const AccuracyTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maturity, setMaturity] = useState(null);

  useEffect(() => {
    const go = async () => {
      try {
        const [h, m] = await Promise.all([
          api.get('/forecasting/accuracy-history?days=60'),
          api.get('/forecasting/system-status'),
        ]);
        setData(h.data);
        setMaturity(m.data);
      } catch (e) {}
      finally { setLoading(false); }
    };
    go();
  }, []);

  if (loading) return null;

  if (data.length === 0) {
    return (
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingDown size={18} color="#714B67" /> Model Accuracy Trend
        </h2>
        <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
          No accuracy data yet. Click <strong>Self-Train ML Models</strong> to begin.
        </p>
      </div>
    );
  }

  const chartData = data.map(d => ({ ...d, dateLabel: d.date.slice(5) }));
  const threshold = maturity?.maturity_threshold;
  const isMature = maturity?.is_mature;

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingDown size={18} color="#714B67" /> Model Accuracy Trend (Daily MAE)
        </h2>
        {isMature ? (
          <span style={{ background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
            Prediction System Ready
          </span>
        ) : maturity?.days_with_data > 0 ? (
          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
            Maturing ({maturity.days_with_data} data points)
          </span>
        ) : null}
      </div>
      <div style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="maeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#714B67" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#714B67" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={val => [val.toFixed(2), 'Avg MAE']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            {threshold && <ReferenceLine y={threshold} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Target', fill: '#10B981', fontSize: 11 }} />}
            <Area type="monotone" dataKey="avg_mae" stroke="#714B67" strokeWidth={2} fill="url(#maeGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
        Lower MAE = better predictions. Green dashed line = maturity threshold.
        {maturity?.avg_mae_7d ? ' 7d avg MAE: ' + maturity.avg_mae_7d : ''}
      </p>
    </div>
  );
};

export default AccuracyTrendChart;
