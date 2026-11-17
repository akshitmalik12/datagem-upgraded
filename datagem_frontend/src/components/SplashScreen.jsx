import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StrokeText from './StrokeText';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // The total animation takes roughly 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onComplete
      setTimeout(onComplete, 800);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800"
        >
          <div className="w-full max-w-3xl px-6">
            <StrokeText
              text="DataGem"
              strokeColor="#a855f7"
              fillColor="#ffffff"
              strokeWidth={1.5}
              drawDuration={1.6}
              fillDelay={0.4}
              stagger={0.1}
              ease="power3.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={120}
              fontWeight={800}
              letterSpacing={-2}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
