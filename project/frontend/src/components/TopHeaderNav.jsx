import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const TopHeaderNav = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeModal, setActiveModal] = useState(null); // 'apps' | 'discussions' | 'calendar' | null
  const [appsTab, setAppsTab] = useState('modules'); // 'modules' | 'simulator'
  const [simDays, setSimDays] = useState(1);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleRunSimulation = async (fillToday) => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.post(`/forecasting/simulate-sales?days=${simDays}&fill_today=${fillToday}`);
      setSimResult(res.data);
    } catch (err) {
      setSimResult({ error: err.response?.data?.detail || err.message });
    } finally {
      setSimulating(false);
    }
  };

  const [generatingPOs, setGeneratingPOs] = useState(false);
  const [poGenResult, setPoGenResult] = useState(null);

  const handleAutoGeneratePOs = async () => {
    setGeneratingPOs(true);
    setPoGenResult(null);
    try {
      const res = await api.post('/po/auto-generate-low-stock');
      setPoGenResult(res.data);
    } catch (err) {
      setPoGenResult({ error: err.response?.data?.detail || err.message });
    } finally {
      setGeneratingPOs(false);
    }
  };

  // Discussions state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI System (Prophet)', time: '10 mins ago', text: 'Alert: Fortune Sunlite Sunflower Oil crossed Reorder Point threshold (45 units). Recommended Restock: 65 units.', isAi: true },
    { id: 2, sender: 'Admin Manager', time: '1 hour ago', text: 'Dairy vendor confirmed delivery for tomorrow morning 9:00 AM.', isAi: false },
    { id: 3, sender: 'Cashier Team', time: '3 hours ago', text: 'POS Printer ink replaced. Invoice printing ready for peak hours.', isAi: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: user?.username || 'Store Staff',
        time: 'Just now',
        text: newMessage,
        isAi: false
      }
    ]);
    setNewMessage('');
  };

  const appsList = [
    { title: 'AI Forecasting', desc: 'Demand Tournament & ROP', icon: '📊', route: '/' },
    { title: 'Inventory Stock', desc: 'Product CRUD & Reorder Alerts', icon: '📦', route: '/inventory' },
    { title: 'POS Billing', desc: 'Cashier Checkout & Stock Sync', icon: '🛒', route: '/pos' },
    { title: 'Bill Records', desc: 'Excel Export & Invoice Lookup', icon: '🧾', route: '/accounts' },
    { title: 'Purchase Orders', desc: 'Supplier Reordering & PO Generator', icon: '🏢', route: '/po' },
    { title: 'Financial Analytics', desc: 'Profit Margins & Sales Trends', icon: '📈', route: '/analytics' }
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <div style={{ height: '48px', backgroundColor: 'var(--primary-color, #714B67)', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', color: 'white', zIndex: 30, position: 'relative' }}>
        
        {/* Left Side Branding & Interactive Nav Links */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '16px', letterSpacing: '-0.5px' }}
          >
            <span>Nexus<span style={{ color: '#F59E0B' }}>ERP</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: '0.5rem' }}>
            <button
              onClick={() => setActiveModal(activeModal === 'apps' ? null : 'apps')}
              style={{ background: activeModal === 'apps' ? 'rgba(255,255,255,0.2)' : 'none', border: 'none', color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', borderRadius: '4px' }}
            >
              <span>📱 Apps</span>
            </button>
            <button
              onClick={() => setActiveModal(activeModal === 'discussions' ? null : 'discussions')}
              style={{ background: activeModal === 'discussions' ? 'rgba(255,255,255,0.2)' : 'none', border: 'none', color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', borderRadius: '4px' }}
            >
              <span>💬 Discussions</span>
              <span style={{ backgroundColor: '#EF4444', color: 'white', borderRadius: '10px', fontSize: '10px', padding: '1px 6px', fontWeight: '700' }}>3</span>
            </button>
            <button
              onClick={() => setActiveModal(activeModal === 'calendar' ? null : 'calendar')}
              style={{ background: activeModal === 'calendar' ? 'rgba(255,255,255,0.2)' : 'none', border: 'none', color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', borderRadius: '4px' }}
            >
              <span>📅 Calendar</span>
            </button>
          </div>
        </div>

        {/* Right Side Status & User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '12px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '12px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span>System Online</span>
          </div>
          <span style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>{user?.username || 'User'}</span>
          <div
            onClick={logout}
            title="Click to Logout"
            style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            {initial}
          </div>
        </div>
      </div>

      {/* 1. APPS GRID LAUNCHER MODAL */}
      {activeModal === 'apps' && (
        <div 
          onClick={() => setActiveModal(null)}
          style={{ position: 'fixed', top: '48px', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-start', padding: '1rem 2rem' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', width: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', border: '1px solid #E5E7EB' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '18px' }}>📱</span>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#1F2937' }}>NexusERP Module Switcher</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            {/* Modal Internal Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => { setAppsTab('modules'); setSimResult(null); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: appsTab === 'modules' ? '#714B67' : '#F3F4F6',
                  color: appsTab === 'modules' ? 'white' : '#4B5563',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📦 Core Modules
              </button>
              <button
                type="button"
                onClick={() => setAppsTab('simulator')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: appsTab === 'simulator' ? '#714B67' : '#F3F4F6',
                  color: appsTab === 'simulator' ? 'white' : '#4B5563',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s'
                }}
              >
                ⚡ POS Sales Simulator
              </button>
            </div>

            {/* TAB 1: CORE MODULES */}
            {appsTab === 'modules' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {appsList.map((app, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      navigate(app.route);
                      setActiveModal(null);
                    }}
                    style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '0.4rem' }}>{app.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{app.title}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{app.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: DATA & POS SIMULATOR (HIDDEN IN TAB) */}
            {appsTab === 'simulator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
                  Auto-populates realistic customer shopping transactions across operating hours (09:00 - 21:00) so AI demand forecasting models and stock levels stay actively trained without manual bill entry.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  {/* Action 1: Full Day Simulation */}
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.9rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', marginBottom: '0.3rem' }}>
                        🛒 Today's Full Day
                      </div>
                      <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, marginBottom: '0.8rem' }}>
                        Generates 20–28 multi-item baskets for today. Updates today's sales KPI & live stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={simulating}
                      onClick={() => handleRunSimulation(true)}
                      style={{
                        padding: '0.5rem',
                        background: '#714B67',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: simulating ? 'not-allowed' : 'pointer',
                        opacity: simulating ? 0.7 : 1
                      }}
                    >
                      {simulating ? 'Simulating...' : 'Simulate Today\'s Sales'}
                    </button>
                  </div>

                  {/* Action 2: Backfill Inactive Days */}
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.9rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1F2937', marginBottom: '0.3rem' }}>
                        📅 Backfill Inactive Days
                      </div>
                      <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, marginBottom: '0.5rem' }}>
                        Fills past days so elapsed time has continuous sales for accuracy metrics.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                        <label style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>Days to fill:</label>
                        <select
                          value={simDays}
                          onChange={(e) => setSimDays(Number(e.target.value))}
                          style={{ padding: '2px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
                        >
                          <option value={1}>1 Day (Yesterday)</option>
                          <option value={3}>3 Days</option>
                          <option value={7}>7 Days (Past Week)</option>
                          <option value={14}>14 Days (Two Weeks)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={simulating}
                      onClick={() => handleRunSimulation(false)}
                      style={{
                        padding: '0.5rem',
                        background: '#0D9488',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: simulating ? 'not-allowed' : 'pointer',
                        opacity: simulating ? 0.7 : 1
                      }}
                    >
                      {simulating ? 'Simulating...' : 'Backfill Past Sales'}
                    </button>
                  </div>
                </div>

                {/* Action 3: 1-Click Separate Restock PO Generator for Low Stock Products */}
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📦 1-Click Restock PO Generator
                      </div>
                      <p style={{ fontSize: '11px', color: '#4B5563', margin: '2px 0 0 0' }}>
                        Auto-generates unique, separate Purchase Orders for every product at or below reorder level.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={generatingPOs}
                      onClick={handleAutoGeneratePOs}
                      style={{
                        padding: '0.55rem 0.9rem',
                        background: '#15803D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: generatingPOs ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {generatingPOs ? 'Generating...' : '⚡ Generate Restock POs'}
                    </button>
                  </div>

                  {poGenResult && (
                    <div style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '11px',
                      backgroundColor: poGenResult.error ? '#FEF2F2' : '#DCFCE7',
                      border: poGenResult.error ? '1px solid #FECACA' : '1px solid #86EFAC',
                      color: poGenResult.error ? '#991B1B' : '#14532D',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{poGenResult.error ? `Error: ${poGenResult.error}` : poGenResult.message}</span>
                      {!poGenResult.error && poGenResult.count > 0 && (
                        <button
                          type="button"
                          onClick={() => { setActiveModal(null); navigate('/po'); }}
                          style={{
                            background: '#15803D',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View in Purchase Orders →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulation Result Banner */}
                {simResult && (
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '12px',
                    backgroundColor: simResult.error ? '#FEF2F2' : '#F0FDF4',
                    border: simResult.error ? '1px solid #FECACA' : '1px solid #BBF7D0',
                    color: simResult.error ? '#991B1B' : '#166534'
                  }}>
                    {simResult.error ? (
                      <div><strong>Error:</strong> {simResult.error}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ fontWeight: '700' }}>✓ Simulation Completed Successfully!</div>
                        <div>Generated <strong>{simResult.bills_created}</strong> bills ({simResult.items_sold} items sold) totaling <strong>Rs. {simResult.revenue_generated}</strong>.</div>
                        <div style={{ fontSize: '11px', opacity: 0.85 }}>Dates: {simResult.dates_simulated?.join(', ')} · Inventory and accuracy reconciled.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DISCUSSIONS & STORE NOTIFICATIONS DRAWER */}
      {activeModal === 'discussions' && (
        <div 
          onClick={() => setActiveModal(null)}
          style={{ position: 'fixed', top: '48px', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', width: '420px', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)' }}
          >
            <div style={{ padding: '1.2rem', backgroundColor: '#714B67', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💬</span> Store Discussions & AI Alerts
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: m.isAi ? '#FEF3C7' : '#F3F4F6', borderLeft: m.isAi ? '4px solid #F59E0B' : '4px solid #3B82F6' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: m.isAi ? '#92400E' : '#1E40AF' }}>{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#1F2937', lineHeight: '1.4' }}>{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type a team message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px' }}
              />
              <button type="submit" style={{ backgroundColor: '#714B67', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. STORE CALENDAR MODAL */}
      {activeModal === 'calendar' && (
        <div 
          onClick={() => setActiveModal(null)}
          style={{ position: 'fixed', top: '48px', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', width: '550px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📅</span> Store Operations & Restock Schedule
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#065F46' }}>📦 Sept 5 – Scheduled Delivery: Dairy & Milk Products</div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>Supplier: Fresh Farm Dairy Ltd. Expected arrival: 9:00 AM.</div>
              </div>
              <div style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1E40AF' }}>🛒 Sept 7 – Weekend Grocery Sales Peak</div>
                <div style={{ fontSize: '12px', color: '#1D4ED8', marginTop: '2px' }}>Prophet AI predicts +35% demand surge for Bread and Eggs.</div>
              </div>
              <div style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#991B1B' }}>⚠️ Sept 10 – Monthly Inventory Audit Deadline</div>
                <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>Conduct physical stock verification for fast-moving items.</div>
              </div>
            </div>

            <div style={{ marginTop: '1.2rem', textAlign: 'right' }}>
              <button onClick={() => setActiveModal(null)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '12px' }}>Close Calendar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopHeaderNav;
