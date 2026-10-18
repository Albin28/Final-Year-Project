import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_FLOW = ['Generated', 'Approved', 'Pending Delivery', 'Delivered'];

const STATUS_STYLE = {
  'Generated':         { bg: '#F3F4F6', color: '#374151' },
  'Approved':          { bg: '#DBEAFE', color: '#1D4ED8' },
  'Pending Delivery':  { bg: '#FEF3C7', color: '#92400E' },
  'Delivered':         { bg: '#D1FAE5', color: '#065F46' },
};

const PurchaseOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(location.state?.recommendedQty || 100);
  const [vendorName, setVendorName] = useState('Fresh Farm Wholesale Co.');
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, poRes] = await Promise.all([
          api.get('/products/'),
          api.get('/po/'),
        ]);
        setProducts(prodRes.data);
        setPoList(poRes.data);
        const targetName = location.state?.targetProduct;
        if (targetName) {
          const match = prodRes.data.find(p => p.name === targetName);
          if (match) setSelectedProductId(String(match.id));
        } else if (prodRes.data.length > 0) {
          setSelectedProductId(String(prodRes.data[0].id));
        }
      } catch (err) {
        console.error('Failed to load PO data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [location.state]);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      const res = await api.post('/po/', {
        vendor_name: vendorName,
        product_id: parseInt(selectedProductId),
        quantity: parseInt(quantity),
      });
      setPoList([res.data, ...poList]);
      showToast(res.data.po_number + ' created successfully.');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create PO', 'error');
    }
  };

  const handleStatusChange = async (po, newStatus) => {
    if (po.status === 'Delivered') return;
    setUpdatingId(po.id);
    try {
      const res = await api.patch('/po/' + po.id + '/status', { status: newStatus });
      setPoList(prev => prev.map(p => p.id === po.id ? res.data : p));
      if (res.data.inventory_updated) {
        showToast('Stock updated! ' + po.product_name + ' inventory +' + po.quantity + ' units (now ' + res.data.new_stock + ').', 'success');
      } else {
        showToast('PO ' + po.po_number + ' updated to "' + newStatus + '".');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedProduct = products.find(p => String(p.id) === selectedProductId);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5',
          color: toast.type === 'error' ? '#991B1B' : '#065F46',
          padding: '0.75rem 1.25rem', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: '600', fontSize: '0.9rem',
          border: '1px solid ' + (toast.type === 'error' ? '#FECACA' : '#A7F3D0')
        }}>
          {toast.type === 'error' ? 'Error: ' : 'Done: '}{toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Purchase Orders & Supplier Management</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Create supplier orders and track delivery. Marking <strong>Delivered</strong> automatically updates inventory stock.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>+ Create New Supplier Purchase Order</h3>
        <form onSubmit={handleCreatePO} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Supplier / Vendor</label>
            <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Target Product</label>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}>
              {products.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name} (Stock: {p.quantity_in_stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              Restock Qty {selectedProduct && <span style={{ color: '#6B7280', fontWeight: '400' }}>@ Rs.{selectedProduct.price}/unit</span>}
            </label>
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box' }} required />
          </div>
          <div>
            {selectedProduct && quantity > 0 && (
              <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px' }}>
                Est. Total: <strong style={{ color: '#10B981' }}>Rs.{(selectedProduct.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.55rem', fontSize: '13px', fontWeight: '600' }}>
              Generate PO
            </button>
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Loading orders...</p>
        ) : poList.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>No purchase orders yet. Create one above.</p>
        ) : (
          <table className="invoice-table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {poList.map(po => {
                const style = STATUS_STYLE[po.status] || STATUS_STYLE['Generated'];
                const isLocked = po.status === 'Delivered';
                const isUpdating = updatingId === po.id;
                const nextStatuses = STATUS_FLOW.filter(s => s !== po.status);
                return (
                  <tr key={po.id} style={{ opacity: isUpdating ? 0.6 : 1 }}>
                    <td style={{ fontWeight: '700', color: '#714B67' }}>{po.po_number}</td>
                    <td style={{ fontSize: '12px', color: '#6B7280' }}>
                      {po.created_at ? new Date(po.created_at).toLocaleDateString('en-IN') : '--'}
                    </td>
                    <td style={{ fontWeight: '500' }}>{po.vendor_name}</td>
                    <td>{po.product_name}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{po.quantity} units</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#10B981' }}>
                      Rs.{po.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: style.bg, color: style.color, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isLocked ? (
                        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Fulfilled</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {nextStatuses.map(ns => (
                            <button key={ns} onClick={() => handleStatusChange(po, ns)} disabled={isUpdating}
                              style={{
                                padding: '3px 8px', fontSize: '10px', fontWeight: '600', borderRadius: '4px',
                                border: '1px solid ' + (STATUS_STYLE[ns]?.color || '#D1D5DB'),
                                background: STATUS_STYLE[ns]?.bg || '#F9FAFB',
                                color: STATUS_STYLE[ns]?.color || '#374151',
                                cursor: isUpdating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                              }}>
                              {ns}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '0.75rem', textAlign: 'center' }}>
        Marking a PO as <strong>Delivered</strong> automatically adds ordered qty to inventory stock. This cannot be undone.
      </p>
    </div>
  );
};

export default PurchaseOrders;
