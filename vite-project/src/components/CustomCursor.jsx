import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

// Detect touch-primary devices (Android phones/tablets) — no cursor needed
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);

const CustomCursor = () => {
  const [cursorType, setCursorType] = useState('default');
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 400, mass: 0.4 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    let currentHoveredElement = null;

    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .arrow-circle, .thumbnail-card, .topping-toggle, .tab-btn');
      
      if (target) {
        if (target !== currentHoveredElement) {
          currentHoveredElement = target;
          setCursorType('hover');
          if (target.classList.contains('arrow-circle')) {
            setCursorText('SLIDE');
          } else if (target.classList.contains('thumbnail-card')) {
            setCursorText('SELECT');
          } else if (target.classList.contains('topping-toggle')) {
            setCursorText('ADD');
          } else if (target.classList.contains('nav-button') || target.classList.contains('hero-btn')) {
            setCursorText('ORDER');
          } else {
            setCursorText('');
          }
        }
      } else {
        if (currentHoveredElement !== null) {
          currentHoveredElement = null;
          setCursorType('default');
          setCursorText('');
        }
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, cursorX, cursorY]);

  // Don't render custom cursor on touch-primary devices (Android)
  if (isTouchDevice()) return null;
  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className={`custom-cursor-ring ${cursorType}`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
      >
        {cursorText && <span className="cursor-text">{cursorText}</span>}
      </motion.div>
      <motion.div
        className="custom-cursor-dot"
        style={{
          left: cursorX,
          top: cursorY,
        }}
      />
    </>
  );
};

export default CustomCursor;
