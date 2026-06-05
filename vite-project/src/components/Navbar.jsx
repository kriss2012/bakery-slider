import React, { useState } from 'react';
import './Navbar.css';
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiCheckSquare, FiUserCheck, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0, onCartClick, currentView = 'shop', onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (e, view) => {
    e.preventDefault();
    if (onViewChange) {
      onViewChange(view);
    }
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <a href="/" className="nav-brand" onClick={(e) => handleLinkClick(e, 'shop')}>
          DvBakes<span className="brand-dot">.</span>
        </a>

        {/* Desktop Menu */}
        <ul className="nav-items-desktop">
          <li>
            <a 
              href="#home" 
              className={`nav-link ${currentView === 'shop' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'shop')}
            >
              Bakery Lab
            </a>
            {currentView === 'shop' && <span className="active-line"></span>}
          </li>
          
          <li>
            <a 
              href="#tracker" 
              className={`nav-link ${currentView === 'tracker' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'tracker')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FiClock size={14} /> Track Order
              </span>
            </a>
            {currentView === 'tracker' && <span className="active-line"></span>}
          </li>

          <li>
            <a 
              href="#admin" 
              className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'admin')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FiUserCheck size={14} /> Owner Desk
              </span>
            </a>
            {currentView === 'admin' && <span className="active-line"></span>}
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Favorites" onClick={(e) => handleLinkClick(e, 'shop')}>
            <FiHeart size={20} />
          </button>
          
          <button className="icon-btn cart-btn" aria-label="Cart" onClick={onCartClick}>
            <FiShoppingBag size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="cart-badge"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button className="nav-button-order" onClick={onCartClick}>
            Order Now
          </button>

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle icon-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-drawer"
          >
            <ul className="nav-items-mobile">
              <li>
                <a 
                  href="#home" 
                  className={currentView === 'shop' ? 'active' : ''} 
                  onClick={(e) => handleLinkClick(e, 'shop')}
                >
                  Bakery Lab
                </a>
              </li>
              <li>
                <a 
                  href="#tracker" 
                  className={currentView === 'tracker' ? 'active' : ''} 
                  onClick={(e) => handleLinkClick(e, 'tracker')}
                >
                  Track Order
                </a>
              </li>
              <li>
                <a 
                  href="#admin" 
                  className={currentView === 'admin' ? 'active' : ''} 
                  onClick={(e) => handleLinkClick(e, 'admin')}
                >
                  Owner Desk
                </a>
              </li>
              <li>
                <button 
                  className="mobile-order-btn" 
                  onClick={() => { setIsOpen(false); onCartClick(); }}
                >
                  Order Now
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
