import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // SOTA timing
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const letterVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    visible: i => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    })
  };

  const text = "DataGem".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-full blur-[100px]"
          />

          <div className="flex items-center gap-4 relative z-10">
            {/* SOTA Rotating Diamond */}
            <motion.div
              initial={{ opacity: 0, rotate: -90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.6)] flex items-center justify-center"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            >
                <div className="w-1/2 h-1/2 bg-white/20 rounded-full blur-sm"></div>
            </motion.div>

            <div className="flex overflow-hidden pb-4">
              {text.map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-7xl md:text-9xl font-black text-white tracking-tighter"
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "200px" }}
            transition={{ delay: 1, duration: 1, ease: "easeOut" }}
            className="h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-8 relative z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
