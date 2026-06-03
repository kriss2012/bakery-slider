import React, { useState } from 'react';
import './CartDrawer.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiCheck } from 'react-icons/fi';

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  themeColor = '#5c2e1a', 
  accentColor = '#a1673f' 
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 20 || subtotal === 0 ? 0 : 2.99;
  const total = subtotal + tax + shipping;

  const handleCheckoutClick = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    await onCheckout();
    setIsCheckingOut(false);
    setCheckoutSuccess(true);
  };

  const handleCloseSuccess = () => {
    setCheckoutSuccess(false);
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
            onClick={checkoutSuccess ? handleCloseSuccess : onClose}
          />

          {/* Drawer container */}
          <motion.div 
            className="cart-drawer-container"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {checkoutSuccess ? (
              /* Success Panel */
              <motion.div 
                className="checkout-success-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="success-icon-circle" style={{ backgroundColor: themeColor }}>
                  <FiCheck size={40} color="#fff" />
                </div>
                <h3 className="success-title" style={{ color: themeColor }}>Order Confirmed!</h3>
                <p className="success-message">
                  Your delicious treats are being freshly prepared in the Bakery Lab. We'll notify you when they are ready.
                </p>
                <button 
                  className="success-close-btn"
                  onClick={handleCloseSuccess}
                  style={{ backgroundColor: themeColor }}
                >
                  Continue Browsing
                </button>
              </motion.div>
            ) : (
              /* Main Cart Panel */
              <div className="cart-content-flex">
                {/* Header */}
                <div className="cart-header">
                  <div className="cart-header-title">
                    <FiShoppingBag size={22} style={{ color: themeColor }} />
                    <span className="cart-title-text" style={{ color: themeColor }}>Your Cart</span>
                    <span className="cart-header-count">{items.length}</span>
                  </div>
                  <button className="cart-close-btn" onClick={onClose} aria-label="Close Cart">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Items list */}
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
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus size={12} />
                              </</button>
                              <span className="qty-val">{item.quantity}</span>
                              <button 
                                className="qty-btn"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <FiPlus size={12} />
                              </</button>
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

                {/* Footer section (Summary + checkout button) */}
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
                    {shipping > 0 && (
                      <div className="shipping-hint">
                        Add ${(20 - subtotal).toFixed(2)} more for free shipping!
                      </div>
                    )}
                    
                    <div className="divider-line" />
                    
                    <div className="total-row">
                      <span>Total</span>
                      <span className="total-val" style={{ color: themeColor }}>${total.toFixed(2)}</span>
                    </div>

                    <button 
                      className="checkout-btn" 
                      onClick={handleCheckoutClick}
                      disabled={isCheckingOut}
                      style={{ 
                        backgroundColor: themeColor,
                        boxShadow: `0 8px 25px ${themeColor}30` 
                      }}
                    >
                      {isCheckingOut ? (
                        <div className="loading-dots">
                          <span>Processing</span>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                        </div>
                      ) : (
                        `Checkout - $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
