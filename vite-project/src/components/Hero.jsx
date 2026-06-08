import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import AdminPortal from './AdminPortal';
import OrderTracker from './OrderTracker';
import { apiFetch, apiPost, apiDelete } from '../api';
import { FaArrowLeft, FaArrowRight, FaStar, FaPlus, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Resilient Fallback Data in case backend is offline
const FALLBACK_SLIDES = [
  {
    id: 'choco-bliss',
    src: './images/choco.png',
    alt: 'Chocolate Shake',
    title: 'Velvet Choco Bliss',
    category: 'Signature Shake',
    price: 6.99,
    rating: 4.9,
    reviews: 124,
    stock: 12,
    description: 'Dive into layers of rich cocoa, smooth cream, and a swirl of happiness. Our signature chocolate shake is made to melt your heart and satisfy your cravings.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f3ebd8 50%, #c49675 100%)',
    themeColor: '#5c2e1a',
    accentColor: '#a1673f',
    textColor: '#3a2b23',
    specs: [
      { label: "Rich Cocoa", value: "85%" },
      { label: "Milk Type", value: "Oat Milk" },
      { label: "Calories", value: "320 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Dutch Cocoa Powder', 'Belgian Chocolate Chunks', 'Organic Oat Milk', 'Brown Sugar Cane', 'Gourmet Whipped Cream'],
    nutrition: [
      { name: 'Carbs', percentage: 65 },
      { name: 'Fats', percentage: 45 },
      { name: 'Proteins', percentage: 35 },
      { name: 'Sugars', percentage: 25 }
    ],
    bgText: 'CHOCO'
  },
  {
    id: 'mint-cupcake',
    src: './images/cupcake.png',
    alt: 'Cupcake',
    title: 'Minty Cupcake Cloud',
    category: 'Gourmet Cupcake',
    price: 4.50,
    rating: 4.8,
    reviews: 98,
    stock: 8,
    description: 'A swirl of vanilla, a dash of mint, and the fluffiest cupcake you have ever met. Light, creamy, and dreamy in every single bite.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #e6f7ef 50%, #abd8c0 100%)',
    themeColor: '#1c4c34',
    accentColor: '#3a9b6c',
    textColor: '#1a3327',
    specs: [
      { label: "Gluten-free", value: "No" },
      { label: "Frosting", value: "Mint Buttercream" },
      { label: "Calories", value: "240 kcal" },
      { label: "Bake Temp", value: "180°C" }
    ],
    ingredients: ['Organic Wheat Flour', 'Madagascar Vanilla Extract', 'Fresh Mint Leaves', 'Swiss Meringue Buttercream', 'Sugar Pearls'],
    nutrition: [
      { name: 'Carbs', percentage: 70 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 12 },
      { name: 'Sugars', percentage: 55 }
    ],
    bgText: 'SWEET'
  },
  {
    id: 'blueberry-dream',
    src: './images/blueberry.png',
    alt: 'Blueberry Shake',
    title: 'Berrylicious Dream',
    category: 'Fresh Berry Shake',
    price: 7.25,
    rating: 4.9,
    reviews: 146,
    stock: 15,
    description: 'Bursting with real wild blueberries, whipped cream, and a whole lot of magic. This one’s made to refresh, delight, and impress.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f4e8fa 50%, #caa4db 100%)',
    themeColor: '#4f2b5c',
    accentColor: '#8a4c9c',
    textColor: '#361d3f',
    specs: [
      { label: "Berries", value: "Wild Organic" },
      { label: "Milk Type", value: "Almond Milk" },
      { label: "Calories", value: "290 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Wild Organic Blueberries', 'Unsweetened Almond Milk', 'Raw Clover Honey', 'Chia Seeds', 'Greek Vanilla Yogurt'],
    nutrition: [
      { name: 'Carbs', percentage: 50 },
      { name: 'Fats', percentage: 22 },
      { name: 'Proteins', percentage: 40 },
      { name: 'Sugars', percentage: 18 }
    ],
    bgText: 'BERRY'
  },
  {
    id: 'strawberry-donut',
    src: './images/donut.png',
    alt: 'Donut',
    title: 'Sugar Glazed Hug',
    category: 'Handcrafted Donut',
    price: 3.99,
    rating: 4.7,
    reviews: 112,
    stock: 20,
    description: 'Soft, fluffy, and coated in pink sweetness. Our custom strawberry-glazed donut is a cuddle disguised as a delicious snack.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf0f4 50%, #f3b5c7 100%)',
    themeColor: '#7a2f45',
    accentColor: '#d65376',
    textColor: '#421a25',
    specs: [
      { label: "Glaze", value: "Strawberry Glaze" },
      { label: "Baked Type", value: "Fluffy Yeast" },
      { label: "Calories", value: "190 kcal" },
      { label: "Freshness", value: "24 Hours" }
    ],
    ingredients: ['Wheat Flour Blend', 'Active Yeast', 'Strawberry Nectar Glaze', 'Rainbow Sugar Sprinkles', 'Vanilla Extract'],
    nutrition: [
      { name: 'Carbs', percentage: 75 },
      { name: 'Fats', percentage: 48 },
      { name: 'Proteins', percentage: 15 },
      { name: 'Sugars', percentage: 40 }
    ],
    bgText: 'DONUT'
  }
];

const Hero = () => {
  // Web Audio API synthesizer for micro-interactions
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
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'bubble') {
        // Soft bubble-pop trigger sound
        const playBubble = (time, pitch) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, ctx.currentTime + time);
          osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, ctx.currentTime + time + 0.12);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + time);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.12);
          osc.start(ctx.currentTime + time);
          osc.stop(ctx.currentTime + time + 0.12);
        };
        playBubble(0, 400);
        playBubble(0.06, 500);
        playBubble(0.12, 650);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'slide') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
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
        playNote(523.25, 0, 0.12);
        playNote(659.25, 0.06, 0.12);
        playNote(783.99, 0.12, 0.12);
        playNote(987.77, 0.18, 0.22);
      }
    } catch (e) {
      console.warn("Web Audio failed to execute:", e);
    }
  };

  const [products, setProducts] = useState(FALLBACK_SLIDES);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // details, ingredients, nutrition
  
  // Views: 'shop' | 'admin' | 'tracker'
  const [view, setView] = useState('shop');
  const [activeOrderId, setActiveOrderId] = useState(localStorage.getItem('lastOrderId') || '');

  // Cart Backend States
  const [cart, setCart] = useState({ items: [] });
  const [cartId, setCartId] = useState(localStorage.getItem('cartId') || '');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeToppings, setActiveToppings] = useState({
    sprinkles: false,
    chocoChips: false,
    mintLeaves: false,
    marshmallows: false,
  });
  const [particles, setParticles] = useState([]);
  
  const toppingTimeouts = useRef({});

  // Fetch products from backend API
  const fetchProducts = async () => {
    const { data, error } = await apiFetch('/api/products');
    if (data && Array.isArray(data)) {
      const parsedData = data.map(p => ({
        ...p,
        specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs || [],
        ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients || [],
        nutrition: typeof p.nutrition === 'string' ? JSON.parse(p.nutrition) : p.nutrition || []
      }));
      setProducts(parsedData);
    } else {
      console.warn('Could not fetch products from backend, using fallbacks:', error);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    initApp();
  }, []);

  const fetchCart = async () => {
    const path = cartId ? `/api/cart?cartId=${cartId}` : '/api/cart';
    const { data } = await apiFetch(path);
    if (data) {
      setCart(data);
      if (data.cartId) {
        localStorage.setItem('cartId', data.cartId);
        setCartId(data.cartId);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [cartId]);

  const activeSlide = products[index] || FALLBACK_SLIDES[0];

  // Mouse Parallax values using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 22 };
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  
  // Parallax elements
  const textParallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), springConfig);
  const textParallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]), springConfig);

  const imageParallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), springConfig);
  const imageParallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleNext = () => {
    playSynthSound('slide');
    setDirection(1);
    setIndex((prev) => (prev + 1) % products.length);
    resetToppings();
  };

  const handlePrev = () => {
    playSynthSound('slide');
    setDirection(-1);
    setIndex((prev) => (prev - 1 + products.length) % products.length);
    resetToppings();
  };

  const resetToppings = () => {
    // Clear all scheduled timeouts for toppings animations
    Object.values(toppingTimeouts.current).forEach(clearTimeout);
    toppingTimeouts.current = {};
    
    setActiveToppings({
      sprinkles: false,
      chocoChips: false,
      mintLeaves: false,
      marshmallows: false,
    });
    setParticles([]);
  };

  const toggleTopping = (topping) => {
    playSynthSound('pop');
    setActiveToppings((prev) => {
      const nextState = !prev[topping];
      
      // If toggled ON:
      if (nextState) {
        // Generate falling particles
        const newParticles = Array.from({ length: 25 }).map((_, i) => ({
          id: `${topping}-${Date.now()}-${i}`,
          type: topping,
          left: `${15 + Math.random() * 70}%`,
          delay: Math.random() * 1.5,
          scale: 0.6 + Math.random() * 0.8,
          rotation: Math.random() * 360,
          speed: 1.5 + Math.random() * 2
        }));
        setParticles((prevP) => [...prevP, ...newParticles]);

        // Auto stop particle animation and untoggle after 5 seconds
        if (toppingTimeouts.current[topping]) {
          clearTimeout(toppingTimeouts.current[topping]);
        }
        toppingTimeouts.current[topping] = setTimeout(() => {
          setActiveToppings(curr => ({ ...curr, [topping]: false }));
          setParticles(currP => currP.filter(p => p.type !== topping));
          delete toppingTimeouts.current[topping];
        }, 5000);

      } else {
        // If toggled OFF manually:
        setParticles((prevP) => prevP.filter((p) => p.type !== topping));
        if (toppingTimeouts.current[topping]) {
          clearTimeout(toppingTimeouts.current[topping]);
          delete toppingTimeouts.current[topping];
        }
      }
      return { ...prev, [topping]: nextState };
    });
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(toppingTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Cart API Integration
  const handleOrder = async () => {
    if (activeSlide.stock === 0) return;
    playSynthSound('bubble');
    const { data, error } = await apiPost('/api/cart', {
      cartId,
      productId: activeSlide.id,
      quantity: 1,
      toppings: activeToppings,
    });
    if (data) {
      setCart(data);
      if (data.cartId && !cartId) {
        localStorage.setItem('cartId', data.cartId);
        setCartId(data.cartId);
      }
      setCartOpen(true);
    } else {
      alert(error || 'Out of stock!');
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    const { data } = await apiFetch('/api/cart/item', {
      method: 'PUT',
      body: JSON.stringify({ cartId, itemId, quantity: newQty }),
    });
    if (data) setCart(data);
  };

  const handleRemoveItem = async (itemId) => {
    const { data } = await apiFetch('/api/cart/item', {
      method: 'DELETE',
      body: JSON.stringify({ cartId, itemId }),
    });
    if (data) setCart(data);
  };

  // Called when Checkout completes successfully
  const handleCheckoutSuccess = (order) => {
    // Save order details
    setActiveOrderId(order.id);
    localStorage.setItem('lastOrderId', order.id);
    
    // Clear local cart state (backend cart is already cleared)
    setCart({ cartId, items: [] });
    
    // Switch to tracker view and close drawer
    setView('tracker');
    setCartOpen(false);
    playSynthSound('success');
  };

  // Switch view helper (refreshes product data when returning to shop)
  const handleViewChange = (newView) => {
    playSynthSound('click');
    setView(newView);
    if (newView === 'shop') {
      fetchProducts();
    }
  };

  // Autoplay slider interval (paused if toppings are active, cart is open, or not on shop view)
  useEffect(() => {
    if (view !== 'shop') return;
    const hasActiveToppings = Object.values(activeToppings).some(v => v);
    if (hasActiveToppings || cartOpen) return;

    const timer = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(timer);
  }, [index, activeToppings, products, cartOpen, view]);

  // Determine if image needs a multiply blend mode (to hide white backgrounds of generated images)
  const isImageMultiplyNeeded = 
    !['./images/choco.png', './images/cupcake.png', './images/blueberry.png', './images/donut.png'].includes(activeSlide.src);

  // Total cart items count
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="bakery-loader-screen">
        <div className="loader-box">
          <div className="spinning-donut" />
          <h2 className="loader-text">Loading Bakery Lab...</h2>
        </div>
      </div>
    );
  }

  // Branch layout based on active view
  const renderViewContent = () => {
    if (view === 'admin') {
      return (
        <motion.div
          key="admin"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        >
          <AdminPortal 
            onBackToShop={() => handleViewChange('shop')} 
            themeColor={activeSlide.themeColor} 
            accentColor={activeSlide.accentColor} 
          />
        </motion.div>
      );
    }

    if (view === 'tracker') {
      return (
        <motion.div
          key="tracker"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        >
          <OrderTracker 
            orderId={activeOrderId} 
            onBackToShop={() => handleViewChange('shop')} 
            themeColor={activeSlide.themeColor} 
            accentColor={activeSlide.accentColor} 
          />
        </motion.div>
      );
    }

    // Default: 'shop' view slider layout
    return (
      <motion.div
        key="shop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <div className="hero-grid-container">
        
        {/* LEFT COLUMN: PRODUCT INFORMATION */}
        <div className="hero-left-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="info-container"
            >
              <span className="info-category" style={{ color: activeSlide.accentColor }}>
                {activeSlide.category}
              </span>
              
              <h1 className="info-title" style={{ color: activeSlide.themeColor }}>
                {activeSlide.title}
              </h1>

              {/* Rating and Reviews */}
              <div className="rating-row">
                <div className="stars-glow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} color="#ffb800" size={15} />
                  ))}
                </div>
                <span className="rating-number">4.9</span>
                <span className="rating-reviews">(120+ customer reviews)</span>
              </div>

              {/* Tab Selector */}
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                  style={{ '--tab-theme': activeSlide.themeColor }}
                >
                  Details
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ingredients')}
                  style={{ '--tab-theme': activeSlide.themeColor }}
                >
                  Ingredients
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nutrition')}
                  style={{ '--tab-theme': activeSlide.themeColor }}
                >
                  Nutrition
                </button>
              </div>

              {/* Tab Contents */}
              <div className="tab-body">
                <AnimatePresence mode="wait">
                  {activeTab === 'details' && (
                    <motion.div
                      key="details-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="tab-content-wrapper"
                    >
                      <p className="info-desc">{activeSlide.description}</p>
                      
                      <div className="specs-grid">
                        {activeSlide.specs && activeSlide.specs.map((spec, sIdx) => (
                          <div key={sIdx} className="spec-card">
                            <span className="spec-label">{spec.label}</span>
                            <span className="spec-val" style={{ color: activeSlide.themeColor }}>{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ingredients' && (
                    <motion.div
                      key="ingredients-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="tab-content-wrapper"
                    >
                      <ul className="ingredients-list">
                        {activeSlide.ingredients && activeSlide.ingredients.map((ing, iIdx) => (
                          <motion.li 
                            key={iIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: iIdx * 0.08 }}
                            className="ingredient-item"
                          >
                            <span className="bullet-dot" style={{ backgroundColor: activeSlide.accentColor }}></span>
                            {ing}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'nutrition' && (
                    <motion.div
                      key="nutrition-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="tab-content-wrapper"
                    >
                      <div className="nutrition-container">
                        {activeSlide.nutrition && activeSlide.nutrition.map((nut, nIdx) => (
                          <div key={nIdx} className="nutrition-row">
                            <div className="nutrition-labels">
                              <span className="nut-name">{nut.name}</span>
                              <span className="nut-pct">{nut.percentage}%</span>
                            </div>
                            <div className="progress-bar-bg">
                              <motion.div 
                                className="progress-bar-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${nut.percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{ backgroundColor: activeSlide.accentColor }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stock Warning Badge */}
              <div className="stock-status-wrapper">
                {activeSlide.stock === 0 ? (
                  <span className="stock-indicator-badge sold-out">
                    ● Out of Stock (Sold Out)
                  </span>
                ) : activeSlide.stock <= 5 ? (
                  <span className="stock-indicator-badge low-stock">
                    ● Only {activeSlide.stock} units left in stock!
                  </span>
                ) : (
                  <span className="stock-indicator-badge in-stock">
                    ● In Stock: {activeSlide.stock} items available
                  </span>
                )}
              </div>

              {/* Order Actions */}
              <div className="order-actions">
                <div className="price-tag" style={{ color: activeSlide.themeColor }}>
                  ${activeSlide.price?.toFixed(2)}
                </div>
                <button 
                  className="hero-btn" 
                  onClick={handleOrder}
                  disabled={activeSlide.stock === 0}
                  style={{ 
                    backgroundColor: activeSlide.stock === 0 ? '#8c7a70' : activeSlide.themeColor,
                    cursor: activeSlide.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {activeSlide.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MIDDLE COLUMN: 3D HERO IMAGE PORTAL */}
        <div className="hero-center-panel">
          <div className="perspective-container">
            {/* Parallax Background Huge Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`bgtext-${index}`}
                style={{ x: textParallaxX, y: textParallaxY }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.08, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.8 }}
                className="parallax-bg-text"
              >
                {activeSlide.bgText}
              </motion.div>
            </AnimatePresence>

            {/* Glowing Backdrop */}
            <motion.div 
              className="glow-backdrop" 
              style={{ 
                boxShadow: `0 0 100px 30px ${activeSlide.accentColor}25`,
                background: `radial-gradient(circle, ${activeSlide.accentColor}15 0%, transparent 70%)` 
              }}
            />

            {/* 3D Tilted Product Frame */}
            <motion.div
              style={{
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
                transformStyle: 'preserve-3d',
              }}
              className="interactive-3d-card"
            >
              {/* Product Shadow */}
              <motion.div 
                className="product-shadow"
                style={{
                  boxShadow: `0 80px 50px -10px ${activeSlide.themeColor}35`,
                  transform: 'translateZ(-60px)'
                }}
              />

              {/* Dynamic Toppings Particles */}
              <div className="toppings-viewport">
                <AnimatePresence>
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      className={`topping-particle ${p.type}`}
                      style={{
                        left: p.left,
                        scale: p.scale,
                        transform: `rotate(${p.rotation}deg)`,
                      }}
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ 
                        y: 400, // fall path
                        opacity: [0, 1, 1, 0],
                        rotate: p.rotation + 360,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: p.speed,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatDelay: p.delay
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Main Product Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide.src}
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  style={{
                    x: imageParallaxX,
                    y: imageParallaxY,
                    transform: 'translateZ(60px)',
                    mixBlendMode: isImageMultiplyNeeded ? 'multiply' : 'normal'
                  }}
                  initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.4, rotate: 45, opacity: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 110, 
                    damping: 18,
                    duration: 0.95
                  }}
                  className="main-product-image"
                />
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Core Arrows Controls */}
          <div className="hero-slider-arrows">
            <button className="arrow-circle prev-arrow" onClick={handlePrev} aria-label="Previous Slide">
              <FaArrowLeft />
            </button>
            <span className="slider-counter">
              <span className="current-count" style={{ color: activeSlide.themeColor }}>
                {index + 1 < 10 ? `0${index + 1}` : index + 1}
              </span>
              <span className="counter-sep">/</span>
              <span className="total-count">
                {products.length < 10 ? `0${products.length}` : products.length}
              </span>
            </span>
            <button className="arrow-circle next-arrow" onClick={handleNext} aria-label="Next Slide">
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: BAKERY LAB CUSTOMIZER & THUMBNAILS */}
        <div className="hero-right-panel">
          
          {/* Section: Bakery Lab Toppings Customizer */}
          <div className="customizer-box" id="customizer">
            <h3 className="sidebar-section-title">Bakery Lab <span className="beta-badge">Custom</span></h3>
            <p className="customizer-subtitle">Sprinkle magical toppings over the dessert in 3D!</p>
            
            <div className="toppings-toggles-grid">
              <button 
                className={`topping-toggle ${activeToppings.sprinkles ? 'active' : ''}`}
                onClick={() => toggleTopping('sprinkles')}
                style={{ '--topping-theme': activeSlide.themeColor }}
              >
                <span className="toggle-indicator">
                  {activeToppings.sprinkles ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </span>
                Sprinkles
              </button>

              <button 
                className={`topping-toggle ${activeToppings.chocoChips ? 'active' : ''}`}
                onClick={() => toggleTopping('chocoChips')}
                style={{ '--topping-theme': activeSlide.themeColor }}
              >
                <span className="toggle-indicator">
                  {activeToppings.chocoChips ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </span>
                Choco Chips
              </button>

              <button 
                className={`topping-toggle ${activeToppings.mintLeaves ? 'active' : ''}`}
                onClick={() => toggleTopping('mintLeaves')}
                style={{ '--topping-theme': activeSlide.themeColor }}
              >
                <span className="toggle-indicator">
                  {activeToppings.mintLeaves ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </span>
                Mint Leaves
              </button>

              <button 
                className={`topping-toggle ${activeToppings.marshmallows ? 'active' : ''}`}
                onClick={() => toggleTopping('marshmallows')}
                style={{ '--topping-theme': activeSlide.themeColor }}
              >
                <span className="toggle-indicator">
                  {activeToppings.marshmallows ? <FaCheck size={10} /> : <FaPlus size={10} />}
                </span>
                Marshmallows
              </button>
            </div>
          </div>

          {/* Section: Slide Deck Mini-Previews */}
          <div className="slider-deck-box">
            <h3 className="sidebar-section-title">Chef's Deck</h3>
            
            <div className="thumbnail-deck-list">
              {products.map((slide, sIdx) => {
                const isActive = sIdx === index;
                const isThumbMultiply = 
                  !['./images/choco.png', './images/cupcake.png', './images/blueberry.png', './images/donut.png'].includes(slide.src);
                return (
                  <motion.div
                    key={sIdx}
                    onClick={() => {
                      setDirection(sIdx > index ? 1 : -1);
                      setIndex(sIdx);
                      resetToppings();
                    }}
                    className={`thumbnail-card ${isActive ? 'active' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      '--card-theme': slide.themeColor,
                      borderColor: isActive ? slide.themeColor : 'rgba(92, 46, 26, 0.1)' 
                    }}
                  >
                    <div className="thumb-img-box" style={{ background: slide.bg }}>
                      <img 
                        src={slide.src} 
                        alt={slide.alt} 
                        className="thumb-img" 
                        style={{ mixBlendMode: isThumbMultiply ? 'multiply' : 'normal' }}
                      />
                    </div>
                    <div className="thumb-info-box">
                      <span className="thumb-category">{slide.category}</span>
                      <span className="thumb-title" style={{ color: isActive ? slide.themeColor : '#3a2b23' }}>
                        {slide.title}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="hero-wrapper"
      style={{ background: view === 'shop' ? activeSlide.bg : 'radial-gradient(circle at center, #ffffff 0%, #fdfaf6 50%, #f2eae1 100%)' }}
      onMouseMove={view === 'shop' ? handleMouseMove : undefined}
      onMouseLeave={view === 'shop' ? handleMouseLeave : undefined}
    >
      <Navbar 
        cartCount={cartCount} 
        onCartClick={() => setCartOpen(true)} 
        currentView={view}
        onViewChange={handleViewChange}
      />

      <AnimatePresence mode="wait">
        {renderViewContent()}
      </AnimatePresence>

      {/* Cart Slider Drawer Component */}
      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={handleCheckoutSuccess}
        themeColor={activeSlide.themeColor}
        accentColor={activeSlide.accentColor}
      />
    </div>
  );
};

export default Hero;
