import React, { useState } from 'react';
import './Hero.css';
import Navbar from './Navbar';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSlide from './HeroSlide';

const slides = [
  {
    src: './images/choco.png',
    alt: 'Chocolate Shake',
    title: 'Velvet Choco Bliss',
    description: 'Dive into layers of rich cocoa, smooth cream, and a swirl of happiness. Our signature chocolate shake is made to melt your heart.',
    bg: 'radial-gradient(circle at center, #f6e7d4 0%, #e5c3a0 25%, #c7956b 50%, #a1673f 75%, #5c2e1a 100%)'
  },
  {
    src: './images/cupcake.png',
    alt: 'Cupcake',
    title: 'Minty Cupcake Cloud',
    description: 'A swirl of vanilla, a dash of mint, and the fluffiest cupcake you have ever met. Light, creamy, and dreamy in every bite.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #B9E7CE 100%)'
  },
  {
    src: './images/blueberry.png',
    alt: 'Blueberry Shake',
    title: 'Berrylicious Dream',
    description: 'Bursting with real blueberries, whipped cream, and a whole lot of magic. This one’s made to refresh and impress.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #B97AD1 100%)'
  },
  {
    src: './images/donut.png',
    alt: 'Donut',
    title: 'Sugar Glazed Hug',
    description: 'Soft, fluffy, and coated in pink sweetness. Our donut is a cuddle disguised as a snack.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #F3C5D3 140%)'
  }
];

const Hero = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
const [prevIndex, setPrevIndex] = useState(null);
  const handleNext = () => {
     setPrevIndex(index);
    setDirection(1);
    setIndex((prev) => (prev + 1) % slides.length);
  };



  const handlePrev = () => {
     setPrevIndex(index);
    setDirection(-1);
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const imageVariants = {
    initial: { x: direction > 0 ? '100vw' : '-100vw', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: 'easeOut' },
    },
    exit: {
      x: direction < 0 ? '100vw' : '-100vw',
      opacity: 0,
      transition: { duration: 0.9, ease: 'easeIn' },
    },
  };

  return (
    <>
      <Navbar />
      <div className="hero-section">
      <div className="hero-slide-wrapper">
  {prevIndex !== null && (
    <HeroSlide
      key={`prev-${slides[prevIndex].title}`}
      slide={slides[prevIndex]}
      direction={direction}
      isAnimating={false}
    />
  )}

  <HeroSlide
    key={`curr-${slides[index].title}`}
    slide={slides[index]}
    direction={direction}
    isAnimating={true}
    onAnimationComplete={() => setPrevIndex(null)}
  />
</div>

        <div className="hero-image">
          <AnimatePresence  initial={false}>
            <motion.img
              key={slides[index].src}
              src={slides[index].src}
              alt={slides[index].alt}
              className="hero-slide-img"
              variants={imageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </AnimatePresence>
        </div>

       <div className="hero-arrows">
        <div className="arrow-circle" onClick={handlePrev}>
          <FaArrowLeft />
        </div>
        <div className="arrow-circle" onClick={handleNext}>
          <FaArrowRight />
        </div>
       </div>
      </div>
    </>
  );
};

export default Hero;
