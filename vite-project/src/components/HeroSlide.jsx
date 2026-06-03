import { motion } from 'framer-motion';
import './HeroSlide.css';

const slideVariants = {
  initial: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    position: 'absolute',
  }),
  animate: {
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  static: {
    x: 0,
    position: 'absolute',
  },
};

const HeroSlide = ({ slide, direction = 1, isAnimating = false, onAnimationComplete }) => {
  return (
    <motion.div
      className="hero-slide-content"
      style={{ background: slide.bg }}
      variants={slideVariants}
      initial={isAnimating ? "initial" : false}
      animate={isAnimating ? "animate" : "static"}
      custom={direction}
      onAnimationComplete={onAnimationComplete}
    >
   <div className="hero-left">
        <h1>{slide.title}</h1>
        <p>{slide.description}</p>
        <button className="hero-btn">Try It Now</button>
      </div>
      <div className="hero-right">
        <p>Handcrafted with love, each sip brings comfort and delight.</p>
        <p>Perfectly blended cocoa, creamy textures, and a hint of joy.</p>
        <p>Our shakes aren’t just drinks — they’re memories in a cup.</p>
        <p>Taste the magic that started it all, only at DvBakes.</p>
      </div>
    </motion.div>
  );
};

export default HeroSlide;
