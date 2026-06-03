import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

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

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);

    const addHoverListeners = () => {
      const clickables = document.querySelectorAll('a, button, .arrow-circle, .thumbnail-card, .topping-toggle, .tab-btn');
      
      clickables.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setCursorType('hover');
          if (el.classList.contains('arrow-circle')) {
            setCursorText('SLIDE');
          } else if (el.classList.contains('thumbnail-card')) {
            setCursorText('SELECT');
          } else if (el.classList.contains('topping-toggle')) {
            setCursorText('ADD');
          } else if (el.classList.contains('nav-button') || el.classList.contains('hero-btn')) {
            setCursorText('ORDER');
          }
        });

        el.addEventListener('mouseleave', () => {
          setCursorType('default');
          setCursorText('');
        });
      });
    };

    // Run initially and set up a mutation observer to attach to dynamic elements
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, [isVisible, cursorX, cursorY]);

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
