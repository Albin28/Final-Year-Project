import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ShoppingCart, Grid, Package } from 'lucide-react';
import api from '../api/axios';
import ABCXYZMatrix from '../components/ABCXYZMatrix';

const Inventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', price: 0, quantity_in_stock: 0, reorder_level: 10 });
  const [editingId, setEditingId] = useState(null);
  const [generatingPOs, setGeneratingPOs] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');

  const handleAutoGeneratePOs = async () => {
    setGeneratingPOs(true);
    try {
      const res = await api.post('/po/auto-generate-low-stock');
      alert(res.data.message);
      navigate('/po');
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setGeneratingPOs(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      fetchProducts();
      setShowModal(false);
      setFormData({ name: '', category: '', price: 0, quantity_in_stock: 0, reorder_level: 10 });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const editProduct = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="action-bar">
        <h1>Inventory</h1>
        <div className="action-buttons">
          <button
            onClick={handleAutoGeneratePOs}
            disabled={generatingPOs}
            className="btn"
            style={{
              backgroundColor: '#10B981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem',
              cursor: generatingPOs ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingCart size={16} />
            {generatingPOs ? 'Generating...' : 'Auto-Generate Restock POs'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Create
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: activeTab === 'catalog' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
            background: activeTab === 'catalog' ? 'var(--primary-color)' : 'white',
            color: activeTab === 'catalog' ? 'white' : 'var(--text-color)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <Package size={16} /> Products Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('abcxyz')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: activeTab === 'abcxyz' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
            background: activeTab === 'abcxyz' ? 'var(--primary-color)' : 'white',
            color: activeTab === 'abcxyz' ? 'white' : 'var(--text-color)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <Grid size={16} /> Strategic ABC-XYZ Portfolio
        </button>
      </div>

      {activeTab === 'abcxyz' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ABCXYZMatrix />
        </div>
      ) : (
        <div className="table-container" style={{ flex: 1 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '500' }}>{p.name}</td>
                  <td><span className="badge badge-light">{p.category}</span></td>
                  <td>Rs. {p.price.toFixed(2)}</td>
                  <td>{p.quantity_in_stock}</td>
                  <td>
                    {p.quantity_in_stock <= p.reorder_level ? 
                      <span className="badge badge-danger">Low Stock</span> : 
                      <span className="badge badge-success">In Stock</span>
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={(e) => { e.stopPropagation(); editProduct(p); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products found. Click "Create" to add some.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: '4px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{editingId ? 'Edit Product' : 'New Product'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Product Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Widget A" /></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Category</label><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required placeholder="e.g. Components" /></div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Sales Price</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}>Rs.</span>
                      <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity On Hand</label><input type="number" value={formData.quantity_in_stock} onChange={e => setFormData({...formData, quantity_in_stock: parseInt(e.target.value)})} required /></div>
                </div>
                
                <div style={{ marginTop: '0.5rem', width: '50%', paddingRight: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Reorder Level</label><input type="number" value={formData.reorder_level} onChange={e => setFormData({...formData, reorder_level: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: '#F8F9FA' }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); setFormData({name:'', category:'', price:0, quantity_in_stock:0, reorder_level:10})}} className="btn btn-secondary">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
