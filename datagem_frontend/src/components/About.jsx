import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  ArrowRight,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

// Slower & cinematic FadeIn matching the user-approved 1.35s timing
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  
  const yOffset = direction === "up" ? 45 : direction === "down" ? -45 : 0;
  const xOffset = direction === "left" ? 45 : direction === "right" ? -45 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: yOffset, x: xOffset }}
      transition={{ duration: 1.35, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Snappy Fast Word Reveal
function ScrollScrubText({ paragraph }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.90", "end 0.65"]
  });

  const words = paragraph.split(" ");

  return (
    <p ref={containerRef} className="flex flex-wrap gap-x-2 gap-y-1 text-2xl md:text-3xl font-medium leading-relaxed max-w-3xl mx-auto py-8">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = Math.min(start + (0.35 / words.length), 1);
        return <ScrollWord key={i} word={word} progress={scrollYProgress} range={[start, end]} />;
      })}
    </p>
  );
}

function ScrollWord({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const color = useTransform(progress, range, ['#334155', '#10B981']);
  const y = useTransform(progress, range, [3, 0]);
  return (
    <motion.span style={{ opacity, color, y }} className="inline-block transition-transform duration-75">
      {word}
    </motion.span>
  );
}

export default function About() {
  const containerRef = useRef(null);

  // Global top scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 25, restDelta: 0.001 });

  // Hero Parallax Tilt
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroRotateX = useTransform(heroProgress, [0, 1.2], [0, 14]);
  const heroScale = useTransform(heroProgress, [0, 1.2], [1, 0.95]);
  const heroOpacity = useTransform(heroProgress, [0, 1.0], [1, 0]);

  const features = [
    { title: "Natural Language SQL", desc: "Just ask 'What is the average revenue?' and watch verified DuckDB code execute.", icon: "🧠", stat: "< 0.4s Query" },
    { title: "Instant Visualizations", desc: "Plotly & WebGL interactive charts generated in sub-seconds with hover crosshairs.", icon: "📊", stat: "60 FPS" },
    { title: "Out-of-Core DuckDB", desc: "Stream and analyze massive CSV/Parquet files that normally crash server RAM.", icon: "🦆", stat: "Zero-Copy" },
    { title: "Zero-Trust MicroVM", desc: "Every Python script runs in sterile isolated sandboxes with zero host secret leaks.", icon: "🔒", stat: "E2B Guarded" }
  ];

  return (
    <div ref={containerRef} className="bg-[#05070A] text-slate-100 font-sans tracking-tight min-h-[220vh] pb-32 overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Top Global Scroll Kinetic Beam */}
      <motion.div 
        style={{ scaleX }} 
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-sky-400 via-emerald-400 to-teal-200 origin-left z-50 shadow-[0_0_15px_rgba(16,185,129,0.9)]"
      />

      {/* Floating Deep Cyan-Blue & Emerald Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-sky-600/15 blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-emerald-600/10 blur-[170px]" 
        />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-4 z-40 max-w-5xl mx-auto px-6">
        <div className="backdrop-blur-xl bg-slate-950/90 border border-sky-500/30 rounded-full px-5 py-3 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-mono font-bold text-sky-300">
              💎
            </div>
            <span className="font-semibold tracking-tight text-sm text-slate-100">DataGem 2.0</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/60 text-xs font-mono font-semibold text-slate-100 flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Cinematic Slower Animations */}
      <section ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-6 pt-24 text-center">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, rotateX: heroRotateX }} className="perspective-1000">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-mono uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(2,132,199,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> High-Performance AI Analytics
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-emerald-300 to-white drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]">DataGem.</span><br />
            Your AI Data Analyst.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8"
          >
            Upload datasets or connect live stores, ask questions in plain English, and turn raw numbers into verified mathematical insights instantly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 animate-bounce"
          >
            <span>↓ Scroll to explore</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Section: Snappy Word Reveal */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-32 border-t border-slate-900 pt-16">
        <ScrollScrubText 
          paragraph="DataGem is engineered for high-velocity founders and operators. You never write complex SQL queries or juggle messy CSV exports again. Ask any question in pure natural language and watch your metrics illuminate with sub-second verified mathematical precision."
        />
      </section>

      {/* Section: Slower Cinematic Bento Grid */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-20 border-t border-slate-900 pt-16">
        <FadeIn delay={0.1}>
          <div className="border-b border-slate-800 pb-3 mb-8 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Core Capabilities
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Autonomous Execution</span>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((item, i) => (
            <FadeIn key={i} delay={i * 0.18}>
              <motion.div
                whileHover={{ y: -6, borderColor: 'rgba(34, 211, 238, 0.7)', scale: 1.01 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-8 rounded-2xl bg-[#090D14] border border-slate-800 shadow-xl relative overflow-hidden group transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-cyan-300 uppercase tracking-widest border-b border-l border-slate-800 rounded-bl-xl bg-slate-950/60">
                  {item.stat}
                </div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* The Creator Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-28">
        <FadeIn delay={0.2}>
          <div className="p-10 rounded-2xl bg-gradient-to-b from-[#090D14] to-black border border-cyan-500/40 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono uppercase tracking-widest mb-4">
              Architect & Creator
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Akshit Malik.</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              DataGem was engineered from the ground up as a showcase of full-stack AI architecture. Merging beautiful UI/UX with heavy-duty zero-trust data compute engines.
            </p>
            <div className="flex justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://www.linkedin.com/in/akshit-malik-718b3a212/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                LinkedIn Profile
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="mailto:aakshitmalik@gmail.com"
                className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs font-mono hover:border-slate-500"
              >
                Contact Email
              </motion.a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
