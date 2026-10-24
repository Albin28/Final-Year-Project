import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Invoice = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await api.get(`/pos/bills/${billId}`);
        setBill(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [billId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ color: '#6c757d' }}>Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', gap: '1rem' }}>
        <p style={{ color: '#DC3545' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/pos')}>Back to POS</button>
      </div>
    );
  }

  const date = new Date(bill.created_at);
  const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const invoiceNumber = `INV-${String(bill.id).padStart(5, '0')}`;

  return (
    <>
      {/* Screen-only controls */}
      <div className="invoice-controls no-print">
        <button className="btn btn-secondary" onClick={() => navigate('/pos')}>← Back to POS</button>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Invoice</button>
      </div>

      {/* Invoice body — this is what gets printed */}
      <div className="invoice-page" id="invoice-print-area">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <h1 className="invoice-logo"><span className="brand-accent">Nexus</span>ERP</h1>
            <p className="brand-tagline">Inventory & Sales Management</p>
          </div>
          <div className="invoice-title-block">
            <h2 className="invoice-title">INVOICE</h2>
            <p className="invoice-number">{invoiceNumber}</p>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Meta row */}
        <div className="invoice-meta">
          <div className="invoice-meta-group">
            <p className="meta-label">Bill To</p>
            <p className="meta-value">Walk-in Customer</p>
          </div>
          <div className="invoice-meta-group" style={{ textAlign: 'right' }}>
            <p className="meta-label">Invoice Date</p>
            <p className="meta-value">{formattedDate}</p>
            <p className="meta-sub">{formattedTime}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Item</th>
              <th style={{ textAlign: 'right', width: '80px' }}>Qty</th>
              <th style={{ textAlign: 'right', width: '110px' }}>Unit Price</th>
              <th style={{ textAlign: 'right', width: '110px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>₹{Number(item.unit_price).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>₹{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>₹{Number(bill.total_amount).toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax (0%)</span>
            <span>₹0.00</span>
          </div>
          <div className="totals-divider"></div>
          <div className="totals-row totals-grand">
            <span>Total</span>
            <span>₹{Number(bill.total_amount).toFixed(2)}</span>
          </div>
        </div>

        </div>

      {/* Print-specific styles are in index.css via @media print */}
    </>
  );
};

export default Invoice;
