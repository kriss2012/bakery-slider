import React, { useState } from 'react';
import './CartDrawer.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiCheck, FiCreditCard, FiSmartphone, FiUser, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { apiPost } from '../api';

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckoutSuccess, // Callback with placed order object
  themeColor = '#5c2e1a', 
  accentColor = '#a1673f' 
}) => {
  // Checkout stages: 'cart' -> 'details' -> 'upi-gateway'
  const [checkoutStage, setCheckoutStage] = useState('cart');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or UPI
  
  // States for UPI simulation
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);

  // States for API requests
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 20 || subtotal === 0 ? 0 : 2.99;
  const total = subtotal + tax + shipping;

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      setErrorMessage('Please fill in all delivery details.');
      return;
    }
    setErrorMessage('');
    if (paymentMethod === 'UPI') {
      setCheckoutStage('upi-gateway');
    } else {
      placeOrder('COD', 'Pending');
    }
  };

  const placeOrder = async (method, payStatus) => {
    setIsPlacingOrder(true);
    setErrorMessage('');
    const { data, error } = await apiPost('/api/orders', {
      cartId: cart.cartId,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod: method,
      paymentStatus: payStatus,
    });
    setIsPlacingOrder(false);

    if (data) {
      // Reset form states
      setCheckoutStage('cart');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setPaymentMethod('COD');
      // Notify parent with placed order
      onCheckoutSuccess(data);
    } else {
      setErrorMessage(error || 'Failed to place order. Check stock levels.');
      setCheckoutStage('cart');
    }
  };

  const simulateUpiPayment = async () => {
    setIsUpiVerifying(true);
    // Simulate gateway handshakes
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUpiVerifying(false);
    // Place order as Paid
    await placeOrder('UPI', 'Paid');
  };

  const handleCloseClick = () => {
    // Reset stage
    setCheckoutStage('cart');
    setErrorMessage('');
    onClose();
  };

  // Convert toppings map to string for displaying
  const formatToppings = (toppings) => {
    if (!toppings) return '';
    const active = Object.keys(toppings).filter(key => toppings[key]);
    if (active.length === 0) return 'No toppings';
    return active.map(t => t.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseClick}
          />

          {/* Drawer container */}
          <motion.div 
            className="cart-drawer-container"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="cart-header">
              <div className="cart-header-title">
                <FiShoppingBag size={22} style={{ color: themeColor }} />
                <span className="cart-title-text" style={{ color: themeColor }}>
                  {checkoutStage === 'cart' && 'Your Sweet Basket'}
                  {checkoutStage === 'details' && 'Delivery Info'}
                  {checkoutStage === 'upi-gateway' && 'UPI Online Checkout'}
                </span>
                {checkoutStage === 'cart' && <span className="cart-header-count">{items.length}</span>}
              </div>
              <button className="cart-close-btn" onClick={handleCloseClick} aria-label="Close Cart">
                <FiX size={24} />
              </button>
            </div>

            {errorMessage && (
              <div className="cart-error-banner">
                {errorMessage}
              </div>
            )}

            {/* STAGE 1: SHOPPING CART LIST */}
            {checkoutStage === 'cart' && (
              <div className="cart-content-flex">
                <div className="cart-items-wrapper">
                  {items.length === 0 ? (
                    <div className="empty-cart-message">
                      <FiShoppingBag size={48} className="empty-cart-icon" />
                      <p className="empty-title">Your cart is empty</p>
                      <p className="empty-subtitle">Add some fresh bakery delicacies to get started!</p>
                      <button 
                        className="empty-shop-btn" 
                        onClick={onClose}
                        style={{ borderColor: themeColor, color: themeColor }}
                      >
                        Start Customizing
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <motion.div 
                        key={item.id}
                        className="cart-item-card"
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                      >
                        <div className="cart-item-thumb" style={{ background: `radial-gradient(circle, #fff 0%, ${accentColor}15 100%)` }}>
                          <img src={item.src} alt={item.name} className="cart-item-image" />
                        </div>
                        
                        <div className="cart-item-info">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <p className="cart-item-toppings">
                            {formatToppings(item.toppings)}
                          </p>
                          <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                          
                          <div className="cart-item-qty-row">
                            <div className="qty-controls">
                              <button 
                                className="qty-btn"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="qty-val">{item.quantity}</span>
                              <button 
                                className="qty-btn"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            
                            <button 
                              className="remove-item-btn"
                              onClick={() => onRemoveItem(item.id)}
                              aria-label="Remove item"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="cart-footer">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span className="summary-val">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Est. Taxes (8%)</span>
                      <span className="summary-val">${tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="summary-val">
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="divider-line" />
                    
                    <div className="total-row">
                      <span>Total</span>
                      <span className="total-val" style={{ color: themeColor }}>${total.toFixed(2)}</span>
                    </div>

                    <button 
                      className="checkout-btn" 
                      onClick={() => setCheckoutStage('details')}
                      style={{ 
                        backgroundColor: themeColor,
                        boxShadow: `0 8px 25px ${themeColor}30` 
                      }}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 2: CUSTOMER DELIVERY DETAILS */}
            {checkoutStage === 'details' && (
              <div className="cart-content-flex">
                <form className="checkout-details-form" onSubmit={handleDetailsSubmit}>
                  <div className="form-group-field">
                    <label><FiUser size={16} /> Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-field">
                    <label><FiPhone size={16} /> Contact Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +1 234 567 8900" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-field">
                    <label><FiMapPin size={16} /> Delivery Address</label>
                    <textarea 
                      placeholder="Street address, apartment, city, zip code..." 
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="payment-method-selection">
                    <span className="section-small-title">Select Payment Mode</span>
                    <div className="payment-options-grid">
                      <div 
                        className={`payment-opt-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('COD')}
                        style={{ '--pay-theme': themeColor }}
                      >
                        <FiDollarSign size={20} />
                        <div>
                          <strong>Pay on Delivery</strong>
                          <span>Cash or card on arrival</span>
                        </div>
                      </div>

                      <div 
                        className={`payment-opt-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('UPI')}
                        style={{ '--pay-theme': themeColor }}
                      >
                        <FiSmartphone size={20} />
                        <div>
                          <strong>UPI QR Payment</strong>
                          <span>Instant verification</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-details-footer">
                    <button 
                      type="button" 
                      className="details-back-btn"
                      onClick={() => setCheckoutStage('cart')}
                    >
                      Back to Cart
                    </button>
                    <button 
                      type="submit" 
                      className="details-submit-btn"
                      disabled={isPlacingOrder}
                      style={{ backgroundColor: themeColor }}
                    >
                      {isPlacingOrder ? (
                        'Processing order...'
                      ) : paymentMethod === 'UPI' ? (
                        'Proceed to Pay'
                      ) : (
                        `Confirm Order - $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STAGE 3: UPI SIMULATION GATEWAY */}
            {checkoutStage === 'upi-gateway' && (
              <div className="cart-content-flex upi-gateway-flex">
                <div className="upi-info-card glass-card">
                  <span className="upi-merchant">DVBAKES CAFE PORTAL</span>
                  <h3 className="upi-amount">${total.toFixed(2)}</h3>
                  <p className="upi-meta">Merchant UPI ID: <span className="upi-id">dvbakes@ybl</span></p>
                </div>

                <div className="upi-qr-scanner-box">
                  <div className="qr-image-placeholder">
                    {/* Simulated elegant QR code visual */}
                    <div className="qr-pattern-box">
                      <div className="qr-anchor top-left" />
                      <div className="qr-anchor top-right" />
                      <div className="qr-anchor bottom-left" />
                      <div className="qr-grid-dots" />
                    </div>
                    <div className="qr-scanning-laser" style={{ backgroundColor: themeColor }} />
                  </div>
                  <p className="qr-caption">Scan QR code using Google Pay, PhonePe, Paytm, or BHIM app</p>
                </div>

                <div className="upi-sim-actions">
                  <button 
                    className="upi-cancel-btn"
                    onClick={() => setCheckoutStage('details')}
                    disabled={isUpiVerifying}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    className="upi-pay-btn"
                    onClick={simulateUpiPayment}
                    disabled={isUpiVerifying}
                    style={{ backgroundColor: themeColor }}
                  >
                    {isUpiVerifying ? (
                      <div className="loading-dots">
                        <span>Verifying</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                      </div>
                    ) : (
                      'Simulate Successful Payment'
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
