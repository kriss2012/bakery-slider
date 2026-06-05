import React, { useState, useEffect } from 'react';
import './AdminPortal.css';
import { 
  FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle, 
  FiDatabase, FiPlusCircle, FiTrendingUp, FiArrowLeft, FiAlertTriangle, FiDollarSign 
} from 'react-icons/fi';

const AdminPortal = ({ onBackToShop, themeColor = '#5c2e1a', accentColor = '#a1673f' }) => {
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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
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
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const updateOrderStatus = async (id, status, paymentStatus = null) => {
    try {
      const body = { orderStatus: status };
      if (paymentStatus) {
        body.paymentStatus = paymentStatus;
      }
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRestockSubmit = async (e, productId) => {
    e.preventDefault();
    const qty = stockUpdates[productId];
    if (qty === undefined || qty === '' || qty < 0) return;

    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(qty) })
      });
      if (res.ok) {
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
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setAddingProduct(false);
    }
  };

  // Stats calculation
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders
    .filter(o => o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled').length;

  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="admin-page-wrapper" style={{ '--admin-theme': themeColor, '--admin-accent': accentColor }}>
      {/* Back Header */}
      <div className="admin-header-row">
        <button className="admin-back-btn" onClick={onBackToShop}>
          <FiArrowLeft size={18} />
          <span>Back to Storefront</span>
        </button>
        <h1 className="admin-page-title">Cafe Owner Desk</h1>
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

      {/* Tabs Selector */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => { setActiveTab('orders'); fetchOrders(); }}
        >
          Manage Customer Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); fetchProducts(); }}
        >
          Bake Catalog & Stock
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          Add New Dessert Item
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
      </div>
    </div>
  );
};

export default AdminPortal;
