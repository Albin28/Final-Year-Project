import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, TrendingUp, Activity, ShieldCheck, CheckCircle2, Sliders, ShoppingCart, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import FeatureImportanceChart from '../components/FeatureImportanceChart';
import ModelStatusLED from '../components/ModelStatusLED';
import AccuracyTrendChart from '../components/AccuracyTrendChart';
import TodaySummaryWidgets from '../components/TodaySummaryWidgets';
import RecentFeedsPanel from '../components/RecentFeedsPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [overallStats, setOverallStats] = useState({ total: 0, lowStock: 0, categories: {} });
  
  // Dynamic Simulation Parameters
  const [leadTime, setLeadTime] = useState(3);
  const [zScore, setZScore] = useState(1.65);

  // Debounced values to avoid firing API on every slider tick
  const [debouncedLeadTime, setDebouncedLeadTime] = useState(3);
  const [debouncedZScore, setDebouncedZScore] = useState(1.65);
  const debounceRef = useRef(null);

  const updateSimParams = useCallback((lt, z) => {
    setLeadTime(lt);
    setZScore(z);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedLeadTime(lt);
      setDebouncedZScore(z);
    }, 400);
  }, []);

  // Selected product forecast details
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastDetails, setForecastDetails] = useState(null);

  const [modelStatus, setModelStatus] = useState('untrained');
  const [training, setTraining] = useState(false);

  const handleSelfTrain = async () => {
    if (training || modelStatus === 'training') return;
    setTraining(true);
    try {
      await api.post('/forecasting/train');
      // Status now goes orange via LED polling; refresh product list
      const productsRes = await api.get('/products');
      setProducts(productsRes.data);
      setOverallStats(prev => ({ ...prev, total: productsRes.data.length }));
      setSelectedProductId('');
    } catch (err) {
      console.error(err);
      alert(`Self-training failed: ${err.response?.data?.detail || err.message}`);
      setTraining(false);
    }
    // training=false will be set when LED transitions to active
  };

  // When LED reports active/untrained, allow button again
  const handleStatusChange = useCallback((s) => {
    setModelStatus(s);
    if (s !== 'training') setTraining(false);
  }, []);

  // Retrain schedule state
  const [scheduleType, setScheduleType] = useState('manual');
  const [scheduleTime, setScheduleTime] = useState('23:59');
  const [scheduleDay, setScheduleDay] = useState('mon');
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const handleSaveSchedule = async () => {
    try {
      await api.post('/forecasting/retrain-schedule', {
        type: scheduleType, time: scheduleTime, day: scheduleDay
      });
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    api.get('/forecasting/retrain-schedule').then(r => {
      setScheduleType(r.data.type || 'manual');
      setScheduleTime(r.data.time || '23:59');
      setScheduleDay(r.data.day || 'mon');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, lowStockRes, statusRes] = await Promise.all([
          api.get('/products'),
          api.get('/products/low-stock'),
          api.get('/forecasting/status')
        ]);
        setProducts(productsRes.data);
        setOverallStats({
          total: productsRes.data.length,
          lowStock: lowStockRes.data.length,
          categories: statusRes.data.categories || {}
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedProductId) {
      setForecastDetails(null);
      return;
    }

    const fetchForecast = async () => {
      setLoadingForecast(true);
      try {
        // Single merged call replaces previous /metrics + /predictions double-train
        const [forecastRes, anomalyRes] = await Promise.all([
          api.get(`/forecasting/forecast/${selectedProductId}?lead_time=${debouncedLeadTime}&z_score=${debouncedZScore}`),
          api.get(`/forecasting/analytics/anomalies/${selectedProductId}`)
        ]);

        setForecastDetails({
          productName: forecastRes.data.product_name,
          classification: forecastRes.data.classification,
          bestModel: forecastRes.data.best_model,
          featureImportance: forecastRes.data.feature_importance || [],
          metrics: forecastRes.data.metrics,
          predictions: forecastRes.data.predictions,
          recommendation: forecastRes.data.recommendation,
          anomalies: anomalyRes.data
        });
      } catch (err) {
        console.error("Failed to fetch forecasting data", err);
      } finally {
        setLoadingForecast(false);
      }
    };

    fetchForecast();
  }, [selectedProductId, debouncedLeadTime, debouncedZScore]);

  const categoryChartData = Object.entries(overallStats.categories).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="action-bar" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h1>AI Supply Chain Intelligence & Demand Forecasting</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ML Tournament: Random Forest, Prophet & Holt-Winters · Continuous Self-Learning
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <ModelStatusLED onStatusChange={handleStatusChange} />
          <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />
          <label style={{ fontWeight: '500', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Inspect Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={{ minWidth: '200px', padding: '0.4rem 0.6rem' }}
          >
            <option value="">-- All Products (Portfolio Overview) --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
            ))}
          </select>
          <button
            className="btn"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#4F46E5', color: 'white', cursor: 'pointer' }}
          >
            <Printer size={16} /> Export Report
          </button>
          <button
            className="btn"
            onClick={handleSelfTrain}
            disabled={training || modelStatus === 'training'}
            title={modelStatus === 'training' ? 'Model is currently training — please wait' : 'Seed dataset and retrain all ML models'}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: modelStatus === 'training' ? '#9CA3AF' : 'var(--primary-color)',
              color: 'white',
              cursor: (training || modelStatus === 'training') ? 'not-allowed' : 'pointer'
            }}
          >
            {(training || modelStatus === 'training') ? (
              <>
                <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                Training...
              </>
            ) : 'Self-Train ML Models'}
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href='/inventory'}>View Inventory</button>
        </div>
      </div>

      {/* Retrain Schedule Panel */}
      <div style={{
        background: '#F8F9FA', border: '1px solid var(--border-color)', borderRadius: '0.5rem',
        padding: '0.75rem 1.25rem', margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>⏱ Auto-Retrain Schedule:</span>
        <select value={scheduleType} onChange={e => setScheduleType(e.target.value)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #D1D5DB' }}>
          <option value="manual">Manual only</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        {scheduleType !== 'manual' && (
          <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
        )}
        {scheduleType === 'weekly' && (
          <select value={scheduleDay} onChange={e => setScheduleDay(e.target.value)} style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #D1D5DB' }}>
            {['mon','tue','wed','thu','fri','sat','sun'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
          </select>
        )}
        <button onClick={handleSaveSchedule} style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem', background: scheduleSaved ? '#10B981' : 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          {scheduleSaved ? '✓ Saved' : 'Save Schedule'}
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Times are in UTC</span>
      </div>
      <div style={{ flex: 1, padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <AnimatePresence mode="wait">
          {!selectedProductId ? (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Today's KPI Cards */}
              <TodaySummaryWidgets />

              {/* Inventory + AI Status row */}
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-icon"><Package size={24} /></div>
                  <div className="metric-info">
                    <h3>Total Products</h3>
                    <p>{overallStats.total}</p>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--danger-color)' }}>
                    <AlertCircle size={24} />
                  </div>
                  <div className="metric-info">
                    <h3>Low Stock Alerts</h3>
                    <p>{overallStats.lowStock}</p>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ background: 'rgba(25, 135, 84, 0.1)', color: 'var(--success-color)' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div className="metric-info">
                    <h3>AI Engine Status</h3>
                    <p style={{ fontSize: '0.9rem' }}>RF + Prophet + HW Active</p>
                  </div>
                </div>
              </div>

              {/* Accuracy Trend Chart */}
              <AccuracyTrendChart />

              {/* Recent Sales + Low Stock feeds */}
              <RecentFeedsPanel />

            </motion.div>
          ) : (
            
            <motion.div 
              key="forecast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {loadingForecast ? (
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                  <Activity size={40} className="animate-spin" style={{ margin: '0 auto 1rem', animation: 'spin 1.5s linear infinite' }} />
                  <p>Evaluating ML models tournament & extracting feature importances...</p>
                </div>
              ) : forecastDetails ? (
                <>
                  {/* Safety Stock & Lead-Time Simulation Control Bar */}
                  <div style={{ background: '#F3F4F6', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sliders size={20} color="var(--primary-color)" />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#1F2937' }}>Real-Time Supply Chain Simulator</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Adjust supplier lead-time and service level confidence to evaluate safety stock impact.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Supplier Lead Time: <strong>{leadTime} Days</strong></label>
                        <input 
                          type="range" 
                          min="1" 
                          max="14" 
                          value={leadTime} 
                          onChange={(e) => updateSimParams(Number(e.target.value), zScore)}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Service Level (Z):</label>
                        <select 
                          value={zScore} 
                          onChange={(e) => updateSimParams(leadTime, Number(e.target.value))}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
                        >
                          <option value={1.28}>90% Confidence (Z=1.28)</option>
                          <option value={1.65}>95% Confidence (Z=1.65)</option>
                          <option value={2.33}>99% Confidence (Z=2.33)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    
                    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.75rem' }}>Demand Pattern</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          {forecastDetails.classification.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', minHeight: '3em' }}>
                        {forecastDetails.classification.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <div>ADI: <strong>{forecastDetails.classification.adi}</strong></div>
                        <div>$CV^2$: <strong>{forecastDetails.classification.cv2}</strong></div>
                      </div>
                    </div>

                    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.75rem' }}>Restocking recommendation</h3>
                        {forecastDetails.recommendation.restock_needed && (
                          <button 
                            onClick={() => navigate('/po', { 
                              state: { 
                                targetProduct: forecastDetails.productName, 
                                recommendedQty: forecastDetails.recommendation.recommended_volume 
                              } 
                            })}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.3rem', 
                              padding: '0.3rem 0.6rem', 
                              fontSize: '0.75rem', 
                              backgroundColor: 'var(--primary-color)', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            <ShoppingCart size={14} /> Generate PO
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: forecastDetails.recommendation.restock_needed ? 'var(--danger-color)' : 'var(--success-color)' }}>
                          {forecastDetails.recommendation.restock_needed 
                            ? `Restock ${forecastDetails.recommendation.recommended_volume} Units` 
                            : 'Stock Levels OK'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', minHeight: '3em' }}>
                        Current Stock: {forecastDetails.recommendation.current_stock} Units.<br/>
                        Reorder point: {forecastDetails.recommendation.reorder_point} Units (Forecast + Safety Stock).
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <div>Avg Demand: <strong>{forecastDetails.recommendation.average_daily_forecast}/day</strong></div>
                        <div>Safety Stock: <strong>{forecastDetails.recommendation.safety_stock}</strong></div>
                      </div>
                    </div>

                    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.75rem' }}>Selected Winning ML Model</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={28} color="var(--success-color)" />
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                          {forecastDetails.bestModel}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', minHeight: '3em' }}>
                        Achieved highest $R^2$ determination and lowest MAE during backtesting, outperforming competitor baseline algorithms.
                      </p>
                    </div>

                    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.75rem' }}>Anomaly Detection (Isolation Forest)</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: (forecastDetails.anomalies?.total_flagged > 0) ? '#D97706' : 'var(--success-color)' }}>
                          {forecastDetails.anomalies?.total_flagged || 0} Spikes Flagged
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', minHeight: '3em' }}>
                        {forecastDetails.anomalies?.total_flagged > 0
                          ? `Unusual demand activity detected on ${forecastDetails.anomalies.anomalies.map(a => a.date).slice(0, 2).join(', ')}.`
                          : 'No abnormal sales spikes or erratic outliers detected in recent history.'}
                      </p>
                    </div>

                  </div>

                  {/* Explainable AI (XAI) Feature Importance Chart */}
                  <FeatureImportanceChart featureImportance={forecastDetails.featureImportance} />

                  {/* 30-Day Demand Forecast Chart */}
                  <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={20} color="var(--primary-color)" /> Next 30 Days Forecast Predictions ({forecastDetails.bestModel})
                    </h2>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastDetails.predictions.map(p => ({ date: p.date.substring(5), quantity: p.quantity }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="quantity" name="Predicted Demand" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ML Model Tournament Table */}
                  <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>ML Model Tournament Leaderboard (80/20 Backtesting)</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                      Models compete across 80% train / 20% validation split. Selected winner balances minimum MAE with highest $R^2$ determination score.
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', fontWeight: '600', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Model Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>MAE (Mean Absolute Error)</th>
                          <th style={{ padding: '0.75rem 1rem' }}>RMSE (Root Mean Squared)</th>
                          <th style={{ padding: '0.75rem 1rem' }}>MAPE (%)</th>
                          <th style={{ padding: '0.75rem 1rem' }}>R² Determination</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(forecastDetails.metrics).map(([modelName, scores]) => {
                          const isBest = modelName === forecastDetails.bestModel;
                          return (
                            <tr key={modelName} style={{ 
                              borderBottom: '1px solid var(--border-color)', 
                              background: isBest ? 'rgba(25, 135, 84, 0.05)' : 'transparent',
                              fontWeight: isBest ? '600' : 'normal'
                            }}>
                              <td style={{ padding: '0.75rem 1rem' }}>{modelName}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{scores.mae}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{scores.rmse}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>{scores.mape}%</td>
                              <td style={{ padding: '0.75rem 1rem', color: scores.r2 > 0 ? 'var(--primary-color)' : '#9CA3AF' }}>{scores.r2 ?? 'N/A'}</td>
                              <td style={{ padding: '0.75rem 1rem', color: isBest ? 'var(--success-color)' : 'var(--text-muted)' }}>
                                {isBest ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle2 size={16} /> Selected Winner
                                  </span>
                                ) : 'Evaluated'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                  <p>Unable to load forecast data for this product.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

