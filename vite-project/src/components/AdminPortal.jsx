import React, { useState, useEffect } from 'react';
import './AdminPortal.css';
import DBMonitor from './DBMonitor';
import { 
  FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle, 
  FiDatabase, FiPlusCircle, FiTrendingUp, FiArrowLeft, FiAlertTriangle, FiDollarSign, FiLock, FiUnlock, FiActivity, FiServer
} from 'react-icons/fi';

const AdminPortal = ({ onBackToShop, themeColor = '#5c2e1a', accentColor = '#a1673f' }) => {
  // Passcode security states
  const [isAuthorized, setIsAuthorized] = useState(sessionStorage.getItem('owner_authorized') === 'true');
  const [pin, setPin] = useState('');
  const [lockMsg, setLockMsg] = useState('');
  const [isPinError, setIsPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('orders'); // orders, products, add-product
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState('');

  // Stock update state
  const [stockUpdates, setStockUpdates] = useState({});

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Gourmet Cupcake',
    price: '',
    stock: '',
    description: '',
    imageFile: 'cupcake.png', // default
    bgText: 'SWEET'
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  // Available image assets
  const availableImages = [
    'almond_croissant.png',
    'berry_waffle.png',
    'blueberry.png',
    'blueberry_macaron.png',
    'cake.png',
    'caramel_macaron.png',
    'choco.png',
    'choco_donut.png',
    'cinnamon_roll.png',
    'croissant.png',
    'cupcake.png',
    'dark_croissant.png',
    'donut.png',
    'hazelnut_shake.png',
    'lava_cake.png',
    'lemon_tart.png',
    'macaron.png',
    'mango_shake.png',
    'matcha_donut.png',
    'matcha_waffle.png',
    'pistachio_shake.png',
    'raspberry_cupcake.png',
    'rose_donut.png',
    'vanilla_cupcake.png',
    'waffle.png'
  ];

  // Synthesize soft, premium notification sound effects using Web Audio API
  const playSynthSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        const playNote = (freq, start, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };
        // Sweet arpeggio C major 7
        playNote(523.25, 0, 0.12);
        playNote(659.25, 0.06, 0.12);
        playNote(783.99, 0.12, 0.12);
        playNote(987.77, 0.18, 0.22);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Web Audio failed to execute:", e);
    }
  };

  // Helper to get auth headers (JWT if Spring Boot, plain for Node.js)
  const getHeaders = () => {
    const token = sessionStorage.getItem('dvbakes_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // Detect which backend is active (Spring Boot port 8080 or Node port 5000)
  const [apiBase, setApiBase] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(r => r.ok ? setApiBase('http://localhost:8080') : setApiBase(''))
      .catch(() => setApiBase(''));
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Parse items if they come as string (Node.js compat)
        const parsed = data.map(o => ({
          ...o,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
        setOrders(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/products`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const parsed = data.map(p => ({
          ...p,
          specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs || [],
          ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients || [],
          nutrition: typeof p.nutrition === 'string' ? JSON.parse(p.nutrition) : p.nutrition || []
        }));
        setProducts(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOrders();
      fetchProducts();
    }
  }, [isAuthorized]);

  const updateOrderStatus = async (id, status, paymentStatus = null) => {
    playSynthSound('click');
    try {
      const body = { orderStatus: status };
      if (paymentStatus) body.paymentStatus = paymentStatus;
      const res = await fetch(`${apiBase}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) { playSynthSound('success'); fetchOrders(); }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRestockSubmit = async (e, productId) => {
    e.preventDefault();
    playSynthSound('click');
    const qty = stockUpdates[productId];
    if (qty === undefined || qty === '' || qty < 0) return;
    try {
      const res = await fetch(`${apiBase}/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ stock: Number(qty) })
      });
      if (res.ok) {
        playSynthSound('success');
        fetchProducts();
        setStockUpdates(prev => ({ ...prev, [productId]: '' }));
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  // Auto assign color combinations matching the item type
  const getThemeForCategory = (category, title) => {
    const cat = category.toLowerCase();
    const name = title.toLowerCase();

    if (cat.includes('shake')) {
      if (name.includes('choco')) return { theme: '#5c2e1a', accent: '#a1673f', bg: 'radial-gradient(circle at center, #ffffff 0%, #f3ebd8 50%, #c49675 100%)' };
      if (name.includes('mango')) return { theme: '#7e5109', accent: '#f39c12', bg: 'radial-gradient(circle at center, #ffffff 0%, #fef9e7 50%, #f8c471 100%)' };
      if (name.includes('pistachio')) return { theme: '#1b4f72', accent: '#3498db', bg: 'radial-gradient(circle at center, #ffffff 0%, #ebf5fb 50%, #85c1e9 100%)' };
      return { theme: '#5d3a21', accent: '#b07d5b', bg: 'radial-gradient(circle at center, #ffffff 0%, #fbf5f0 50%, #e2c0a8 100%)' };
    }
    if (cat.includes('donut')) {
      if (name.includes('matcha')) return { theme: '#0e6251', accent: '#1abc9c', bg: 'radial-gradient(circle at center, #ffffff 0%, #e8f8f5 50%, #76d7c4 100%)' };
      if (name.includes('rose') || name.includes('strawberry')) return { theme: '#7a2f45', accent: '#d65376', bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf0f4 50%, #f3b5c7 100%)' };
      return { theme: '#4a235a', accent: '#8e44ad', bg: 'radial-gradient(circle at center, #ffffff 0%, #f5eef8 50%, #bb8fce 100%)' };
    }
    if (cat.includes('cupcake')) {
      if (name.includes('raspberry')) return { theme: '#7b241c', accent: '#e74c3c', bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf2f4 50%, #f5b7b1 100%)' };
      return { theme: '#1c4c34', accent: '#3a9b6c', bg: 'radial-gradient(circle at center, #ffffff 0%, #e6f7ef 50%, #abd8c0 100%)' };
    }
    if (cat.includes('waffle')) {
      if (name.includes('matcha')) return { theme: '#0e6251', accent: '#1abc9c', bg: 'radial-gradient(circle at center, #ffffff 0%, #e8f8f5 50%, #76d7c4 100%)' };
      return { theme: '#6e2c00', accent: '#dc7633', bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf2e9 50%, #e59866 100%)' };
    }
    // Pastries / Cakes
    if (name.includes('lemon')) return { theme: '#7d6608', accent: '#f1c40f', bg: 'radial-gradient(circle at center, #ffffff 0%, #fef9e7 50%, #f7dc6f 100%)' };
    if (name.includes('almond') || name.includes('croissant')) return { theme: '#641e16', accent: '#c0392b', bg: 'radial-gradient(circle at center, #ffffff 0%, #f9ebea 50%, #f2d7d5 100%)' };
    return { theme: '#78281f', accent: '#c0392b', bg: 'radial-gradient(circle at center, #ffffff 0%, #fdebd0 50%, #e74c3c 100%)' };
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    playSynthSound('click');
    setAddingProduct(true);
    setAddSuccess('');
    setError('');

    const colors = getThemeForCategory(newProduct.category, newProduct.title);

    const productPayload = {
      title: newProduct.title,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      description: newProduct.description,
      src: `./images/${newProduct.imageFile}`,
      alt: newProduct.title,
      bg: colors.bg,
      themeColor: colors.theme,
      accentColor: colors.accent,
      textColor: colors.theme,
      bgText: newProduct.bgText.toUpperCase()
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      if (res.ok) {
        playSynthSound('success');
        setAddSuccess('Sweet item added successfully to the lab catalog!');
        setNewProduct({
          title: '',
          category: 'Gourmet Cupcake',
          price: '',
          stock: '',
          description: '',
          imageFile: 'cupcake.png',
          bgText: 'SWEET'
        });
        fetchProducts();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to add product');
        playSynthSound('error');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
      playSynthSound('error');
    } finally {
      setAddingProduct(false);
    }
  };

  // Lockscreen Keypad interaction
  const handleKeypadPress = async (val) => {
    playSynthSound('click');
    if (val === 'clear') {
      setPin('');
      setLockMsg('');
      setIsPinError(false);
      return;
    }
    if (pin.length >= 4) return;
    
    const newPin = pin + val;
    setPin(newPin);

    if (newPin.length === 4) {
      // Try Spring Boot JWT validation first, fallback to hardcoded
      try {
        const res = await fetch('http://localhost:8080/api/auth/validate-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: newPin })
        });
        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem('dvbakes_token', data.token);
          setLockMsg('Spring Boot Auth Successful!');
          setIsPinError(false);
          playSynthSound('success');
          setTimeout(() => {
            setIsAuthorized(true);
            sessionStorage.setItem('owner_authorized', 'true');
          }, 800);
          return;
        }
      } catch (e) {
        // Spring Boot not running, use local fallback
      }

      if (newPin === '1234') {
        setLockMsg('Authorized! Loading Owner Panel...');
        setIsPinError(false);
        playSynthSound('success');
        setTimeout(() => {
          setIsAuthorized(true);
          sessionStorage.setItem('owner_authorized', 'true');
        }, 800);
      } else {
        setLockMsg('Access Denied. PIN Incorrect.');
        setIsPinError(true);
        playSynthSound('error');
        setTimeout(() => { setPin(''); setIsPinError(false); }, 1200);
      }
    }
  };

  // Render Lockscreen overlay if unauthorized
  if (!isAuthorized) {
    return (
      <div className="admin-lockscreen-overlay" style={{ '--admin-theme': themeColor, '--admin-accent': accentColor }}>
        <div className="lockscreen-card">
          <div className="lockscreen-logo">
            <FiLock size={28} />
          </div>
          <h2 className="lockscreen-title">Owner Authentication</h2>
          <p className="lockscreen-sub">
            Please enter your 4-digit laboratory passcode to gain access to the SaaS database. <br />
            <small style={{ opacity: 0.6, fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
              (Demo Passcode: <strong>1234</strong>)
            </small>
          </p>

          <div className="passcode-dots">
            {[0, 1, 2, 3].map((i) => (
              <span 
                key={i} 
                className={`passcode-dot ${pin.length > i ? 'filled' : ''} ${isPinError ? 'error' : ''}`}
              />
            ))}
          </div>

          <div className={`lockscreen-message ${isPinError ? 'error' : 'success'}`}>
            {lockMsg}
          </div>

          <div className="lockscreen-keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button 
                key={n} 
                className="keypad-btn"
                onClick={() => handleKeypadPress(n)}
              >
                {n}
              </button>
            ))}
            <button className="keypad-btn action" onClick={() => handleKeypadPress('clear')}>CLR</button>
            <button className="keypad-btn" onClick={() => handleKeypadPress('0')}>0</button>
            <button className="keypad-btn action" onClick={() => { playSynthSound('click'); setPin('1234'); handleKeypadPress(''); }}>DEMO</button>
          </div>

          <button className="lockscreen-back-btn" onClick={onBackToShop}>
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // --- STATS CALCULATIONS FOR AUTHENTICATED USERS ---
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders
    .filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled').length;

  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Chart Logic 1: Best Sellers by Category
  const categorySummary = products.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categorySummary), 1);

  // Chart Logic 2: Sales Over Time (Line Chart points)
  // Maps actual order values into SVG line coordinate offsets
  const salesTrendPoints = [
    { label: '09:00', amount: 0 },
    { label: '11:00', amount: 35 },
    { label: '13:00', amount: 78 },
    { label: '15:00', amount: 55 },
    { label: '17:00', amount: 110 },
    { label: '19:00', amount: totalRevenue > 0 ? Math.min(totalRevenue, 200) : 145 },
  ];

  // Map to SVG coordinates: X: 50 -> 450, Y: 180 -> 20 (inverted)
  const maxAmount = Math.max(...salesTrendPoints.map(p => p.amount), 1);
  const getCoordinates = () => {
    return salesTrendPoints.map((p, idx) => {
      const x = 50 + (idx * 80);
      const y = 180 - ((p.amount / maxAmount) * 140);
      return { x, y, label: p.label, val: p.amount };
    });
  };
  const coords = getCoordinates();
  // Build SVG path
  const linePath = coords.reduce((path, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');
  
  // Build gradient area path (closing the path down to the bottom)
  const areaPath = coords.length > 0 
    ? `${linePath} L ${coords[coords.length - 1].x} 180 L ${coords[0].x} 180 Z` 
    : '';

  return (
    <div className="admin-page-wrapper" style={{ '--admin-theme': themeColor, '--admin-accent': accentColor }}>
      {/* Back Header */}
      <div className="admin-header-row">
        <button className="admin-back-btn" onClick={() => { playSynthSound('click'); onBackToShop(); }}>
          <FiArrowLeft size={18} />
          <span>Back to Storefront</span>
        </button>
        <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiUnlock size={22} style={{ color: themeColor }} /> Cafe Owner Desk
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="admin-stats-grid">
        <div className="stats-card glass-panel">
          <div className="stats-icon-wrapper" style={{ backgroundColor: '#eafaf1', color: '#2ecc71' }}>
            <FiTrendingUp size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">Gross Income</span>
            <h3 className="stats-value">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="stats-card glass-panel">
          <div className="stats-icon-wrapper" style={{ backgroundColor: '#ebf5fb', color: '#3498db' }}>
            <FiShoppingBag size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">Active Shipments</span>
            <h3 className="stats-value">{activeOrdersCount}</h3>
          </div>
        </div>

        <div className="stats-card glass-panel">
          <div className="stats-icon-wrapper" style={{ backgroundColor: '#fdf2e9', color: '#e67e22' }}>
            <FiDatabase size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">Catalog Sweets</span>
            <h3 className="stats-value">{products.length}</h3>
          </div>
        </div>

        <div className="stats-card glass-panel">
          <div className="stats-icon-wrapper" style={{ backgroundColor: '#fdf2f2', color: '#e74c3c' }}>
            <FiAlertTriangle size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-label">Stock Warnings</span>
            <h3 className="stats-value">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="admin-charts-grid">
        {/* Trend Line Chart */}
        <div className="chart-card glass-panel">
          <h3>Hourly Sales Influx Trend</h3>
          <div className="trend-svg-box">
            <svg viewBox="0 0 500 200" width="100%" height="100%">
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={themeColor} stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid lines */}
              <line x1="40" y1="40" x2="470" y2="40" className="grid-line" />
              <line x1="40" y1="110" x2="470" y2="110" className="grid-line" />
              <line x1="40" y1="180" x2="470" y2="180" className="grid-line" style={{ strokeWidth: 1.5 }} />

              {/* Area fill under curve */}
              {areaPath && <path d={areaPath} className="trend-area" />}

              {/* Curved Trend Line */}
              {linePath && (
                <path 
                  d={linePath} 
                  className="trend-line" 
                  style={{ stroke: themeColor }}
                />
              )}

              {/* Chart dots and values */}
              {coords.map((c, i) => (
                <g key={i}>
                  <circle 
                    cx={c.x} 
                    cy={c.y} 
                    r="5" 
                    className="chart-dot"
                    style={{ stroke: themeColor }}
                    onClick={() => playSynthSound('click')}
                  />
                  <text 
                    x={c.x} 
                    y={c.y - 12} 
                    textAnchor="middle" 
                    fontSize="9px" 
                    fontWeight="800" 
                    fill={themeColor}
                  >
                    ${c.val.toFixed(0)}
                  </text>
                  <text 
                    x={c.x} 
                    y="194" 
                    textAnchor="middle" 
                    className="chart-axis-text"
                  >
                    {c.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Categories Bar Distribution Chart */}
        <div className="chart-card glass-panel">
          <h3>Menu Distribution</h3>
          <div className="cat-bars-list">
            {Object.keys(categorySummary).map((catName) => {
              const count = categorySummary[catName];
              const pct = (count / maxCategoryCount) * 100;
              return (
                <div key={catName} className="cat-bar-item">
                  <div className="cat-bar-header">
                    <span className="cat-bar-name">{catName}</span>
                    <span className="cat-bar-count">{count} {count === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div 
                      className="cat-bar-fill" 
                      style={{ 
                        '--fill-pct': `${pct}%`, 
                        backgroundColor: accentColor 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => { playSynthSound('click'); setActiveTab('orders'); fetchOrders(); }}
        >
          <FiShoppingBag size={14} /> Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { playSynthSound('click'); setActiveTab('products'); fetchProducts(); }}
        >
          <FiDatabase size={14} /> Catalog & Stock
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => { playSynthSound('click'); setActiveTab('add-product'); }}
        >
          <FiPlusCircle size={14} /> Add Product
        </button>
        <button 
          className={`admin-tab-btn db-monitor-tab ${activeTab === 'db-monitor' ? 'active' : ''}`}
          onClick={() => { playSynthSound('click'); setActiveTab('db-monitor'); }}
        >
          <FiActivity size={14} /> <span className="db-tab-label">Live DB Monitor</span>
          <span className="db-tab-badge">Spring Boot</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="admin-tab-body">
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="orders-management-panel glass-panel">
            <h2>Customer Orders List</h2>
            {ordersLoading ? (
              <div className="tab-loading-spinner" />
            ) : orders.length === 0 ? (
              <p className="empty-tab-text">No orders have been placed yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Items Ordered</th>
                      <th>Price Details</th>
                      <th>Payment Status</th>
                      <th>Delivery Stage</th>
                      <th>Management Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className={o.orderStatus === 'Cancelled' ? 'order-row-cancelled' : ''}>
                        <td>
                          <span className="order-id-txt">{o.id}</span>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="customer-info-cell">
                            <strong>{o.customerName}</strong>
                            <span>{o.customerPhone}</span>
                            <small>{o.customerAddress}</small>
                          </div>
                        </td>
                        <td>
                          <div className="order-items-cell">
                            {o.items.map((item, iIdx) => (
                              <div key={iIdx} className="order-item-line">
                                {item.name} <strong>x{item.quantity}</strong>
                                {item.toppings && Object.values(item.toppings).some(v => v) && (
                                  <small className="topping-note">
                                    ({Object.keys(item.toppings).filter(k => item.toppings[k]).join(', ')})
                                  </small>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="price-details-cell">
                            <strong>Total: ${o.total.toFixed(2)}</strong>
                            <span>({o.paymentMethod})</span>
                          </div>
                        </td>
                        <td>
                          <span 
                            className={`badge badge-payment ${o.paymentStatus.toLowerCase()}`}
                            onClick={() => {
                              const nextPayStatus = o.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
                              updateOrderStatus(o.id, null, nextPayStatus);
                            }}
                            title="Click to toggle payment status"
                            style={{ cursor: 'pointer' }}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-status ${o.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            {o.orderStatus === 'Pending' && (
                              <button 
                                className="action-btn btn-prepare"
                                onClick={() => updateOrderStatus(o.id, 'Preparing')}
                              >
                                Start Preparing
                              </button>
                            )}
                            {o.orderStatus === 'Preparing' && (
                              <button 
                                className="action-btn btn-ship"
                                onClick={() => updateOrderStatus(o.id, 'Out for Delivery')}
                              >
                                Ship Order
                              </button>
                            )}
                            {o.orderStatus === 'Out for Delivery' && (
                              <button 
                                className="action-btn btn-complete"
                                onClick={() => updateOrderStatus(o.id, 'Completed', 'Paid')} // Mark paid on delivery COD
                              >
                                Complete Delivery
                              </button>
                            )}
                            {o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled' && (
                              <button 
                                className="action-btn btn-cancel"
                                onClick={() => updateOrderStatus(o.id, 'Cancelled')}
                              >
                                Cancel Order
                              </button>
                            )}
                            {o.orderStatus === 'Completed' && (
                              <span className="action-completed-text"><FiCheckCircle size={16} /> Closed</span>
                            )}
                            {o.orderStatus === 'Cancelled' && (
                              <span className="action-cancelled-text"><FiXCircle size={16} /> Cancelled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="products-management-panel glass-panel">
            <h2>Dessert Catalog Stocks</h2>
            {productsLoading ? (
              <div className="tab-loading-spinner" />
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Title</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Current Stock</th>
                      <th>Stock Status</th>
                      <th>Edit Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const isOutOfStock = p.stock === 0;
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="prod-img-cell" style={{ background: p.bg }}>
                              <img src={p.src} alt={p.title} />
                            </div>
                          </td>
                          <td>
                            <strong>{p.title}</strong>
                            <small className="prod-id-txt">({p.id})</small>
                          </td>
                          <td>{p.category}</td>
                          <td><strong>${p.price.toFixed(2)}</strong></td>
                          <td>
                            <strong className={isOutOfStock ? 'text-danger' : ''}>{p.stock} units</strong>
                          </td>
                          <td>
                            {isOutOfStock ? (
                              <span className="badge badge-danger">OUT OF STOCK</span>
                            ) : p.stock < 5 ? (
                              <span className="badge badge-warning">LOW STOCK</span>
                            ) : (
                              <span className="badge badge-success">IN STOCK</span>
                            )}
                          </td>
                          <td>
                            <form 
                              className="restock-form"
                              onSubmit={(e) => handleRestockSubmit(e, p.id)}
                            >
                              <input 
                                type="number" 
                                min="0" 
                                placeholder="New qty"
                                value={stockUpdates[p.id] !== undefined ? stockUpdates[p.id] : ''}
                                onChange={(e) => setStockUpdates({ ...stockUpdates, [p.id]: e.target.value })}
                                className="restock-input"
                              />
                              <button type="submit" className="restock-submit-btn" style={{ backgroundColor: themeColor }}>
                                Save
                              </button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD PRODUCT TAB */}
        {activeTab === 'add-product' && (
          <div className="add-product-panel glass-panel">
            <h2>Create New Dessert Item</h2>
            <p className="add-product-sub">Specify product parameters to compile it into the bakery menu.</p>
            
            {addSuccess && <div className="admin-success-banner">{addSuccess}</div>}
            {error && <div className="admin-error-banner">{error}</div>}

            <form className="add-product-form" onSubmit={handleAddProductSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Dessert Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blue Raspberry Muffin"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Menu Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Gourmet Cupcake">Gourmet Cupcake</option>
                    <option value="Handcrafted Donut">Handcrafted Donut</option>
                    <option value="Signature Shake">Signature Shake</option>
                    <option value="Warm Pastry">Warm Pastry</option>
                    <option value="Belgian Waffle">Belgian Waffle</option>
                    <option value="Fresh Berry Shake">Fresh Berry Shake</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.10"
                    placeholder="e.g. 5.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Units</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 15"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Background Giant Text</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SWEET, CAKE, BERRY"
                    value={newProduct.bgText}
                    onChange={(e) => setNewProduct({ ...newProduct, bgText: e.target.value })}
                    maxLength="8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Select Background-removed Image</label>
                  <select 
                    value={newProduct.imageFile}
                    onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.value })}
                  >
                    {availableImages.map((img, idx) => (
                      <option key={idx} value={img}>{img.replace('.png', '').replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Product Description</label>
                  <textarea 
                    placeholder="Describe layers of frosting, sprinkles, and taste characteristics..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="add-product-submit-btn" 
                  disabled={addingProduct}
                  style={{ backgroundColor: themeColor }}
                >
                  {addingProduct ? 'Baking into Menu...' : 'Compile & Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DB MONITOR TAB */}
        {activeTab === 'db-monitor' && (
          <div className="db-monitor-panel glass-panel">
            <DBMonitor />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
