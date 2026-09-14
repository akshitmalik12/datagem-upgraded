import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

// Fade in component for scroll reveals
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;
  const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: yOffset, x: xOffset }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

export default function About() {
  const containerRef = useRef(null);
  
  // Advanced scroll progress tied to the window
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero animations
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.85]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, 100]);

  const features = [
    { title: "Natural Language SQL", desc: "Just ask 'What is the average revenue?' and watch the magic happen.", icon: "🧠" },
    { title: "Instant Visualizations", desc: "Plotly-powered interactive charts generated in seconds.", icon: "📊" },
    { title: "Out-of-Core DuckDB", desc: "Analyze massive datasets that normally wouldn't fit in RAM.", icon: "🦆" },
    { title: "Stateless Cloud Architecture", desc: "Backed by PostgreSQL and AWS S3 for enterprise scale.", icon: "☁️" }
  ];

  return (
    <div ref={containerRef} className="bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans min-h-[250vh]">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 dark:bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0B0F19]/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              D
            </div>
            <span className="font-bold text-xl tracking-tight">DataGem</span>
          </div>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Link>
        </div>
      </header>

      {/* Sticky Hero Section */}
      <div className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="text-center px-6 max-w-5xl w-full"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-sm mb-6">
              Portfolio Highlight
            </h2>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight">
              Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">DataGem.</span><br />
              Your AI Analyst.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Upload datasets, ask questions in plain English, and watch as raw data turns into beautiful insights instantly.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-5 h-8 border-2 border-gray-400 rounded-full flex justify-center p-1"
            >
              <div className="w-1 h-2 bg-gray-400 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 bg-white dark:bg-[#0B0F19] rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t border-gray-200 dark:border-gray-800">
        
        {/* Features Bento Grid */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Built for scale. Designed for humans.</h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">Complex architecture hidden behind a simple chat interface.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 p-10 rounded-3xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="text-5xl mb-6 relative z-10">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg relative z-10">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* The Creator Section - Full width standout */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-900 dark:bg-black" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
            <FadeIn direction="up">
              <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-8">The Creator</h2>
              <h3 className="text-5xl md:text-7xl font-bold mb-10 tracking-tight">Akshit Malik.</h3>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-16">
                DataGem was engineered from the ground up as a showcase of full-stack AI architecture. Merging beautiful UI/UX with heavy-duty data pipelines.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.2} direction="up">
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a
                  href="https://www.linkedin.com/in/akshit-malik-718b3a212/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </span>
                </a>
                <a
                  href="mailto:aakshitmalik@gmail.com"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-800 text-white rounded-full font-bold text-lg border border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Get in Touch
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Security / Footer */}
        <footer className="py-20 px-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0B0F19]">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Enterprise Grade Privacy</h3>
              <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                DataGem executes all python analysis in isolated, sandboxed environments. Your data is processed securely via DuckDB HTTPFS directly from S3, ensuring zero data persistence on the analytical servers.
              </p>
              <p className="text-sm text-gray-400">© {new Date().getFullYear()} Akshit Malik. All rights reserved.</p>
            </div>
          </FadeIn>
        </footer>

      </div>
    </div>
  );
}
