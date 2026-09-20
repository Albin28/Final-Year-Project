import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, TrendingUp, BarChart3, Activity, ArrowRight, ShieldCheck, CheckCircle2, Cpu, Sliders, ShoppingCart, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ABCXYZMatrix from '../components/ABCXYZMatrix';
import FeatureImportanceChart from '../components/FeatureImportanceChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [overallStats, setOverallStats] = useState({ total: 0, lowStock: 0, categories: {} });
  
  // Dynamic Simulation Parameters
  const [leadTime, setLeadTime] = useState(3);
  const [zScore, setZScore] = useState(1.65);

  // Selected product forecast details
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastDetails, setForecastDetails] = useState(null);

  // Self-training status states
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState('');

  const handleSelfTrain = async () => {
    setTraining(true);
    setTrainStatus('Training ML Models...');
    try {
      const res = await api.post('/forecasting/train');
      const { products_imported, bills_created, items_imported } = res.data;
      alert(`Self-training complete!\n\nImported Products: ${products_imported}\nImported Bills: ${bills_created}\nTotal Sales Records: ${items_imported}`);
      
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
      setSelectedProductId('');
    } catch (err) {
      console.error(err);
      alert(`Self-training failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setTraining(false);
      setTrainStatus('');
    }
  };

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
        const [metricsRes, predRes, anomalyRes] = await Promise.all([
          api.get(`/forecasting/metrics/${selectedProductId}`),
          api.get(`/forecasting/predictions/${selectedProductId}?lead_time=${leadTime}&z_score=${zScore}`),
          api.get(`/forecasting/analytics/anomalies/${selectedProductId}`)
        ]);

        setForecastDetails({
          productName: metricsRes.data.product_name,
          classification: metricsRes.data.classification,
          bestModel: metricsRes.data.best_model,
          featureImportance: metricsRes.data.feature_importance || predRes.data.feature_importance || [],
          metrics: metricsRes.data.metrics,
          predictions: predRes.data.predictions,
          recommendation: predRes.data.recommendation,
          anomalies: anomalyRes.data
        });
      } catch (err) {
        console.error("Failed to fetch forecasting data", err);
      } finally {
        setLoadingForecast(false);
      }
    };

    fetchForecast();
  }, [selectedProductId, leadTime, zScore]);

  const categoryChartData = Object.entries(overallStats.categories).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="action-bar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>AI Supply Chain Intelligence & Demand Forecasting</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ML Tournament: Random Forest Regressor (Lag Features), Prophet & Holt-Winters Exponential Smoothing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>Inspect Product:</label>
          <select 
            value={selectedProductId} 
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={{ minWidth: '220px', padding: '0.4rem 0.6rem' }}
          >
            <option value="">-- All Products (Portfolio Overview) --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
            ))}
          </select>
          <button 
            className="btn" 
            onClick={() => window.print()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              backgroundColor: '#4F46E5',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Export AI Report
          </button>
          <button 
            className="btn" 
            onClick={handleSelfTrain} 
            disabled={training}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              opacity: training ? 0.7 : 1,
              cursor: training ? 'not-allowed' : 'pointer'
            }}
          >
            {training ? (
              <>
                <span className="spinner" style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }} />
                {trainStatus}
              </>
            ) : 'Self-Train ML Models'}
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href='/inventory'}>View Inventory</button>
        </div>
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
                    <p>Random Forest & Prophet Active</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="#714B67" /> Explainable Multi-Model AI Architecture
                  </h2>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                    Welcome to **NexusERP's Explainable ML Forecasting Platform**. Our system combines classical time-series models with **Random Forest Regressors** equipped with time-lag features (`t-1`, `t-7`, rolling mean/std, day-of-week). Each product undergoes automated cross-validation backtesting ($R^2$, MAE, RMSE, MAPE) and feature contribution breakdown (XAI).
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '0.25rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Lag Feature Engineering</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Engineers 7-day rolling statistics, previous lag periods, and calendar weekly flags to capture demand inertia.
                      </p>
                    </div>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '0.25rem' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Explainable AI (XAI)</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Quantifies exact feature importance contributions for total model explainability during academic evaluation.
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => setSelectedProductId(products[0]?.id || '')}>
                      Inspect Milk ML breakdown <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    </span>
                  </div>
                </div>

                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} color="#FFC107" /> Demand Pattern Categories
                  </h2>
                  <div style={{ height: '220px', width: '100%' }}>
                    {categoryChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={80} />
                          <Tooltip cursor={{ fill: '#F3F4F6' }} />
                          <Bar dataKey="count" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4rem' }}>No data seeded yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Portfolio ABC-XYZ Classification Matrix */}
              <ABCXYZMatrix />
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
                          onChange={(e) => setLeadTime(Number(e.target.value))}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Service Level (Z):</label>
                        <select 
                          value={zScore} 
                          onChange={(e) => setZScore(Number(e.target.value))}
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

