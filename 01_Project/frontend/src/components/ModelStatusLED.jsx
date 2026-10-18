import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const LED = {
  active: { color: '#10B981', label: 'Model Active', pulse: false },
  training: { color: '#F59E0B', label: 'Training...', pulse: true },
  untrained: { color: '#EF4444', label: 'Not Trained', pulse: false },
};

const ModelStatusLED = ({ onStatusChange }) => {
  const [status, setStatus] = useState('untrained');
  const [lastTrained, setLastTrained] = useState(null);
  const [isMature, setIsMature] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await api.get('/forecasting/system-status');
      const s = res.data.model_status || 'untrained';
      setStatus(s);
      setLastTrained(res.data.last_trained_at || null);
      setIsMature(res.data.is_mature || false);
      if (onStatusChange) onStatusChange(s);
    } catch (e) {}
  }, [onStatusChange]);

  useEffect(() => { poll(); }, [poll]);

  useEffect(() => {
    const interval = status === 'training' ? 3000 : 30000;
    const id = setInterval(poll, interval);
    return () => clearInterval(id);
  }, [status, poll]);

  const led = LED[status] || LED.untrained;
  const fmt = ts => {
    try { return new Date(ts + 'Z').toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return null; }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        backgroundColor: led.color, boxShadow: '0 0 6px ' + led.color,
        animation: led.pulse ? 'led-pulse 1.2s ease-in-out infinite' : 'none',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: led.color }}>
          {led.label}{isMature && status === 'active' && ' (Ready)'}
        </span>
        {lastTrained && (
          <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Last: {fmt(lastTrained)}</span>
        )}
      </div>
      <style>{`@keyframes led-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.3)}}`}</style>
    </div>
  );
};

export default ModelStatusLED;
