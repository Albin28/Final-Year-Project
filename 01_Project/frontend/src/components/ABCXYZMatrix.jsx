import React, { useState, useEffect } from 'react';
import { Grid, Layers, ShieldAlert, Award } from 'lucide-react';
import api from '../api/axios';

const ABCXYZMatrix = () => {
  const [data, setData] = useState({ matrix: {}, products: [] });
  const [loading, setLoading] = useState(true);

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
            Multi-dimensional product segmentation: Revenue Volume (ABC) vs Demand Variability (XYZ).
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
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    minHeight: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: colors.text }}>{cellKey}</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.7)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: '500' }}>
                      {cellItems.length} Products
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#374151', overflowY: 'auto', maxHeight: '60px' }}>
                    {cellItems.length > 0 ? (
                      cellItems.slice(0, 3).map(item => (
                        <div key={item.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          • {item.name} (Rs. {item.revenue.toFixed(0)})
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No items</span>
                    )}
                    {cellItems.length > 3 && (
                      <div style={{ fontSize: '0.75rem', color: colors.text, fontWeight: '500' }}>
                        +{cellItems.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ABCXYZMatrix;
