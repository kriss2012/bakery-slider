import React, { useState, useEffect } from 'react';
import './OrderTracker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckCircle, FiTruck, FiPackage, FiSearch, FiArrowLeft, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import { apiFetch, API_BASE } from '../api';

const OrderTracker = ({ orderId: initialOrderId, onBackToShop, themeColor = '#5c2e1a', accentColor = '#a1673f' }) => {
  const [orderId, setOrderId] = useState(initialOrderId || localStorage.getItem('lastOrderId') || '');
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const fetchOrderDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    const { data, error } = await apiFetch(`/api/orders/${id.trim()}`);
    if (data) {
      setOrder(data);
      localStorage.setItem('lastOrderId', data.id);
      setOrderId(data.id);
    } else {
      setError(error || 'Order not found');
      setOrder(null);
    }
    setLoading(false);
  };

  // Poll order details every 10 seconds for real-time status updates
  useEffect(() => {
    fetchOrderDetails(orderId);
    const pollInterval = setInterval(() => {
      if (orderId && !loading) {
        // Silent background poll using apiFetch
        apiFetch(`/api/orders/${orderId.trim()}`)
          .then(({ data }) => { if (data) setOrder(data); })
          .catch(err => console.warn('Failed to poll order status:', err));
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  // Timer countdown logic
  useEffect(() => {
    if (!order || order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled') {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const expiresAt = new Date(order.timerExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchOrderDetails(searchInput);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get active step index based on order status
  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Preparing': return 1;
      case 'Out for Delivery': return 2;
      case 'Completed': return 3;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Placed', icon: <FiShoppingBag size={20} />, desc: 'Order received' },
    { label: 'Preparing', icon: <FiPackage size={20} />, desc: 'Baking fresh in lab' },
    { label: 'On The Way', icon: <FiTruck size={20} />, desc: 'Out for delivery' },
    { label: 'Delivered', icon: <FiCheckCircle size={20} />, desc: 'Enjoy your sweets!' },
  ];

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === 'Cancelled';

  // Compute progress line percentage
  const progressPct = isCancelled ? 0 : (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="tracker-page-wrapper" style={{ '--tracker-theme': themeColor, '--tracker-accent': accentColor }}>
      {/* Tracker Header */}
      <div className="tracker-header">
        <button className="tracker-back-btn" onClick={onBackToShop}>
          <FiArrowLeft size={18} />
          <span>Back to Bakery Lab</span>
        </button>
        
        {/* Search Bar for manual Order ID lookup */}
        <form className="tracker-search-form" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Track other Order ID (e.g. ORDER-12345)" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="tracker-search-input"
          />
          <button type="submit" className="tracker-search-btn" style={{ backgroundColor: themeColor }}>
            <FiSearch size={18} />
          </button>
        </form>
      </div>

      <div className="tracker-content-container">
        {loading && !order ? (
          <div className="tracker-loading">
            <div className="tracker-spinner" style={{ borderColor: themeColor }} />
            <p>Locating your sweet shipment...</p>
          </div>
        ) : error ? (
          <div className="tracker-error-card">
            <h3>No Order Found</h3>
            <p className="error-msg">{error}</p>
            <p className="error-suggestion">Double-check the Order ID and try again, or place a new order from the lab.</p>
            <button className="tracker-shop-btn" onClick={onBackToShop} style={{ backgroundColor: themeColor }}>
              Browse Sweet Menu
            </button>
          </div>
        ) : order ? (
          <div className="tracker-grid">
            {/* Left side: Status timeline & Countdown */}
            <div className="tracker-main-card glass-panel">
              <div className="order-meta-info">
                <div>
                  <span className="order-id-badge" style={{ backgroundColor: `${accentColor}15`, color: themeColor }}>
                    ID: {order.id}
                  </span>
                  <p className="order-placed-time">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="order-price-badge" style={{ color: themeColor }}>
                  Total Paid: ${order.total.toFixed(2)}
                </div>
              </div>

              {/* Status Header */}
              {isCancelled ? (
                <div className="status-cancellation-banner">
                  <h3>Order Cancelled</h3>
                  <p>This order has been cancelled by the bakery manager. Please contact support or place a new order.</p>
                </div>
              ) : (
                <div className="status-countdown-section">
                  <div className="countdown-ring-container">
                    <div className="countdown-ring" style={{ borderColor: timeLeft > 0 ? themeColor : '#2ecc71' }}>
                      <FiClock size={32} className="clock-pulse" style={{ color: timeLeft > 0 ? themeColor : '#2ecc71' }} />
                      <span className="countdown-time">
                        {order.orderStatus === 'Completed' ? 'Delivered' : formatTime(timeLeft)}
                      </span>
                      <span className="countdown-label">
                        {order.orderStatus === 'Completed' ? 'Freshly Delivered' : 'Estimated Delivery'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="countdown-text-info">
                    <h2 className="status-main-heading">
                      {order.orderStatus === 'Pending' && "Waiting for confirmation..."}
                      {order.orderStatus === 'Preparing' && "Whisking & Baking in Lab..."}
                      {order.orderStatus === 'Out for Delivery' && "Sweets are on the Way!"}
                      {order.orderStatus === 'Completed' && "Delivered & Unpacked!"}
                    </h2>
                    <p className="status-sub-heading">
                      {order.orderStatus === 'Pending' && "The Chef is reviewing your order items. Hang tight!"}
                      {order.orderStatus === 'Preparing' && "Your items are being customized with toppings and freshly baked."}
                      {order.orderStatus === 'Out for Delivery' && "Our courier has picked up your warm cakes and is driving to your address."}
                      {order.orderStatus === 'Completed' && "We hope you enjoy our freshly prepared bakery masterpieces!"}
                    </p>
                  </div>
                </div>
              )}

              {/* Stepper Timeline */}
              {!isCancelled && (
                <div className="tracker-stepper">
                  <div className="stepper-line-bg">
                    <div 
                      className="stepper-line-fill" 
                      style={{ 
                        width: `${progressPct}%`, 
                        backgroundColor: themeColor 
                      }} 
                    />
                  </div>
                  
                  <div className="stepper-steps-row">
                    {steps.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isActive = idx === currentStep;
                      return (
                        <div 
                          key={idx} 
                          className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                          <div 
                            className="step-icon-circle"
                            style={{ 
                              backgroundColor: isCompleted || isActive ? themeColor : '#fff',
                              color: isCompleted || isActive ? '#fff' : '#8c7b72',
                              borderColor: isCompleted || isActive ? themeColor : 'rgba(92, 46, 26, 0.2)'
                            }}
                          >
                            {step.icon}
                          </div>
                          <span className="step-label-text">{step.label}</span>
                          <span className="step-desc-text">{step.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Summary & Details */}
            <div className="tracker-side-panel">
              {/* Delivery Details Card */}
              <div className="tracker-side-card glass-panel">
                <h3>Delivery Details</h3>
                <div className="delivery-details-info">
                  <div className="info-detail-block">
                    <span className="detail-label">Deliver To</span>
                    <span className="detail-value">{order.customerName}</span>
                  </div>
                  <div className="info-detail-block">
                    <span className="detail-label">Phone Contact</span>
                    <span className="detail-value">{order.customerPhone}</span>
                  </div>
                  <div className="info-detail-block">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{order.customerAddress}</span>
                  </div>
                  <div className="info-detail-block">
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value">
                      {order.paymentMethod === 'UPI' ? 'UPI Online Payment' : 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <div className="info-detail-block">
                    <span className="detail-label">Payment Status</span>
                    <span 
                      className="detail-value status-badge"
                      style={{ 
                        backgroundColor: order.paymentStatus === 'Paid' ? '#e8f8f5' : '#fef9e7',
                        color: order.paymentStatus === 'Paid' ? '#2ecc71' : '#f39c12'
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="tracker-side-card glass-panel items-list-card">
                <h3>Your Sweet Basket</h3>
                <div className="basket-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="basket-item-row">
                      <div className="basket-item-thumb" style={{ background: `radial-gradient(circle, #fff 0%, ${accentColor}10 100%)` }}>
                        <img src={item.src} alt={item.name} />
                      </div>
                      <div className="basket-item-details">
                        <h4>{item.name}</h4>
                        <p className="basket-item-qty">Qty: {item.quantity}</p>
                        {item.toppings && Object.values(item.toppings).some(v => v) && (
                          <p className="basket-item-topps">
                            + {Object.keys(item.toppings).filter(k => item.toppings[k]).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="basket-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="basket-price-summary">
                  <div className="price-summary-row">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-summary-row">
                    <span>Tax (8%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="price-summary-row">
                    <span>Delivery</span>
                    <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="price-summary-row total-row-bold" style={{ color: themeColor }}>
                    <span>Total Amount</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="tracker-empty-card">
            <FiClock size={64} style={{ color: themeColor, opacity: 0.5 }} />
            <h3>No Active Orders</h3>
            <p>You don't have any orders listed in this session yet.</p>
            <button className="tracker-shop-btn" onClick={onBackToShop} style={{ backgroundColor: themeColor }}>
              Go Order Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracker;
