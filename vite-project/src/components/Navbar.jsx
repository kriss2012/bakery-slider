import React, { useState } from 'react';
import './Navbar.css';
import { FiShoppingBag, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <a href="/" className="nav-brand">
          DvBakes<span className="brand-dot">.</span>
        </a>

        {/* Desktop Menu */}
        <ul className="nav-items-desktop">
          <li>
            <a href="#home" className="nav-link active">Home</a>
            <span className="active-line"></span>
          </li>
          <li>
            <a href="#menu" className="nav-link">Menu</a>
          </li>
          <li>
            <a href="#customizer" className="nav-link">Bakery Lab</a>
          </li>
          <li>
            <a href="#about" className="nav-link">Our Story</a>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Favorites">
            <FiHeart size={20} />
          </button>
          
          <button className="icon-btn cart-btn" aria-label="Cart">
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

          <button className="nav-button-order">
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
              <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
              <li><a href="#menu" onClick={() => setIsOpen(false)}>Menu</a></li>
              <li><a href="#customizer" onClick={() => setIsOpen(false)}>Bakery Lab</a></li>
              <li><a href="#about" onClick={() => setIsOpen(false)}>Our Story</a></li>
              <li>
                <button className="mobile-order-btn">Order Now</button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
