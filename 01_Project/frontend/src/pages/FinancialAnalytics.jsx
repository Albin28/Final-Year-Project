import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const FinancialAnalytics = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalAssetValue = products.reduce((acc, p) => acc + (p.price * p.quantity_in_stock), 0);
  const totalStockCount = products.reduce((acc, p) => acc + p.quantity_in_stock, 0);

  // Category breakdown data
  const categoryMap = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + (p.price * p.quantity_in_stock);
  });

  const categoryChartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: Math.round(categoryMap[cat])
  }));

  const COLORS = ['#714B67', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const topValueProducts = [...products]
    .sort((a, b) => (b.price * b.quantity_in_stock) - (a.price * a.quantity_in_stock))
    .slice(0, 6)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      valuation: Math.round(p.price * p.quantity_in_stock),
      stock: p.quantity_in_stock
    }));

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Financial Analytics...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>📈 Executive Financial & Valuation Analytics</h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Real-time inventory asset valuation, category revenue breakdown, and stock metrics.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Total Inventory Asset Value</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>${totalAssetValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Total Active Products</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#714B67', marginTop: '4px' }}>{products.length} Items</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Total Stock Units on Hand</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6', marginTop: '4px' }}>{totalStockCount.toLocaleString()} Units</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Average Item Value</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B', marginTop: '4px' }}>${(products.length > 0 ? totalAssetValue / products.length : 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Chart 1: Top Valued Inventory Items */}
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Top 6 Highest Valuation Products ($)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topValueProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="valuation" fill="#714B67" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Asset Distribution */}
        <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Inventory Asset Value by Category</h3>
          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
