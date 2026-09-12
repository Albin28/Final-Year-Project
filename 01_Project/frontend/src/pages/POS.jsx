import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const emptyItem = { product_id: '', quantity: 1 };

const POS = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [recentBills, setRecentBills] = useState([]);
  const [billIdToExport, setBillIdToExport] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap.get(Number(item.product_id));
      if (!product) return sum;
      const qty = Number(item.quantity) || 0;
      return sum + product.price * qty;
    }, 0);
  }, [items, productMap]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products.');
      console.error(err);
    }
  };

  const fetchRecentBills = async () => {
    try {
      const res = await api.get('/pos/bills/recent?limit=5');
      setRecentBills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRecentBills();
  }, []);

  const updateItem = (index, key, value) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    setItems(next);
  };

  const addRow = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) {
      setItems([{ ...emptyItem }]);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const createBill = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const payloadItems = items
      .map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }))
      .filter((item) => item.product_id && item.quantity > 0);

    if (payloadItems.length === 0) {
      setError('Add at least one valid bill item.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/pos/bills', { items: payloadItems });
      setMessage(`Bill #${res.data.id} created successfully. Total: $${Number(res.data.total_amount).toFixed(2)}`);
      setItems([{ ...emptyItem }]);
      fetchProducts();
      fetchRecentBills();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to create bill.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadExcel = async (billId) => {
    setMessage('');
    setError('');

    if (!billId) {
      setError('Enter a bill ID first.');
      return;
    }

    try {
      const res = await api.get(`/pos/bills/${billId}/excel`, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bill_${billId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage(`Bill #${billId} exported.`);
    } catch (err) {
      setError('Could not export bill. Check the bill ID.');
      console.error(err);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="action-bar">
        <h1>Point Of Sale</h1>
      </div>

      {message && <div style={{ background: '#E8F7EE', color: '#1E7A3A', border: '1px solid #B9E6C8', padding: '0.75rem 1rem', borderRadius: '6px' }}>{message}</div>}
      {error && <div style={{ background: '#FDECEA', color: '#A12A2A', border: '1px solid #F5B5AD', padding: '0.75rem 1rem', borderRadius: '6px' }}>{error}</div>}

      <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ padding: '1rem 1rem 0.5rem', fontWeight: 600 }}>Create Bill</div>
        <form onSubmit={createBill} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item, index) => {
            const product = productMap.get(Number(item.product_id));
            return (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((productOption) => (
                    <option key={productOption.id} value={productOption.id}>
                      {productOption.name} (Stock: {productOption.quantity_in_stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {product ? `$${Number(product.price).toFixed(2)}` : '-'}
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => removeRow(index)}>Remove</button>
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600 }}>Estimated Total: ${estimatedTotal.toFixed(2)}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={addRow}>Add Item</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Bill'}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Export Bill to Excel (by ID)</div>
        <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="number"
            min="1"
            value={billIdToExport}
            onChange={(e) => setBillIdToExport(e.target.value)}
            placeholder="Enter Bill ID"
            style={{ maxWidth: '220px' }}
          />
          <button type="button" className="btn btn-primary" onClick={() => downloadExcel(billIdToExport)}>Download Excel</button>
        </div>
      </div>

      <div className="table-container" style={{ background: 'var(--card-bg)' }}>
        <div style={{ padding: '1rem', fontWeight: 600 }}>Recent Bills</div>
        <table>
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Date</th>
              <th>Total</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentBills.map((bill) => (
              <tr key={bill.id}>
                <td>#{bill.id}</td>
                <td>{new Date(bill.created_at).toLocaleString()}</td>
                <td>${Number(bill.total_amount).toFixed(2)}</td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => navigate(`/invoice/${bill.id}`)}>Print</button>
                  <button className="btn btn-secondary" onClick={() => downloadExcel(bill.id)}>Excel</button>
                </td>
              </tr>
            ))}
            {recentBills.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No bills yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POS;
