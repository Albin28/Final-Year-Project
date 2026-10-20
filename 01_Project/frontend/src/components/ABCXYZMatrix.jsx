import React, { useState, useEffect } from 'react';
import { Grid, Layers, ShieldAlert, Award, X } from 'lucide-react';
import api from '../api/axios';

const ABCXYZMatrix = () => {
  const [data, setData] = useState({ matrix: {}, products: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get('/forecasting/analytics/abc-xyz');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load ABC-XYZ Matrix", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading ABC-XYZ Portfolio Classification Matrix...</div>;
  }

  const abcDescriptions = {
    A: 'High Revenue (Top 70%)',
    B: 'Medium Revenue (Next 20%)',
    C: 'Low Revenue (Bottom 10%)'
  };

  const xyzDescriptions = {
    X: 'High Predictability (CV² < 0.25)',
    Y: 'Moderate Predictability (CV² 0.25 - 0.75)',
    Z: 'Low Predictability (CV² > 0.75)'
  };

  const getCellColor = (abc, xyz) => {
    if (abc === 'A' && xyz === 'X') return { bg: '#E6F4EA', border: '#34A853', text: '#137333' };
    if (abc === 'A' && xyz === 'Y') return { bg: '#FEF7E0', border: '#FBBC04', text: '#B06000' };
    if (abc === 'A' && xyz === 'Z') return { bg: '#FCE8E6', border: '#EA4335', text: '#C5221F' };
    if (abc === 'B') return { bg: '#F1F3F4', border: '#BDC1C6', text: '#3C4043' };
    return { bg: '#FAFAFA', border: '#E8EAED', text: '#5F6368' };
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid size={20} color="var(--primary-color)" /> Portfolio ABC-XYZ Demand & Revenue Matrix
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Multi-dimensional product segmentation: Revenue Volume (ABC) vs Demand Variability (XYZ). Click any card or product list to view all items.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
        {/* Header Row */}
        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Revenue \ Predictability
        </div>
        {['X', 'Y', 'Z'].map(x => (
          <div key={x} style={{ background: '#F8F9FA', padding: '0.5rem', borderRadius: '0.25rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Class {x}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{xyzDescriptions[x]}</div>
          </div>
        ))}

        {/* Matrix Rows */}
        {['A', 'B', 'C'].map(a => (
          <React.Fragment key={a}>
            <div style={{ background: '#F8F9FA', padding: '0.5rem', borderRadius: '0.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Class {a}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{abcDescriptions[a]}</div>
            </div>

            {['X', 'Y', 'Z'].map(x => {
              const cellKey = `${a}-${x}`;
              const cellItems = data.matrix[cellKey] || [];
              const colors = getCellColor(a, x);

              return (
                <div 
                  key={cellKey}
                  onClick={() => cellItems.length > 0 && setSelectedCell({ key: cellKey, items: cellItems, colors, abc: a, xyz: x })}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    minHeight: '125px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: cellItems.length > 0 ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  title={cellItems.length > 0 ? `Click to inspect all ${cellItems.length} products in Class ${cellKey}` : ''}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: colors.text }}>{cellKey}</span>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        background: 'rgba(255,255,255,0.85)', 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '10px', 
                        fontWeight: '600',
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      {cellItems.length} Products
                    </span>
                  </div>

                  <div 
                    style={{ 
                      fontSize: '0.8rem', 
                      color: '#374151', 
                      overflowY: 'auto', 
                      maxHeight: '75px',
                      paddingRight: '4px'
                    }}
                  >
                    {cellItems.length > 0 ? (
                      cellItems.map((item, idx) => (
                        <div key={item.id || idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                          • {item.name} (Rs. {item.revenue.toFixed(0)})
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No items</span>
                    )}
                  </div>

                  {cellItems.length > 3 && (
                    <div style={{ marginTop: '0.35rem', borderTop: `1px dashed ${colors.border}`, paddingTop: '0.25rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          color: colors.text, 
                          fontWeight: '600',
                          display: 'inline-block'
                        }}
                      >
                        🔍 View all {cellItems.length} products →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedCell && (
        <div 
          onClick={() => setSelectedCell(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: selectedCell.colors.bg
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span 
                    style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '700', 
                      color: selectedCell.colors.text,
                      padding: '0.2rem 0.6rem',
                      background: 'white',
                      borderRadius: '4px',
                      border: `1px solid ${selectedCell.colors.border}`
                    }}
                  >
                    Class {selectedCell.key}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937' }}>
                    {selectedCell.items.length} Products Allocated
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '0.35rem' }}>
                  <strong>Revenue Tier:</strong> {abcDescriptions[selectedCell.abc]} &nbsp;|&nbsp; <strong>Predictability:</strong> {xyzDescriptions[selectedCell.xyz]}
                </div>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                style={{
                  background: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Complete Product List */}
            <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left', color: '#4B5563' }}>
                    <th style={{ padding: '0.5rem 0.75rem', width: '40px' }}>#</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Product Name</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCell.items.map((prod, idx) => (
                    <tr 
                      key={prod.id || idx}
                      style={{ 
                        borderBottom: '1px solid #F3F4F6',
                        background: idx % 2 === 0 ? 'white' : '#F9FAFB'
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.75rem', color: '#6B7280' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: '500', color: '#111827' }}>
                        {prod.name}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: '600', color: selectedCell.colors.text }}>
                        Rs. {prod.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: '0.75rem 1.5rem',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#F9FAFB'
              }}
            >
              <button 
                onClick={() => setSelectedCell(null)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABCXYZMatrix;
