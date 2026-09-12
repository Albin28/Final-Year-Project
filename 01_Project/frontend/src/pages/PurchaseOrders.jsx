import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const PurchaseOrders = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [vendorName, setVendorName] = useState('Fresh Farm Wholesale Co.');
  const [poList, setPoList] = useState([
    { id: 'PO-2026-001', vendor: 'Fresh Farm Wholesale Co.', product: 'Extra Virgin Olive Oil (1L)', qty: 105, total: '$1,564.50', status: 'Approved', date: '2026-09-02' },
    { id: 'PO-2026-002', vendor: 'National Grains & Rice Ltd', product: 'Basmati Rice (5kg)', qty: 238, total: '$2,975.00', status: 'Pending Delivery', date: '2026-09-03' }
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProduct(res.data[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch products for PO', err);
      }
    };
    fetchProducts();
  }, []);

  const handleCreatePO = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.name === selectedProduct);
    const unitPrice = prod ? prod.price : 5.0;
    const totalVal = (unitPrice * quantity).toFixed(2);

    const newPo = {
      id: `PO-2026-${String(poList.length + 1).padStart(3, '0')}`,
      vendor: vendorName,
      product: selectedProduct,
      qty: quantity,
      total: `$${Number(totalVal).toLocaleString()}`,
      status: 'Generated',
      date: new Date().toISOString().split('T')[0]
    };

    setPoList([newPo, ...poList]);
    alert(`Purchase Order ${newPo.id} created successfully for ${quantity} units of ${selectedProduct}!`);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>🏢 Purchase Orders & Supplier Management</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Automated procurement generation powered by Prophet AI stock reorder points.</p>
        </div>
      </div>

      {/* PO Generator Form */}
      <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem', color: '#1F2937' }}>+ Create New Supplier Purchase Order</h3>
        <form onSubmit={handleCreatePO} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Supplier / Vendor</label>
            <input 
              type="text" 
              value={vendorName} 
              onChange={(e) => setVendorName(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Target Product</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
            >
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name} (Stock: {p.quantity_in_stock})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Restock Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              min="1" 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
              required 
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.55rem', fontSize: '13px', fontWeight: '600' }}>
              📄 Generate PO
            </button>
          </div>
        </form>
      </div>

      {/* PO Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table className="invoice-table" style={{ width: '100%', margin: 0 }}>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Date</th>
              <th>Supplier Name</th>
              <th>Product</th>
              <th style={{ textAlign: 'right' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {poList.map((po) => (
              <tr key={po.id}>
                <td style={{ fontWeight: '700', color: '#714B67' }}>{po.id}</td>
                <td>{po.date}</td>
                <td style={{ fontWeight: '500' }}>{po.vendor}</td>
                <td>{po.product}</td>
                <td style={{ textAlign: 'right', fontWeight: '600' }}>{po.qty} units</td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: '#10B981' }}>{po.total}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ 
                    backgroundColor: po.status === 'Approved' ? '#D1FAE5' : '#FEF3C7', 
                    color: po.status === 'Approved' ? '#065F46' : '#92400E',
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' 
                  }}>
                    {po.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => window.print()}
                    style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🖨️ Print PO
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;
