import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Copy, 
  Eye, 
  Zap, 
  Activity, 
  Lock, 
  BarChart3, 
  Database,
  Layers,
  ChevronRight,
  RefreshCw,
  Type
} from 'lucide-react';
import TechText from '../TechText';
import FoldText from '../FoldText';
import CallChip from '../CallChip';
import BranchedMenu from '../BranchedMenu';
import ChatHistory from '../ChatHistory';
import ThoughtLine from '../ThoughtLine';
import PromptBar from '../PromptBar';
import RubberSegment from '../RubberSegment';
import ScrubField from '../ScrubField';
import SquishSwitch from '../SquishSwitch';
import { Message01Icon, Attachment01Icon, Globe02Icon, SparklesIcon } from '@hugeicons/core-free-icons';

// Stream text letter-by-letter with an ultra-responsive typewriter effect
function TypewriterChat({ text, speed = 12, keyTrigger }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, keyTrigger, speed]);

  return (
    <span className="relative">
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 translate-y-0.5 animate-pulse" />
      )}
    </span>
  );
}

// Slower Cinematic FadeIn
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  
  const yOffset = direction === "up" ? 50 : direction === "down" ? -50 : 0;
  const xOffset = direction === "left" ? 50 : direction === "right" ? -50 : 0;

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

export const COLOR_PALETTES = {
  current: {
    id: 'current',
    name: 'Current Bright Cyan',
    hex: '#06b6d4',
    accent: '#22d3ee',
    border: '#0891b2',
    bgBadge: 'rgba(6, 182, 212, 0.15)',
    glow: 'rgba(6, 182, 212, 0.6)',
    desc: 'Original neon cyan baseline with electric vibrance'
  },
  option1: {
    id: 'option1',
    name: 'Deep Cyan-Blue',
    hex: '#0284c7',
    accent: '#0ea5e9',
    border: '#0369a1',
    bgBadge: 'rgba(2, 132, 199, 0.18)',
    glow: 'rgba(2, 132, 199, 0.6)',
    desc: 'Raycast / Linear style cyan-blue balance, authoritative'
  },
  option2: {
    id: 'option2',
    name: 'Pacific Cerulean',
    hex: '#0077b6',
    accent: '#0096c7',
    border: '#023e8a',
    bgBadge: 'rgba(0, 119, 182, 0.18)',
    glow: 'rgba(0, 119, 182, 0.6)',
    desc: 'Deep Mediterranean ocean blue without green/teal tint'
  },
  option3: {
    id: 'option3',
    name: 'Deep Steel Cyan',
    hex: '#0891b2',
    accent: '#06b6d4',
    border: '#164e63',
    bgBadge: 'rgba(8, 145, 178, 0.18)',
    glow: 'rgba(8, 145, 178, 0.6)',
    desc: 'Subdued Nordic moody titanium cyan, reduced glare'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    hex: '#10b981',
    accent: '#34d399',
    border: '#059669',
    bgBadge: 'rgba(16, 185, 129, 0.18)',
    glow: 'rgba(16, 185, 129, 0.6)',
    desc: 'Supabase / Wall Street terminal profit green'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst Violet',
    hex: '#8b5cf6',
    accent: '#a78bfa',
    border: '#6d28d9',
    bgBadge: 'rgba(139, 92, 246, 0.18)',
    glow: 'rgba(139, 92, 246, 0.6)',
    desc: 'OpenAI / Claude AI reasoning purple aesthetic'
  },
  amber: {
    id: 'amber',
    name: 'Cyberpunk Amber',
    hex: '#f59e0b',
    accent: '#fbbf24',
    border: '#d97706',
    bgBadge: 'rgba(245, 158, 11, 0.18)',
    glow: 'rgba(245, 158, 11, 0.6)',
    desc: 'Bloomberg terminal gold & warm retro phosphor'
  },
  crimson: {
    id: 'crimson',
    name: 'Hyper Rose / Crimson',
    hex: '#f43f5e',
    accent: '#fb7185',
    border: '#e11d48',
    bgBadge: 'rgba(244, 63, 94, 0.18)',
    glow: 'rgba(244, 63, 94, 0.6)',
    desc: 'High-contrast Vercel / Figma luxury neon punch'
  },
  monochrome: {
    id: 'monochrome',
    name: 'Minimalist Zinc / Chalk',
    hex: '#e2e8f0',
    accent: '#ffffff',
    border: '#475569',
    bgBadge: 'rgba(226, 232, 240, 0.15)',
    glow: 'rgba(255, 255, 255, 0.5)',
    desc: 'Pure monochrome luxury Apple / Next.js minimalism'
  }
};

export default function DesignShowcase() {
  const { user } = useAuth();
  const ADMIN_EMAILS = ['aakshitmalik@gmail.com', 'akshitmalik1203@gmail.com'];
  if (user && !ADMIN_EMAILS.includes(user.email?.trim().toLowerCase())) {
    return <Navigate to="/chat" replace />;
  }

  const [selectedPaletteKey, setSelectedPaletteKey] = useState('option1');
  const activePalette = COLOR_PALETTES[selectedPaletteKey];

  const [selectedChatOption, setSelectedChatOption] = useState('dock'); // 'dock', 'split', 'zen'
  const [chatKey, setChatKey] = useState(0);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [activeChatThread, setActiveChatThread] = useState('chat_roas');
  const [promptBusy, setPromptBusy] = useState(false);
  const [timeGrain, setTimeGrain] = useState('Week');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoRebalance, setAutoRebalance] = useState(true);

  // Global top scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 25, restDelta: 0.001 });

  // Hero Parallax Transitions
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroRotateX = useTransform(heroProgress, [0, 1.2], [0, 14]);
  const heroScale = useTransform(heroProgress, [0, 1.2], [1, 0.95]);
  const heroOpacity = useTransform(heroProgress, [0, 1.0], [1, 0]);

  const sampleChatResponse = "Based on your Q3 Shopify orders, SKU 'HydroFlask-Steel' generated $420 with a 4.2x ROAS, while 'EcoGrip-Mat' had a 16.4% return rate due to size mismatches. I recommend reducing Meta Ad spend on Mat by 25%.";

  return (
    <div className="min-h-[250vh] bg-[#05070A] text-slate-100 font-sans tracking-tight transition-all duration-150 pb-32 overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Top Global Kinetic Scroll Progress Bar */}
      <motion.div 
        style={{ scaleX }} 
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-200 origin-left z-50 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
      />

      {/* Floating Cyan Ambient Orb */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-cyan-600/15 blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-blue-600/10 blur-[170px]" 
        />
      </div>

      {/* Sticky Floating Control Bar */}
      <nav className="sticky top-4 z-40 max-w-5xl mx-auto px-6">
        <div className="backdrop-blur-xl bg-slate-950/90 border border-cyan-500/30 rounded-full px-5 py-3 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              DATAGEM DESIGN LAB
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
              Inter / Geist
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Active Shade:</span>
            <span style={{ color: activePalette.accent }} className="font-bold">{activePalette.name}</span>
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="ml-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-500 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Project Trees</span>
            </button>
          </div>
        </div>
      </nav>

      {/* COLOR SHADE PREVIEW SWITCHER BAR */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 mt-6">
        <div className="p-4 rounded-2xl bg-[#080C14] border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePalette.hex, boxShadow: `0 0 10px ${activePalette.glow}` }} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Interactive Color Palette Preview
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Click any option below to preview in real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(COLOR_PALETTES).map(pal => {
              const isSelected = selectedPaletteKey === pal.id;
              return (
                <button
                  key={pal.id}
                  onClick={() => setSelectedPaletteKey(pal.id)}
                  style={{
                    borderColor: isSelected ? pal.hex : 'rgba(51, 65, 85, 0.6)',
                    backgroundColor: isSelected ? pal.bgBadge : 'rgba(15, 23, 42, 0.4)',
                    boxShadow: isSelected ? `0 0 15px ${pal.glow}` : 'none'
                  }}
                  className="p-3 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pal.hex }} />
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{pal.hex}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 leading-tight mb-1">{pal.name}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-light leading-snug mt-2 border-t border-slate-800/80 pt-1.5">
                    {pal.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* HERO SECTION WITH EXACT TECHTEXT REACT BITS INTEGRATION */}
      <section ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-6 pt-12 text-center">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, rotateX: heroRotateX }} 
          className="perspective-1000"
        >
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderColor: activePalette.border,
              backgroundColor: activePalette.bgBadge,
              color: activePalette.accent,
              boxShadow: `0 0 15px ${activePalette.glow}`
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono uppercase tracking-widest mb-4 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Analytics Motion
          </motion.div>

          {/* EXACT TECHTEXT HERO WORDMARK */}
          <div style={{ width: '100%', height: '360px', position: 'relative' }} className="my-2">
            <TechText
              text="DataGem"
              fontWeight={400}
              fontSize={140}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={6}
              intro="metrics"
              introDuration={2.8}
              clickKick
              guides
              fontFamily='Inter, sans-serif'
              letterSpacing={-0.03}
              accentColor={activePalette.accent}
              reach={200}
              softness={0.7}
              lineStyle="solid"
              strokeWidth={1.25}
              speed={1}
              bounce={0.75}
              selection
              labels
              color={activePalette.hex}
              align="center"
              draggable
              sweep
            />
          </div>

          {/* FOLDTEXT COMPONENT INTEGRATION IN HERO */}
          <div className="mt-4 mb-4">
            <FoldText
              text="Launch with clarity"
              foldStyle="paper"
              splitBy="char"
              hinge="top"
              trigger="scroll"
              foldAngle={92}
              duration={0.65}
              stagger={0.045}
              staggerFrom="start"
              ease="power3.out"
              loopDelay={1.4}
              hoverRefold={true}
              refoldRadius={140}
              refoldAngle={45}
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(2rem, 5vw, 3.5rem)"
              fontWeight={800}
              color="#22d3ee"
            />
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-6"
          >
            Hover or drag the letters above to test vector outlines, font guides, and physics kicks.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 animate-bounce"
          >
            <span>↓ Scroll to trigger animations</span>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION: FOLDTEXT SCROLL UNFOLD SHOWCASE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-20 border-t border-slate-900 pt-16 text-center">
        <div className="border-b border-slate-800 pb-3 mb-8 flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 1. FoldText 3D Origami Unfold (React Bits)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Unfolds on scroll · Hover to refold</span>
        </div>

        <div className="py-12 bg-[#090D14] rounded-3xl border border-cyan-500/30 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <FoldText
            text="Turn Raw Data Into Answers"
            foldStyle="paper"
            splitBy="char"
            hinge="top"
            trigger="scroll"
            foldAngle={92}
            duration={0.7}
            stagger={0.04}
            staggerFrom="start"
            ease="power3.out"
            hoverRefold={true}
            refoldRadius={150}
            refoldAngle={50}
            perspective={700}
            creaseShading={0.6}
            fontSize="clamp(1.8rem, 4vw, 3rem)"
            fontWeight={800}
            color="#38bdf8"
          />
          <p className="text-xs font-mono text-slate-500 mt-4">
            Interactive: Move cursor over letters to watch them fold away and spring open.
          </p>
        </div>
      </section>

      {/* 2. LIVE CHAT EXPERIENCE OPTIONS */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mt-20 border-t border-slate-900 pt-16">
        <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-widest text-sky-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" /> 2. Live Chat Options &amp; Kinetic Controls Preview
          </h2>
          <button 
            onClick={() => setChatKey(prev => prev + 1)}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RefreshCw className="w-3 h-3" /> Re-trigger Reasoning Stream
          </button>
        </div>

        {/* THREE CHAT LAYOUT OPTIONS COMPARISON - NOW FULLY CLICKABLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* OPTION 1: KINETIC DOCK */}
          <motion.button
            type="button"
            onClick={() => setSelectedChatOption('dock')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden ${
              selectedChatOption === 'dock'
                ? 'bg-[#081320] border-2 border-sky-400 shadow-[0_0_25px_rgba(2,132,199,0.35)]'
                : 'bg-[#080C14] border border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold font-mono ${selectedChatOption === 'dock' ? 'text-sky-300' : 'text-slate-300'}`}>
                Option 1: Kinetic Dock
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedChatOption === 'dock'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedChatOption === 'dock' ? '✓ ACTIVE' : 'Select'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Floating rounded &lt;PromptBar /&gt; centered at the bottom with spark bursts, attached source badges, and breathing inline &lt;ThoughtLine /&gt; reasoning sparkles.
            </p>
          </motion.button>

          {/* OPTION 2: SPLIT STUDIO */}
          <motion.button
            type="button"
            onClick={() => setSelectedChatOption('split')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden ${
              selectedChatOption === 'split'
                ? 'bg-[#081320] border-2 border-sky-400 shadow-[0_0_25px_rgba(2,132,199,0.35)]'
                : 'bg-[#080C14] border border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold font-mono ${selectedChatOption === 'split' ? 'text-sky-300' : 'text-slate-300'}`}>
                Option 2: Split Studio
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedChatOption === 'split'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedChatOption === 'split' ? '✓ ACTIVE' : 'Select'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Chat left panel with &lt;BranchedMenu /&gt; tree navigation, execution &lt;CallChip /&gt; drawer, and live interactive data canvas on the right.
            </p>
          </motion.button>

          {/* OPTION 3: MINIMALIST ZEN */}
          <motion.button
            type="button"
            onClick={() => setSelectedChatOption('zen')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-5 rounded-2xl text-left transition-all relative overflow-hidden ${
              selectedChatOption === 'zen'
                ? 'bg-[#081320] border-2 border-sky-400 shadow-[0_0_25px_rgba(2,132,199,0.35)]'
                : 'bg-[#080C14] border border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold font-mono ${selectedChatOption === 'zen' ? 'text-sky-300' : 'text-slate-300'}`}>
                Option 3: Minimalist Zen
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedChatOption === 'zen'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedChatOption === 'zen' ? '✓ ACTIVE' : 'Select'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Full-width borderless command console with keycap action triggers and micro-animations for keyboard-first analysts.
            </p>
          </motion.button>
        </div>

        {/* DYNAMIC PREVIEW BASED ON SELECTED OPTION */}
        {selectedChatOption === 'dock' && (
          <div className="p-6 rounded-2xl bg-[#090D14] border border-sky-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/70">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[10px] text-sky-300 font-mono font-bold">
                  DG
                </div>
                <span className="text-xs font-mono text-sky-400 font-semibold">DataGem Copilot (Kinetic Dock Mode)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">DuckDB 0.38s</span>
              </div>
              
              <ThoughtLine
                working={chatKey % 2 === 0}
                steps={[
                  'Ingesting schema & column metrics',
                  'Compiling DuckDB vectorized query',
                  'Verifying return rate anomaly across SKUs',
                  'Generating executive recommendation'
                ]}
                label="Synthesizing Shopify orders…"
                doneLabel="Reasoned in"
                glyph="sparkle"
                glyphColor="#10b981"
                color="#e2e8f0"
                fontSize={13}
                breathPeriod={1.5}
                collapsible
                collapseOnSettle
                showTimer
              />
            </div>

            <div className="text-sm text-slate-200 leading-relaxed font-sans min-h-[70px]">
              <TypewriterChat key={chatKey} text={sampleChatResponse} speed={12} keyTrigger={chatKey} />
            </div>
          </div>
        )}

        {selectedChatOption === 'split' && (
          <div className="p-6 rounded-2xl bg-[#090D14] border border-sky-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all grid md:grid-cols-2 gap-6 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-sky-400 font-semibold">Left Pane: Conversation &amp; Call Chips</span>
              </div>
              <div className="space-y-3 mb-4">
                <CallChip
                  icon="terminal"
                  name="DuckDB Vector"
                  argument="SELECT sku, sum(revenue) FROM orders"
                  status="done"
                  expectedMs={380}
                  size={32}
                  radius={10}
                  color="#38bdf8"
                  surfaceColor="#0f172a"
                  progressColor="#0284c7"
                  doneColor="#10b981"
                  showTimer
                />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {sampleChatResponse}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Right Pane: Live Canvas / Output</span>
              <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
                [ Interactive DuckDB Data Table &amp; Plotly WebGL Chart ]
              </div>
            </div>
          </div>
        )}

        {selectedChatOption === 'zen' && (
          <div className="p-6 rounded-2xl bg-[#090D14] border border-slate-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400">Zen Terminal Output</span>
              <span className="text-[10px] font-mono text-slate-500">Press ⌘K to query</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              $ datagem run "analyze return rate by sku" --engine=duckdb
              ✓ Connected to shopify_orders.parquet
              ✓ Query executed in 0.38s
              &gt; {sampleChatResponse}
            </pre>
          </div>
        )}

        {/* PROMPTBAR INPUT DOCK */}
        <div className="mt-6 flex flex-col items-center">
          <PromptBar
            placeholder="Ask about SKU margins, blended ROAS or cohort retention..."
            sources={[
              { key: 'files', name: 'Shopify CSV / Parquet', description: 'Upload financial export', icon: Attachment01Icon, attach: true },
              { key: 'web', name: 'Live Ad Benchmarks', description: 'Real-time CAC & CPM rates', icon: Globe02Icon }
            ]}
            commands={[
              { key: 'summarize', name: '/summarize', description: 'Digest store metrics into Monday briefing' },
              { key: 'roas', name: '/roas', description: 'Calculate blended ROAS across Google & Meta' },
              { key: 'churn', name: '/churn', description: 'Analyze 30/60/90 day customer cohorts' }
            ]}
            models={[
              { key: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'Deep Audit' },
              { key: 'gemini-2.5-flash', name: 'Gemini Flash', tag: '0.4s Fast' }
            ]}
            efforts={['Fast', 'Balanced', 'Deep', 'Exhaustive', 'Max Spark']}
            defaultEffort="Deep"
            busy={promptBusy}
            onSend={(text) => {
              setPromptBusy(true);
              setChatKey(prev => prev + 1);
              setTimeout(() => setPromptBusy(false), 2400);
            }}
            onStop={() => setPromptBusy(false)}
            onAttach={() => ['shopify_orders_q3.parquet']}
            background="#080C14"
            color="#f1f5f9"
            menuBackground="#0B111C"
            sparkColor={activePalette.hex}
            sparkBoost={1.2}
            width={680}
            radius={18}
          />
        </div>

        {/* INTERACTIVE CONTROLS: RUBBERSEGMENT, SCRUBFIELD & SQUISHSWITCH */}
        <div className="mt-8 p-6 rounded-2xl bg-[#080C14] border border-slate-800/80 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Aggregation Grain (&lt;RubberSegment /&gt;)
            </span>
            <RubberSegment
              items={['Daily', 'Weekly', 'Monthly', 'Quarterly']}
              defaultValue="Weekly"
              trackColor="#0f172a"
              thumbColor={activePalette.hex}
              textColor="#94a3b8"
              activeTextColor="#ffffff"
              size="md"
              radius={10}
              equalSlots
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Confidence Floor (&lt;ScrubField /&gt;)
            </span>
            <ScrubField
              label="Confidence"
              suffix="%"
              defaultValue={85}
              min={50}
              max={99}
              step={1}
              accent={activePalette.accent}
              chipColor="#0f172a"
              onChange={(v) => setConfidenceThreshold(v)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Watchdog Mode (&lt;SquishSwitch /&gt;)
            </span>
            <SquishSwitch
              checked={autoRebalance}
              onChange={setAutoRebalance}
              label="Auto-Alert Slack"
              trackColor="#0f172a"
              trackOnColor={activePalette.hex}
              thumbColor="#334155"
              thumbOnColor="#05070a"
              width={64}
              height={32}
              radius={16}
            />
          </div>
        </div>
      </section>

      {/* 3. SELECTED: SNAPPY CYAN KEYCAP BUTTONS */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-20 border-t border-slate-900 pt-16">
        <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> 3. Selected: Snappy Cyan Keycaps
          </h2>
          <span className="text-[11px] font-mono text-slate-500">Fast 0.06s tactile physics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#090D14] border border-slate-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-500 mb-3 block">Primary Action</span>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#22D3EE' }}
              whileTap={{ scale: 0.95, y: 1 }}
              transition={{ duration: 0.06, ease: "easeOut" }}
              className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-slate-100 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.6)] group transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>⌘K Run Query</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono border border-slate-700">↵</span>
            </motion.button>
          </div>

          <div className="p-6 rounded-xl bg-[#090D14] border border-slate-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-500 mb-3 block">Ingestion Trigger</span>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#22D3EE' }}
              whileTap={{ scale: 0.95, y: 1 }}
              transition={{ duration: 0.06, ease: "easeOut" }}
              className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-slate-100 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.6)] group transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Connect Postgres</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-mono border border-slate-700">Live</span>
            </motion.button>
          </div>

          <div className="p-6 rounded-xl bg-[#090D14] border border-slate-800/80 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-500 mb-3 block">Weekly Briefing</span>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#22D3EE' }}
              whileTap={{ scale: 0.95, y: 1 }}
              transition={{ duration: 0.06, ease: "easeOut" }}
              className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-slate-100 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.6)] group transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-pulse" />
              <span>Monday Briefing</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono border border-slate-700">8AM</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* CALLCHIP AGENT EXECUTION MONITOR */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-16 border-t border-slate-900 pt-12">
        <FadeIn delay={0.1}>
          <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Agent Tool Execution Status (&lt;CallChip /&gt;)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Real-time sandboxed tool calls</span>
          </div>
        </FadeIn>

        <div className="flex flex-wrap gap-4 items-center justify-start p-6 rounded-2xl bg-[#080C14] border border-slate-800/80 shadow-lg">
          <CallChip
            icon="terminal"
            name="DuckDB"
            argument="SELECT sku, sum(revenue) FROM orders"
            status="done"
            expectedMs={850}
            size={34}
            radius={10}
            color="#22d3ee"
            surfaceColor="#0f172a"
            progressColor="#06b6d4"
            doneColor="#22c55e"
            errorColor="#ef4444"
            showTimer
          />
          <CallChip
            icon="file"
            name="E2B Sandbox"
            argument="python -m cohort_analysis.py"
            status="running"
            expectedMs={2400}
            size={34}
            radius={10}
            color="#e2e8f0"
            surfaceColor="#0f172a"
            progressColor="#06b6d4"
            doneColor="#22c55e"
            errorColor="#ef4444"
            showTimer
          />
          <CallChip
            icon="search"
            name="Schema Profiler"
            argument="profiling 50k parquet rows"
            status="done"
            expectedMs={1200}
            size={34}
            radius={10}
            color="#38bdf8"
            surfaceColor="#0f172a"
            progressColor="#06b6d4"
            doneColor="#22c55e"
            errorColor="#ef4444"
            showTimer
          />
          <CallChip
            icon="terminal"
            name="Redis Cache"
            argument="GET metric:roas:q3"
            status="error"
            expectedMs={300}
            size={34}
            radius={10}
            color="#f87171"
            surfaceColor="#0f172a"
            progressColor="#06b6d4"
            doneColor="#22c55e"
            errorColor="#ef4444"
            shake={6}
            showTimer
            onRetry={() => console.log('Retrying redis fetch...')}
          />
        </div>
      </section>

      {/* BRANCHED PROJECT & CHAT TREE UI */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-16 border-t border-slate-900 pt-12">
        <FadeIn delay={0.1}>
          <div className="border-b border-slate-800 pb-3 mb-6 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Database className="w-4 h-4" /> Project &amp; Chat Tree Hierarchy (&lt;BranchedMenu /&gt;)
            </h2>
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 flex items-center gap-1.5 transition-colors"
            >
              <span>Open Project Drawer</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-[#080C14] border border-slate-800 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-4">
              Interactive Branch Navigation
            </span>
            <BranchedMenu
              items={[
                {
                  label: 'E-commerce Analytics',
                  children: [
                    { value: 'chat_roas', label: 'Blended ROAS by SKU', icon: Message01Icon },
                    { value: 'chat_cohorts', label: 'Repeat Purchase Cohorts', icon: Message01Icon },
                    { value: 'chat_inventory', label: 'Dead Inventory & Working Capital', icon: Message01Icon }
                  ]
                },
                {
                  label: 'Financial Modeling',
                  children: [
                    { value: 'chat_runway', label: 'Runway Forecast (Base vs Worst)', icon: Message01Icon },
                    { value: 'chat_cogs', label: 'COGS Variance Analysis', icon: Message01Icon }
                  ]
                },
                {
                  label: 'Growth & Acquisition',
                  children: [
                    { value: 'chat_meta', label: 'Meta Ads Retargeting Fatigue', icon: Message01Icon },
                    { value: 'chat_google', label: 'PMax vs Search Keyword Bids', icon: Message01Icon }
                  ]
                }
              ]}
              defaultOpen={[0, 1]}
              defaultActive={activeChatThread}
              onSelect={(val) => setActiveChatThread(val)}
              color="#94a3b8"
              accentColor="#22d3ee"
              lineColor="#1e293b"
              width={340}
              rowHeight={34}
              indent={36}
              trunk={14}
              radius={10}
              lineWidth={1.5}
              fontSize={13}
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#080C14] border border-slate-800 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300">Active Thread Context</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 font-mono">
                {activeChatThread}
              </h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed mb-6">
                Organize analytics sessions by client, store or financial model. Each node animates along SVG bezier branches directly to its queries, parquet tables, and historical charts.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400">Status: Loaded in Memory</span>
              <button 
                onClick={() => setShowHistoryDrawer(true)}
                className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                Manage All Projects
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SLOWER & VISIBLE SCROLL BENTO GRID */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-20 border-t border-slate-900 pt-16">
        <FadeIn delay={0.1}>
          <div className="border-b border-slate-800 pb-3 mb-8 flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 4. Bento Grid (Cinematic 1.35s Fade-In)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Smooth cubic-bezier curve</span>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "Natural Language SQL",
              desc: "Ask 'Which SKU burns our ad spend?' and watch instant DuckDB code compile.",
              icon: "🧠",
              badge: "DuckDB 0.4s"
            },
            {
              title: "Interactive WebGL Plotly",
              desc: "Automated, zoomable charts with synchronized cross-hair metric tooltips.",
              icon: "📊",
              badge: "60 FPS"
            },
            {
              title: "Zero-Trust MicroVM",
              desc: "Every script runs in a sterilized ephemeral container with zero system secret leaks.",
              icon: "🔒",
              badge: "E2B Isolated"
            },
            {
              title: "Autonomous Monday Watchdog",
              desc: "Schedule automated CFO summaries sent directly to Slack and email at 8 AM.",
              icon: "⚡",
              badge: "Cron Active"
            }
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.18}>
              <motion.div
                whileHover={{ y: -6, borderColor: 'rgba(34, 211, 238, 0.7)', scale: 1.01 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-8 rounded-2xl bg-[#090D14] border border-slate-800 shadow-xl relative overflow-hidden group transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-cyan-300 uppercase tracking-widest border-b border-l border-slate-800 rounded-bl-xl bg-slate-950/60">
                  {item.badge}
                </div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Creator Highlight Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-20">
        <FadeIn delay={0.2}>
          <div className="p-10 rounded-2xl bg-gradient-to-b from-[#090D14] to-black border border-cyan-500/40 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono uppercase tracking-widest mb-4">
              Architect & Creator
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Akshit Malik.</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              Engineered DataGem as an autonomous analytics agent, combining fluid kinetic frontends with heavy-duty zero-trust data compute engines.
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

      {/* Slide-over Chat History & Project Tree Drawer */}
      <ChatHistory
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        currentChatId={activeChatThread}
        onSelectChat={(id) => {
          setActiveChatThread(id);
        }}
      />
    </div>
  );
}
