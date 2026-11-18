import WatchdogModal from "./WatchdogModal";
import MarketplaceConnectorsModal from "./MarketplaceConnectorsModal";
import ExecutiveDeckModal from "./ExecutiveDeckModal";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, dashboardApi, voiceApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import Canvas from './Canvas';
import WebRTC from './WebRTC';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveChart from './InteractiveChart';
import CodeBlock from './CodeBlock';
import CommandPalette from './CommandPalette';
import PromptSuggestions from './PromptSuggestions';
import { MessageSkeleton, CodeBlockSkeleton, ProgressIndicator } from './LoadingSkeleton';
import EnhancedTableViewer from './EnhancedTableViewer';
import ChatHistory from './ChatHistory';
import Pricing from './Pricing';
import { parseMarkdownTable } from '../utils/parseMarkdownTable';
import { formatColumnName, getColumnAbbreviation } from '../utils/formatColumnName';
import { 
  generateDatasetId, 
  getChatSession, 
  saveChatSession, 
  getCurrentDatasetId,
  setCurrentDatasetId 
} from '../utils/chatHistory';
import Plot from 'react-plotly.js';
import { PieChart, Pie, Cell } from 'recharts';

import ExecutiveBriefingCard from './ExecutiveBriefingCard';
import { analyzeDatasetIntelligence } from '../utils/datasetAnalyzer';
import PromptBar from './PromptBar';
import ThoughtLine from './ThoughtLine';
import CallChip from './CallChip';
import BranchedMenu from './BranchedMenu';
import { Attachment01Icon, Globe02Icon, Message01Icon } from '@hugeicons/core-free-icons';
import { getProjects, saveProjects } from '../utils/chatHistory';
import { DOMAIN_PRESETS } from '../utils/sampleData';
import CRMStatsLedger from './CRMStatsLedger';
import GuidedTourModal from './GuidedTourModal';
import DisputeTicketModal from './DisputeTicketModal';
import { LogOut, User as UserIcon } from 'lucide-react';

// Global memory cache to persist chat state across page navigations
let chatMemoryCache = null;
if (typeof window !== 'undefined') {
  window.__DATAGEM_CLEAR_CHAT_CACHE__ = () => {
    chatMemoryCache = null;
  };
}

export default function Chat() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(chatMemoryCache?.messages || []);
  const [branches, setBranches] = useState({});
  const [currentThreadId, setCurrentThreadId] = useState('main');
  const [showCanvas, setShowCanvas] = useState(false);
  const [webrtcStatus, setWebrtcStatus] = useState('Disconnected');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const originalInputRef = useRef('');
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isConnectorsModalOpen, setIsConnectorsModalOpen] = useState(false);
  const [isWatchdogModalOpen, setIsWatchdogModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeModalData, setDisputeModalData] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
  const [genUI, setGenUI] = useState(null);
  const handleStop = () => { setLoading(false); /* Stop & Steer */ };
  const [persona, setPersona] = useState('enterprise');
  const [currentResponse, setCurrentResponse] = useState('');
  const [dataset, setDataset] = useState(chatMemoryCache?.dataset || null);
  const [datasetProfile, setDatasetProfile] = useState(chatMemoryCache?.datasetProfile || null);
  const [executiveBriefing, setExecutiveBriefing] = useState(null);
  const [activeDomainHub, setActiveDomainHub] = useState('ecom'); // 'ecom' | 'saas' | 'studio'
  const [showDomainSwitcher, setShowDomainSwitcher] = useState(false);
  const [workspaceViewMode, setWorkspaceViewMode] = useState('split'); // 'split' | 'crm' | 'chat'
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem('dg_sidebar_w')) || 320);
  const [treeHeight, setTreeHeight] = useState(() => Number(localStorage.getItem('dg_tree_h')) || 380);
  const [splitRatio, setSplitRatio] = useState(() => Number(localStorage.getItem('dg_split_ratio')) || 60); // 60% left CRM, 40% right Co-Pilot
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingTree, setIsResizingTree] = useState(false);
  const [isResizingSplit, setIsResizingSplit] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");

  // Persist Resizer Handlers across Drag Gestures
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(260, Math.min(520, e.clientX));
        setSidebarWidth(newWidth);
        localStorage.setItem('dg_sidebar_w', newWidth);
      } else if (isResizingTree) {
        const newHeight = Math.max(180, Math.min(650, e.clientY - 120));
        setTreeHeight(newHeight);
        localStorage.setItem('dg_tree_h', newHeight);
      } else if (isResizingSplit) {
        const containerWidth = window.innerWidth - (showSidebar ? sidebarWidth : 0);
        const offsetX = e.clientX - (showSidebar ? sidebarWidth : 0);
        const pct = Math.max(30, Math.min(75, Math.round((offsetX / containerWidth) * 100)));
        setSplitRatio(pct);
        localStorage.setItem('dg_split_ratio', pct);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingTree(false);
      setIsResizingSplit(false);
    };

    if (isResizingSidebar || isResizingTree || isResizingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingTree, isResizingSplit, showSidebar, sidebarWidth]);

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  const exportSingleSession = (e, session) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session.messages));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (session.title || "chat") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const startRenaming = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditSessionTitle(session.title || 'Untitled Session');
  };

  const saveRenaming = (e, sessionId) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editSessionTitle } : s));
    if (currentSessionId === sessionId) {
      setDatasetFilename(editSessionTitle);
    }
    setEditingSessionId(null);
  };

  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [expandedCodeBlocks, setExpandedCodeBlocks] = useState({});
  const [expandedOutputs, setExpandedOutputs] = useState({});
  const [executionStep, setExecutionStep] = useState(null);
  const userStorageKey = user?.id ? `datagem_sessions_user_${user.id}` : 'datagem_sessions_guest';
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem(user?.id ? `datagem_sessions_user_${user.id}` : 'datagem_sessions_guest')) || []);
  const [currentSessionId, setCurrentSessionId] = useState(chatMemoryCache?.currentSessionId || null);
  const fileInputRef = useRef(null);

  // Sync sessions to user-isolated localStorage key
  useEffect(() => {
    localStorage.setItem(userStorageKey, JSON.stringify(sessions));
  }, [sessions, userStorageKey]);

  const [connectionString, setConnectionString] = useState(chatMemoryCache?.connectionString || '');
  const [isConnected, setIsConnected] = useState(chatMemoryCache?.isConnected || false);
  // Sync current session state when current session changes
  useEffect(() => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          let newTitle = s.title;

          return { ...s, messages, dataset, profile: datasetProfile, connectionString, isConnected, title: newTitle };
        }
        return s;
      }));
    }
  }, [messages, dataset, datasetProfile, connectionString, isConnected]);

  const [showChatHistory, setShowChatHistory] = useState(false);
  const [datasetFilename, setDatasetFilename] = useState(chatMemoryCache?.datasetFilename || null);

  // Sync state to memory cache whenever it changes
  useEffect(() => {
    chatMemoryCache = {
      messages,
      dataset,
      datasetProfile,
      currentSessionId,
      connectionString,
      isConnected,
      datasetFilename
    };
  }, [messages, dataset, datasetProfile, currentSessionId, connectionString, isConnected, datasetFilename]);

  const [importUrl, setImportUrl] = useState('');
  const [gsheetUrl, setGsheetUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const messagesEndRef = useRef(null);
  const { theme, toggleTheme } = useTheme();



  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop the tracks to release the mic
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Show loading in the input box or something?
        const base = input;
        setInput(base + (base.length > 0 && !base.endsWith(' ') ? ' ' : '') + "🎙️ Transcribing...");
        
        try {
          const result = await voiceApi.transcribe(audioBlob);
          const transcript = result.transcription || result.text || result.transcript || "";
          
          setInput(base + (base.length > 0 && !base.endsWith(' ') ? ' ' : '') + transcript);
        } catch (error) {
          console.error("Transcription error:", error);
          setInput(base);
          alert("Failed to transcribe audio.");
        }
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };
  
  const toggleCodeBlock = (messageIndex, codeIndex) => {
    const key = `${messageIndex}-${codeIndex}`;
    setExpandedCodeBlocks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const toggleOutput = (messageIndex) => {
    setExpandedOutputs(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex]
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, currentResponse]);

    const loadPresetDataset = (presetKey) => {
    let mockData = [];
    let filename = "";
    if (presetKey === 'amazon_fba') {
      filename = "Amazon_FBA_Settlement_Q3.csv";
      mockData = [
        { Order_ID: "402-9981245-12345", SKU: "ELEC-W-EARBUDS", Amount: "₹2,499.00", Fee: "₹385.00", Status: "Delivered", City: "Mumbai" },
        { Order_ID: "402-7781290-99812", SKU: "ELEC-W-EARBUDS", Amount: "₹2,499.00", Fee: "₹385.00", Status: "Customer Return", City: "Delhi" },
        { Order_ID: "403-1289012-33441", SKU: "FAST-CHARGER-65W", Amount: "₹1,899.00", Fee: "₹260.00", Status: "Delivered", City: "Bangalore" },
        { Order_ID: "403-4451299-11223", SKU: "MAG-POWERBANK-10K", Amount: "₹3,299.00", Fee: "₹490.00", Status: "Delivered", City: "Hyderabad" },
        { Order_ID: "404-9812301-44556", SKU: "FAST-CHARGER-65W", Amount: "₹1,899.00", Fee: "₹260.00", Status: "Delivered", City: "Pune" }
      ];
    } else if (presetKey === 'd2c_shopify') {
      filename = "Shopify_D2C_Cohort_Orders.csv";
      mockData = [
        { Order_No: "#1092", Customer: "Aarav Sharma", CAC: "₹450", LTV: "₹2,800", Items: 3, Channel: "Meta Ads" },
        { Order_No: "#1093", Customer: "Sneha Patel", CAC: "₹380", LTV: "₹3,400", Items: 4, Channel: "Google Search" },
        { Order_No: "#1094", Customer: "Vikram Malhotra", CAC: "₹620", LTV: "₹1,950", Items: 2, Channel: "Influencer" }
      ];
    }
    setDataset(mockData);
    setDatasetFilename(filename);
    const briefing = analyzeDatasetIntelligence(mockData, filename);
    setExecutiveBriefing(briefing);
    setDatasetProfile({
      filename,
      shape: { rows: mockData.length, cols: Object.keys(mockData[0] || {}).length },
      columns: Object.keys(mockData[0] || {}),
      sample: mockData
    });
    setMessages([
      {
        role: 'assistant',
        content: `Loaded preset: **${filename}** (${mockData.length} records). Intelligence profiling complete.\n\nDetected Domain: **${briefing?.channelLabel || 'Business Data'}**.\nAsk any question or use the preset prompt suggestions below!`,
        briefing: briefing
      }
    ]);
  };

  const handleDatasetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Tier-based limits
    const maxSizes = { free: 5 * 1024 * 1024, pro: 25 * 1024 * 1024, enterprise: 100 * 1024 * 1024 };
    const tier = user?.tier?.toLowerCase() || 'free';
    const maxSize = maxSizes[tier] || maxSizes.free;

    if (file.size > maxSize) {
      alert(`File too large! Your ${tier.toUpperCase()} tier is limited to ${maxSize / (1024 * 1024)}MB. Upgrade to Pro for larger datasets.`);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data.filter(row => {
          // Remove empty rows
          return Object.values(row).some(val => val !== '');
        });
        
        if (data.length === 0) {
          alert('CSV file appears to be empty');
          return;
        }

        // Create dataset profile
        const df = data;
        const columns = Object.keys(df[0]);
        const shape = { rows: df.length, cols: columns.length };
        
        // Calculate basic stats
        const numericColumns = columns.filter(col => {
          return df.some(row => {
            const val = row[col];
            return val !== '' && !isNaN(parseFloat(val)) && isFinite(val);
          });
        });

        // Calculate statistics for numeric columns
        const stats = {};
        numericColumns.forEach(col => {
          const values = df
            .map(row => parseFloat(row[col]))
            .filter(val => !isNaN(val) && isFinite(val));
          
          if (values.length > 0) {
            const sorted = [...values].sort((a, b) => a - b);
            stats[col] = {
              min: sorted[0],
              max: sorted[sorted.length - 1],
              mean: values.reduce((a, b) => a + b, 0) / values.length,
              median: sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)],
              count: values.length,
            };
          }
        });

        const profile = {
          filename: file.name,
          shape,
          columns,
          numericColumns,
          stats,
          head: df.slice(0, 5),
          sample: df.slice(0, 10),
        };

        // Generate unique dataset ID
        const datasetId = 'sess_' + Date.now();
        setCurrentSessionId(datasetId);
        setDatasetFilename(file.name);

        setDataset(df);
        setDatasetProfile(profile);
        setIsConnected(false);
        setConnectionString('');
        
        // Compute intelligent domain-specific executive briefing
        const briefing = analyzeDatasetIntelligence(df, file.name);
        setExecutiveBriefing(briefing);

        const initMessages = [{
          role: 'assistant',
          content: `Dataset "${file.name}" ingested into DuckDB!\n\nDetected Domain: **${briefing?.channelLabel || 'Business Data'}** (${shape.rows} rows × ${shape.cols} columns).`,
          briefing: briefing
        }];
        setMessages(initMessages);

        setSessions(prev => [{
            id: datasetId,
            title: file.name,
            dataset: df,
            profile: profile,
            briefing: briefing,
            messages: initMessages,
            connectionString: '',
            isConnected: false
        }, ...prev]);
        setShowSidebar(true);
},
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleExternalImport = async (type, url) => {
    if (!url) return;
    setIsImporting(true);
    try {
      const endpoint = type === 'url' ? 'http://127.0.0.1:8001/import/url' : 'http://127.0.0.1:8001/import/gsheet';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Import failed');
      }
      
      const result = await response.json();
      const data = result.data;
      
      if (data.length === 0) {
        throw new Error('Dataset appears to be empty');
      }
      
      // Re-use the exact same profiling logic from handleDatasetUpload
      const df = data;
      const columns = Object.keys(df[0]);
      const shape = { rows: df.length, cols: columns.length };
      
      const numericColumns = columns.filter(col => {
        return df.some(row => row[col] !== '' && !isNaN(parseFloat(row[col])) && isFinite(row[col]));
      });

      const stats = {};
      numericColumns.forEach(col => {
        const values = df.map(row => parseFloat(row[col])).filter(val => !isNaN(val) && isFinite(val));
        if (values.length > 0) {
          const sorted = [...values].sort((a, b) => a - b);
          stats[col] = {
            min: sorted[0], max: sorted[sorted.length - 1],
            mean: values.reduce((a, b) => a + b, 0) / values.length,
            median: sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)],
            count: values.length,
          };
        }
      });

      const filename = result.filename || (type === 'url' ? 'Web Import' : 'Sheet Import');
      const profile = { filename, shape, columns, numericColumns, stats, head: df.slice(0, 5), sample: df.slice(0, 10) };
      
      const datasetId = 'sess_' + Date.now();
      setCurrentSessionId(datasetId);
      setDatasetFilename(filename);
      setDataset(df);
      setDatasetProfile(profile);
      setIsConnected(false);
      setConnectionString('');
      setShowSidebar(true);
      
      const initMsgs = [{
        role: 'assistant',
        content: `Successfully imported from ${type === 'url' ? 'Web' : 'Google Sheets'}!\n\nShape: ${shape.rows} rows × ${shape.cols} columns\nColumns: ${columns.join(', ')}\n\nYou can now ask me questions about this data!`,
      }];
      setMessages(initMsgs);
      
      setSessions(prev => [{
        id: datasetId,
        title: type === 'url' ? 'Web Import' : 'Google Sheets Import',
        dataset: df,
        profile: profile,
        messages: initMsgs,
        connectionString: '',
        isConnected: false
      }, ...prev]);
      
      setImportUrl('');
      setGsheetUrl('');

      
    } catch (err) {
      alert(`Error importing: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const clearDataset = () => {
    setDataset(null);
    setDatasetProfile(null);
    setMessages([]);
    setCurrentSessionId(null);
    setDatasetFilename(null);
    setIsConnected(false);
    setConnectionString('');
  };

  const handleConnectDb = (str) => {
    if (!str) return;
    const sessId = 'sess_' + Date.now();
    setCurrentSessionId(sessId);
    setIsConnected(true);
    setConnectionString(str);
    setDataset(null);
    setDatasetProfile(null);
    setDatasetFilename('Database Connection');
    
    const initMsgs = [{
      role: 'assistant',
      content: `Connected to database! You can now write read-only SQL queries.`
    }];
    setMessages(initMsgs);

    setSessions(prev => [{
      id: sessId,
      title: 'Database Connection',
      dataset: null,
      profile: null,
      messages: initMsgs,
      connectionString: str,
      isConnected: true
    }, ...prev]);
  };
  
  const handlePaletteAction = (action) => {
    if (action === 'open') setIsPaletteOpen(true);
    if (action === 'new_chat') handleNewChat();
    // other actions could be added here
  };

  const handleNewChat = () => {
    clearDataset();
  };
  
  const restoreSession = (sess) => {
    setCurrentSessionId(sess.id);
    setDatasetFilename(sess.title);
    setDataset(sess.dataset);
    setDatasetProfile(sess.profile);
    setMessages(sess.messages || []);
    setConnectionString(sess.connectionString || '');
    setIsConnected(sess.isConnected || false);
  };




  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      setCurrentResponse('');
      localStorage.removeItem('datagem_messages');
    }
  };

  const copyToClipboard = (text, messageIndex) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageIndex(messageIndex);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Parse response to extract images, code blocks, output, and text
  const parseResponse = (response) => {
    const codeBlocks = [];
    const outputs = [];
    let text = response;
    
    const plotlyRegex = /PLOTLY_JSON:(\{[\s\S]*?\})(?=\n|$)/g; // Legacy fallback
    const strictPlotlyRegex = /<<<PLOTLY_JSON_START>>>([\s\S]*?)<<<PLOTLY_JSON_END>>>/g;
    let match;
    const plotlyData = [];
    const responseCopyForPlotly = response;
    // Try strict regex first
    while ((match = strictPlotlyRegex.exec(responseCopyForPlotly)) !== null) {
      try {
        const jsonStr = match[1].trim();
        plotlyData.push(JSON.parse(jsonStr));
        text = text.replace(match[0], ''); // Remove from text
      } catch (e) {
        console.error("Failed to parse Strict Plotly JSON", e);
      }
    }
    
    // Removed legacy fallback because it causes empty graphs if it mis-matches

    
    // Extract code blocks that were executed
    // Look for "Executing: run_python_code" followed by code blocks
    const executingRegex = /(?: )?\*\*Executing:\*\* `([^`]+)`/g;
    const codeRegex = /```(?:python)?\n([\s\S]*?)```/g;
    const outputRegex = /\*\*Code Output:\*\*\n```\n([\s\S]*?)```/g;
    
    // Find all "Executing:" markers
    const executingMatches = [];
    let execMatch;
    const responseCopy = response; // Create a copy for regex
    while ((execMatch = executingRegex.exec(responseCopy)) !== null) {
      executingMatches.push({
        tool: execMatch[1],
        index: execMatch.index,
        fullMatch: execMatch[0],
      });
    }
    
    // Find all code blocks (including Python code and output)
    const codeMatches = [];
    let codeMatch;
    while ((codeMatch = codeRegex.exec(responseCopy)) !== null) {
      codeMatches.push({
        code: codeMatch[1].trim(),
        index: codeMatch.index,
        fullMatch: codeMatch[0],
        isPython: codeMatch[0].includes('```python'),
      });
    }
    
    // Extract code outputs
    let outputMatch;
    while ((outputMatch = outputRegex.exec(responseCopy)) !== null) {
      let rawOutput = outputMatch[1].trim();
      // Remove Plotly JSON from the output block itself so it doesn't clutter the UI
      rawOutput = rawOutput.replace(/<<<PLOTLY_JSON_START>>>[\s\S]*?<<<PLOTLY_JSON_END>>>/g, '');
      rawOutput = rawOutput.replace(/PLOTLY_JSON:\{[\s\S]*?\}(?=\n|$)/g, '');
      if (rawOutput.trim().length > 0) {
          outputs.push(rawOutput.trim());
      }
      // Remove from text
      text = text.replace(outputMatch[0], '');
    }
    
    // Match executing markers with their code blocks
    executingMatches.forEach(exec => {
      if (exec.tool === 'run_python_code') {
        // Find the first Python code block after this executing marker
        const followingCode = codeMatches.find(
          code => code.index > exec.index && 
                  code.index < exec.index + 2000 && 
                  code.isPython
        );
        if (followingCode) {
          codeBlocks.push({
            tool: exec.tool,
            code: followingCode.code,
          });
          // CRITICAL FIX: Remove the python code block and the executing marker from the raw markdown text 
          // so it doesn't render twice!
          text = text.replace(followingCode.fullMatch, '');
          text = text.replace(exec.fullMatch, '');
        }
      }
    });
    
    // Clean up text - remove code block markers but keep error messages and explanations
    // Only remove the executing markers, keep everything else including errors
    text = text.replace(/(?: )?\*\*Executing:\*\* `[^`]+`/g, '');
    // Remove code blocks that are already extracted, but keep error messages
    // Only remove code blocks that were already extracted (matched with executing markers)
    const extractedCodeIndices = new Set();
    executingMatches.forEach(exec => {
      if (exec.tool === 'run_python_code') {
        const followingCode = codeMatches.find(
          code => code.index > exec.index && 
                  code.index < exec.index + 2000 && 
                  code.isPython
        );
        if (followingCode) {
          extractedCodeIndices.add(followingCode.index);
        }
      }
    });
    
    // Remove only the code blocks that were extracted, keep others (like markdown code blocks in explanations)
    codeMatches.forEach(codeMatch => {
      if (extractedCodeIndices.has(codeMatch.index)) {
        text = text.replace(codeMatch.fullMatch, '');
      }
    });
    
    // Remove code output markers (they're in separate outputs array)
    text = text.replace(/\*\*Code Output:\*\*\n```\n[\s\S]*?```/g, '');
    
    // Aggressively remove ALL markdown code blocks from the conversational text so they NEVER show up twice
    text = text.replace(/```(?:python)?\n[\s\S]*?```/g, '');
    
    // Remove ANY executing markers that might have been left behind
    text = text.replace(/(?: )?\*\*Executing:\*\* `([^`]+)`/g, '');
    
    // Clean up multiple newlines but preserve structure
    text = text.replace(/\n{4,}/g, '\n\n\n'); // Max 3 consecutive newlines
    text = text.trim();
    
    // If text is empty or just whitespace after cleanup, but we have code/output, add a note
    if (!text || text.length < 10) {
      if (codeBlocks.length > 0 || outputs.length > 0 || plotlyData.length > 0) {
        // Text summary might be coming, or was removed - don't add placeholder here
        // The backend should handle providing a summary
        console.warn(' Text is empty after parsing but we have code/output/plots');
      }
    }
    
    return { text, plots: plotlyData, code: codeBlocks, outputs };
  };

  const exportChat = () => {
    let markdown = `# DataGem Chat Export\n`;
    markdown += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    if (dataset && datasetProfile) {
      markdown += `**Dataset:** ${datasetFilename || 'Unknown'} (${datasetProfile.shape.rows} rows × ${datasetProfile.shape.cols} columns)\n\n`;
    }
    markdown += `---\n\n`;
    messages.forEach((m) => {
      if (m.role === 'user') {
        markdown += `## User\n\n${m.content}\n\n`;
      } else {
        markdown += `## DataGem\n\n${m.content || ''}\n\n`;
        if (m.code && m.code.length > 0) {
          m.code.forEach((cb) => {
            markdown += `\`\`\`python\n${cb.code}\n\`\`\`\n\n`;
          });
        }
      }
      markdown += `---\n\n`;
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datagem-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Title is set to dataset name upon upload, no AI generation needed.
    
    setInput('');
    
    
    setLoading(true);
    setCurrentResponse('');
    setExecutionStep(0); // Start with "Analyzing"

    try {
      // Wait a moment to show "Analyzing" step
      await new Promise(resolve => setTimeout(resolve, 500));
      setExecutionStep(1); // "Executing"
      
      const streamStartTime = Date.now();
      const MIN_EXECUTING_TIME = 600; // Minimum time to show "Executing" step (600ms)
      
      // Use datasetPath if available (for out-of-core DuckDB processing)
      const streamDataset = dataset;
      const activeSession = sessions.find(s => s.id === currentSessionId);
      const streamDatasetPath = activeSession ? activeSession.datasetPath : null;
      
      const reader = await chatAPI.streamChat(input, null, streamDataset, streamDatasetPath, isConnected ? connectionString : null, currentSessionId || "default");
      if (!reader) {
        throw new Error('Failed to get response stream');
      }
      
      const decoder = new TextDecoder();
      const streamReader = typeof reader.getReader === 'function' ? reader.getReader() : reader;
      let accumulatedResponse = '';
      let lastChunkTime = Date.now();
      const TIMEOUT_MS = dataset && dataset.length > 10000 ? 300000 : 120000; // 5min for large datasets, 2min otherwise

      // Create a timeout promise
      const createTimeout = () => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Stream timeout: No response received for 2 minutes. The request may have failed.'));
          }, TIMEOUT_MS);
        });
      };

      try {
        while (true) {
          // Race between reading and timeout
          const readPromise = streamReader.read();
          const timeoutPromise = createTimeout();
          
          let result;
          try {
            result = await Promise.race([readPromise, timeoutPromise]);
          } catch (timeoutError) {
            streamReader.cancel();
            throw timeoutError;
          }

          const { done, value } = result;
          if (done) {
            break;
          }

          if (value) {
            lastChunkTime = Date.now(); // Update last chunk time
            const chunk = decoder.decode(value, { stream: true });
            accumulatedResponse += chunk;
            setCurrentResponse(accumulatedResponse);
            // Tier 4: Streaming JSON parser for GenUI
            if (accumulatedResponse.includes('{"type":"gen_ui"')) {
              try {
                const match = accumulatedResponse.match(/{"type":"gen_ui"[^}]*}/);
                if (match) {
                  setGenUI(JSON.parse(match[0]));
                }
              } catch(e) {}
            }
          }
        }
        
        // Final decode flush
        try {
          const remaining = decoder.decode(new Uint8Array(), { stream: false });
          if (remaining) {
            accumulatedResponse += remaining;
            setCurrentResponse(accumulatedResponse);
          }
        } catch (e) {
          // Ignore decode errors on final flush
        }
      } finally {
        streamReader.releaseLock();
      }

      // Ensure "Executing" step is visible for minimum time
      const executingElapsed = Date.now() - streamStartTime;
      if (executingElapsed < MIN_EXECUTING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_EXECUTING_TIME - executingElapsed));
      }

      // Parse response to extract images and code
      setExecutionStep(2); // "Summarizing"
      const parsedResponse = parseResponse(accumulatedResponse);
      
      // Wait a moment to show "Summarizing" step before hiding the progress indicator
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: parsedResponse.text,
          plots: parsedResponse.plots,
          code: parsedResponse.code,
          outputs: parsedResponse.outputs,
        },
      ]);
      setCurrentResponse('');
      setExecutionStep(null);
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Failed to connect') || error.message?.includes('Cannot connect')) {
        errorMessage = 'Failed to connect to the backend. Please make sure:\n\n1. The backend is running on http://127.0.0.1:8000\n2. CORS is properly configured\n3. No firewall is blocking the connection\n\nYou can start the backend with: `cd datagem_backend && python main.py`';
      } else if (error.message?.includes('Failed to stream') || error.message?.includes('Failed to connect')) {
        errorMessage = 'Failed to connect to the chat service. Please make sure the backend is running on http://127.0.0.1:8000';
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Server authentication error. Please try again.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('ERR_NETWORK')) {
        errorMessage = 'Network error. Please check if the backend server is running and accessible.';
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Request timed out. The backend may be processing a large request. Please try:\n\n1. Check the backend console for errors\n2. Try a simpler question\n3. Wait a moment and try again';
      } else if (error.message?.includes('RATE_LIMIT')) {
        errorMessage = error.message.replace('RATE_LIMIT:', '');
        setShowPricing(true);
      } else if (error.message?.includes('Server error')) {
        errorMessage = `Server error: ${error.message}`;
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
      setCurrentResponse('');
      setExecutionStep(null);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || loading) return;
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setCurrentResponse('');
    setExecutionStep(1);

    try {
      const streamDataset = dataset;
      const activeSession = sessions.find(s => s.id === currentSessionId);
      const streamDatasetPath = activeSession ? activeSession.datasetPath : null;

      const reader = await chatAPI.streamChat(text, null, streamDataset, streamDatasetPath, isConnected ? connectionString : null, currentSessionId || "default");
      if (!reader) throw new Error('Failed to get response stream');
      const decoder = new TextDecoder();
      const streamReader = typeof reader.getReader === 'function' ? reader.getReader() : reader;
      let accumulated = '';
      while (true) {
        const { done, value } = await streamReader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setCurrentResponse(accumulated);
      }
      const parsed = parseResponse(accumulated);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: parsed.text,
        plots: parsed.plots,
        code: parsed.code,
        outputs: parsed.outputs
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Error executing query: ${err.message || 'Stream error'}` }]);
    } finally {
      setCurrentResponse('');
      setLoading(false);
      setExecutionStep(null);
    }
  };

  return (
    <>
    <AnimatePresence>
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onAction={handlePaletteAction} 
      />
    </AnimatePresence>
    <div className="flex h-screen bg-slate-50 dark:bg-[#07090E] text-slate-800 dark:text-slate-100 font-sans tracking-tight transition-colors duration-200 relative overflow-hidden z-0 selection:bg-sky-500 selection:text-white">
      
      {showCanvas && (
        <div className="w-1/3 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D14] z-20 shadow-2xl relative flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">Artifacts Canvas</h2>
            <button onClick={() => setShowCanvas(false)} className="text-slate-400 hover:text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Canvas artifacts={messages.filter(m => m.code || m.plots).map((m, i) => ({ title: 'Artifact ' + (i+1), type: m.code ? 'code' : 'markdown', content: m.code || 'Plot/Data Content' }))} />
          </div>
        </div>
      )}
      {/* Deep Cyan-Blue & Emerald Matrix Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] bg-sky-600/15 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] -right-[10%] w-[65vw] h-[65vw] bg-emerald-600/10 rounded-full blur-[140px]" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>
      
      {/* Sidebar with Resizable Width and Reordered Layout */}
      <AnimatePresence mode="wait">
      {showSidebar && (
          <motion.div
            initial={{ marginLeft: -sidebarWidth, opacity: 0 }}
            animate={{ marginLeft: 0, opacity: 1 }}
            exit={{ marginLeft: -sidebarWidth, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: `${sidebarWidth}px` }}
            className="flex-shrink-0 backdrop-blur-xl bg-white/90 dark:bg-[#090D14]/90 border-r border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors flex flex-col z-20 relative"
          >
            <div className="h-full flex flex-col p-3.5 space-y-3 overflow-hidden select-none">
              {/* Top: New Chat button */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs shadow-sm transition flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                New Chat Session
              </button>

              {/* 1. TOP SECTION: Projects & Chat Tree (Promoted to Top) */}
              <div 
                style={{ height: `${treeHeight}px` }} 
                className="flex flex-col flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h2 className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🗂️</span> Projects &amp; Chat Tree
                  </h2>
                  <button
                    onClick={() => setShowChatHistory(true)}
                    className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + New Folder
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                  <BranchedMenu
                    items={getProjects().map(proj => ({
                      label: proj.name,
                      children: (proj.chats || []).map(chat => ({
                        value: chat.id,
                        label: chat.title,
                        icon: Message01Icon
                      }))
                    }))}
                    defaultOpen={[0, 1]}
                    defaultActive="chat_roas"
                    onSelect={(val, item) => {
                      const foundSession = sessions.find(s => s.id === val || s.title === item.label);
                      if (foundSession) {
                        restoreSession(foundSession);
                      } else {
                        const fakeSess = {
                          id: val,
                          title: item.label,
                          messages: [{
                            role: 'assistant',
                            content: `Switched to thread **"${item.label}"**.\n\nYou can now run DuckDB queries against this project context.`
                          }],
                          dataset,
                          profile: datasetProfile
                        };
                        restoreSession(fakeSess);
                      }
                    }}
                    color="#64748b"
                    accentColor="#0284c7"
                    lineColor="#cbd5e1"
                    width={sidebarWidth - 36}
                    rowHeight={30}
                    indent={24}
                    trunk={10}
                    radius={6}
                    lineWidth={1.5}
                    fontSize={12}
                    drawDuration={200}
                    foldDuration={150}
                  />

                  {/* Active Memory Sessions */}
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Recent Sessions ({sessions.length})</span>
                    {sessions.map(s => (
                      <div
                        key={s.id}
                        onClick={() => restoreSession(s)}
                        className={`w-full group cursor-pointer flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-mono transition-colors mb-0.5 ${currentSessionId === s.id ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      >
                        <span className="truncate flex-1">{s.title || 'Untitled Session'}</span>
                        <span className="text-[9px] text-slate-400 ml-1.5">{s.messages?.length || 0}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Resize Slider between Tree and Health Score */}
                <div 
                  onMouseDown={() => setIsResizingTree(true)}
                  className="h-2 w-full cursor-row-resize flex items-center justify-center hover:bg-sky-500/20 rounded mt-1.5 transition-colors group"
                  title="Drag up or down to adjust Tree vs Health Score height"
                >
                  <div className="w-8 h-1 bg-slate-300 dark:bg-slate-700 group-hover:bg-sky-500 rounded-full" />
                </div>
              </div>

              {/* 2. BOTTOM SECTION: Data Health Score & Column Metadata (Below Tree) */}
              {datasetProfile && (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-2 custom-scrollbar pr-0.5">
                  <div 
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-sky-400 transition"
                    onClick={() => navigate('/data-health')}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span>🩺</span> Data Health Score
                      </span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Inspect &rarr;</span>
                    </div>
                    <div className="h-16 relative flex items-center justify-center">
                      <PieChart width={80} height={80}>
                        <Pie
                          data={[
                            { name: 'Healthy', value: 85, color: '#10b981' },
                            { name: 'Issues', value: 15, color: '#ef4444' }
                          ]}
                          cx="50%" cy="50%" innerRadius={24} outerRadius={36}
                          paddingAngle={4} dataKey="value" stroke="none"
                        >
                          {[{color: '#10b981'}, {color: '#ef4444'}].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="absolute flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">File</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{datasetFilename || 'amazon_in_settlement'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Rows / Records</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{dataset?.length || datasetProfile.totalRows || 8}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Columns</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{datasetProfile.columns?.length || 0}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] font-mono text-slate-500 block mb-1">Drag Column to Chat:</label>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {datasetProfile.columns?.map((col, idx) => {
                          const colName = typeof col === 'string' ? col : col.name;
                          return (
                            <div 
                              key={idx}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', colName)}
                              className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded cursor-grab active:cursor-grabbing hover:border-sky-400 transition text-slate-700 dark:text-slate-300"
                              title={colName}
                            >
                              {colName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Resize Bar on Sidebar Right Border */}
            <div
              onMouseDown={() => setIsResizingSidebar(true)}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-sky-500/30 transition-colors z-30"
              title="Drag horizontally to resize sidebar width"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 overflow-hidden min-h-0 z-10">
        {/* Header - Split into Top Bar and Sub Menu Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 backdrop-blur-xl bg-white/90 dark:bg-[#090D14]/90 border-b border-slate-200 dark:border-slate-800/80 transition-colors z-20 relative flex flex-col"
        >
          {/* Top Row: Brand & Theme Toggle */}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center justify-center w-8 h-8 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </motion.button>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  DG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white font-sans">DataGem<span className="text-sky-600 dark:text-sky-400">.ai</span></h1>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono rounded font-medium">
                      v2.0
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-Click Domain Hub Switcher Pill */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowDomainSwitcher(!showDomainSwitcher)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-all text-slate-700 dark:text-slate-200"
                >
                  <span className="text-xs">{DOMAIN_PRESETS[activeDomainHub]?.icon}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{DOMAIN_PRESETS[activeDomainHub]?.name}</span>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 px-1 py-0.2 rounded">
                    {DOMAIN_PRESETS[activeDomainHub]?.badge}
                  </span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {showDomainSwitcher && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 space-y-1">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">Active Domain Workspace</div>
                    {Object.entries(DOMAIN_PRESETS).map(([key, domain]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveDomainHub(key);
                          setShowDomainSwitcher(false);
                          const demoRows = domain.data;
                          setDataset(demoRows);
                          const profile = {
                            filename: domain.datasetName,
                            totalRows: demoRows.length,
                            columns: Object.keys(demoRows[0] || {}),
                            columnTypes: Object.keys(demoRows[0] || {}).reduce((acc, col) => {
                              acc[col] = typeof demoRows[0][col] === 'number' ? 'numeric' : 'categorical';
                              return acc;
                            }, {}),
                            fileSize: "64 KB",
                            processedAt: new Date().toISOString()
                          };
                          setDatasetProfile(profile);
                          try {
                            const briefing = analyzeDatasetIntelligence(demoRows, profile.columns);
                            setExecutiveBriefing(briefing);
                          } catch (err) {
                            console.error("Briefing error:", err);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                          activeDomainHub === key 
                            ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{domain.icon}</span>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{domain.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{domain.datasetName}</div>
                          </div>
                        </div>
                        {activeDomainHub === key && <span className="text-sky-600 dark:text-sky-400 text-xs font-semibold">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-sans text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                DuckDB Active
              </span>

              {/* User Profile Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[10px] font-bold">
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[140px] truncate">{user?.email || 'Authenticated'}</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Explicit Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/40 transition-colors shadow-sm"
                title="Log out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Sub Row: Clean View Switcher & Consolidated Tools Menu */}
          <div className="px-6 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2">
              {/* Segmented View Mode Controller */}
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setWorkspaceViewMode('split')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    workspaceViewMode === 'split' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ⚡ CRM + AI Split
                </button>
                <button
                  onClick={() => setWorkspaceViewMode('crm')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    workspaceViewMode === 'crm' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📊 Full CRM
                </button>
                <button
                  onClick={() => setWorkspaceViewMode('chat')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    workspaceViewMode === 'chat' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💬 Full Chat
                </button>
              </div>

              {/* Primary Fast Actions */}
              <button
                onClick={() => {
                  setWorkspaceViewMode('split');
                  setIsTourOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors font-medium"
              >
                <span>⚡</span> Guided Tour
              </button>

              <button
                onClick={() => setIsDeckModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors font-medium"
              >
                <span>📄</span> Board Deck &amp; PDF
              </button>

              {/* Consolidated "More Tools & Portals" Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreTools(!showMoreTools)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors font-medium"
                >
                  <span>⋯</span> Tools &amp; Pages <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {showMoreTools && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5">
                    <button
                      onClick={() => { setIsConnectorsModalOpen(true); setShowMoreTools(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span>⚡</span> Marketplace Hub
                    </button>
                    <button
                      onClick={() => { setIsWatchdogModalOpen(true); setShowMoreTools(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span>🛡️</span> Autonomous Watchdogs
                    </button>
                    <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                    <Link
                      to="/dashboard"
                      onClick={() => setShowMoreTools(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span>📊</span> Analytics Dashboard
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setShowMoreTools(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span>💳</span> Pricing &amp; Plans
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setShowMoreTools(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span>ℹ️</span> About Platform
                    </Link>
                    {(user?.tier?.toLowerCase() === 'enterprise' || 
                      user?.email?.toLowerCase() === 'aakshitmalik@gmail.com' ||
                      user?.email?.toLowerCase() === 'founder@company.com') && (
                      <>
                        <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                        <Link
                          to="/admin"
                          onClick={() => setShowMoreTools(false)}
                          className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <span>⚙️</span> Admin Portal
                        </Link>
                        <Link
                          to="/design-lab"
                          onClick={() => setShowMoreTools(false)}
                          className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <span>🛠️</span> Design Lab
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={exportChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors font-medium"
                    title="Export chat history"
                  >
                    Export
                  </button>
                  <button
                    onClick={clearChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md transition-colors font-medium"
                    title="Clear chat history"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* WORKSPACE CONTENT AREA (SPLIT CRM OR FULL VIEW) */}
        {workspaceViewMode === 'crm' ? (
          <CRMStatsLedger
            dataset={dataset}
            activeDomain={activeDomainHub}
            onIngestFile={(newRows, filename) => {
              setDataset(newRows);
              setDatasetFilename(filename);
              if (newRows && newRows.length > 0) {
                const cols = Object.keys(newRows[0]);
                const profile = {
                  filename,
                  totalRows: newRows.length,
                  columns: cols,
                  columnTypes: cols.reduce((acc, col) => {
                    acc[col] = typeof newRows[0][col] === 'number' ? 'numeric' : 'categorical';
                    return acc;
                  }, {}),
                  head: newRows.slice(0, 5),
                  sample: newRows.slice(0, 10)
                };
                setDatasetProfile(profile);
                setExecutiveBriefing(analyzeDatasetIntelligence(newRows, cols));
              }
            }}
            onViewDispute={(row) => {
              setDisputeModalData(row);
              setIsDisputeModalOpen(true);
            }}
            onConnectMarketplace={() => setIsConnectorsModalOpen(true)}
            onAskAI={(promptText) => {
              setWorkspaceViewMode('split');
              setInput(promptText);
              // Submit prompt
              handleSendMessage(promptText);
            }}
          />
        ) : workspaceViewMode === 'split' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 font-sans relative">
            {/* Left Column: High Density CRM Ledger & Stats (Adjustable Width via SplitRatio Slider) */}
            <div 
              style={{ width: `${splitRatio}%` }}
              className="flex-1 flex flex-col overflow-hidden min-w-[320px] transition-[width] duration-75"
            >
              <CRMStatsLedger
                dataset={dataset}
                activeDomain={activeDomainHub}
                activeTourStep={isTourOpen ? activeTourStep : null}
                onConnectMarketplace={() => setIsConnectorsModalOpen(true)}
                onIngestFile={(newRows, filename) => {
                  setDataset(newRows);
                  setDatasetFilename(filename);
                  if (newRows && newRows.length > 0) {
                    const cols = Object.keys(newRows[0]);
                    const profile = {
                      filename,
                      totalRows: newRows.length,
                      columns: cols,
                      columnTypes: cols.reduce((acc, col) => {
                        acc[col] = typeof newRows[0][col] === 'number' ? 'numeric' : 'categorical';
                        return acc;
                      }, {}),
                      head: newRows.slice(0, 5),
                      sample: newRows.slice(0, 10)
                    };
                    setDatasetProfile(profile);
                    setExecutiveBriefing(analyzeDatasetIntelligence(newRows, cols));
                  }
                }}
                onViewDispute={(row) => {
                  setDisputeModalData(row);
                  setIsDisputeModalOpen(true);
                }}
                onAskAI={(promptText) => {
                  setInput(promptText);
                  handleSendMessage(promptText);
                }}
              />
            </div>

            {/* Horizontal Drag Resize Handle between CRM Ledger and Co-Pilot Rail */}
            <div
              onMouseDown={() => setIsResizingSplit(true)}
              className="hidden lg:flex w-2 items-center justify-center cursor-col-resize hover:bg-sky-500/30 transition-colors z-20 bg-slate-200/80 dark:bg-slate-800/80 group"
              title="Drag horizontally to adjust CRM vs Co-Pilot Rail width"
            >
              <div className="w-0.5 h-8 bg-slate-400 dark:bg-slate-600 group-hover:bg-sky-500 rounded-full" />
            </div>

            {/* Right Column: Persistent AI Co-Pilot Chat Rail (Adjustable Width) */}
            <div 
              style={{ width: `${100 - splitRatio}%` }}
              className="flex flex-col bg-white dark:bg-[#070A10] border-l border-slate-200 dark:border-slate-800/80 overflow-hidden min-h-0 min-w-[280px] relative transition-colors"
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090D14] flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-900 dark:text-white">DataGem Co-Pilot Rail</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">In-Memory DuckDB</span>
                </div>
                <button
                  onClick={() => setWorkspaceViewMode('chat')}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-sans"
                  title="Expand to Full Screen"
                >
                  Expand ↗
                </button>
              </div>

              {/* Chat Messages inside Split Rail */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-sans space-y-3">
                    <div className="text-3xl">💎</div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">Click any row in the CRM table to run an instant AI audit.</p>
                    <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
                      <button
                        onClick={() => handleSendMessage("Audit all weight handling overcharges and calculate reclaimable cash")}
                        className="p-2 text-left bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        ⚡ "Find weight overcharges on Amazon"
                      </button>
                      <button
                        onClick={() => handleSendMessage("Which SKUs are bleeding net cash after accounting for returns and commissions?")}
                        className="p-2 text-left bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        📉 "Identify my top 3 Hidden Bleeders"
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} text-xs font-sans mb-3`}>
                      <div className={`w-full max-w-[95%] rounded-xl p-3.5 ${
                        message.role === 'user' 
                          ? 'bg-sky-50 dark:bg-[#0B1524] text-sky-950 dark:text-sky-100 border border-sky-200 dark:border-sky-500/40 ml-auto' 
                          : 'bg-white dark:bg-[#090D14] text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}>
                        {message.plots && message.plots.filter(p => p && p.data && p.data.length > 0).map((plot, i) => {
                          const isDark = document.documentElement.classList.contains('dark');
                          const textColor = isDark ? '#e5e7eb' : '#374151';
                          const gridColor = isDark ? '#374151' : '#e5e7eb';
                          const themedLayout = {
                            ...plot.layout,
                            autosize: true,
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { ...plot.layout?.font, color: textColor, size: 10 },
                            margin: { l: 45, r: 15, t: 30, b: 50 },
                            xaxis: { ...plot.layout?.xaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor, size: 9 }, titlefont: { color: textColor, size: 10 } },
                            yaxis: { ...plot.layout?.yaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor, size: 9 }, titlefont: { color: textColor, size: 10 } },
                            legend: { ...plot.layout?.legend, font: { color: textColor, size: 9 } },
                            title: { ...plot.layout?.title, font: { color: textColor, size: 11 } }
                          };
                          return (
                            <div key={i} className="my-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                              <Plot
                                data={plot.data}
                                layout={themedLayout}
                                useResizeHandler={true}
                                style={{ width: '100%', minHeight: '270px' }}
                                config={{ responsive: true, displayModeBar: false }}
                              />
                            </div>
                          );
                        })}
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-[11px]">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/80">{children}</thead>,
                            tbody: ({ children }) => <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800/60">{children}</tbody>,
                            th: ({ children }) => <th className="px-2.5 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{children}</th>,
                            td: ({ children }) => <td className="px-2.5 py-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-300">{children}</td>,
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-800 dark:text-slate-200 leading-relaxed text-xs">{children}</p>,
                            blockquote: ({ children }) => <blockquote className="border-l-2 border-sky-500 pl-2.5 py-1 my-2 bg-sky-50/50 dark:bg-sky-950/20 text-slate-700 dark:text-slate-300 text-[11px] rounded-r">{children}</blockquote>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Prompt Bar inside Rail */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090D14]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim() || loading) return;
                    handleSendMessage(input);
                    setInput('');
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask co-pilot about any row, SKU, or metric..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold font-sans disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
        /* Full-screen Chat Mode */
        <div className="flex-1 overflow-y-auto px-8 py-12 transition-colors min-h-0" style={{ scrollBehavior: 'smooth' }}>
          <div className="max-w-7xl mx-auto pb-8">
            {copiedMessageIndex !== null && (
              <div className="fixed top-4 right-4 bg-accent-500 text-white px-4 py-2 rounded-lg  z-50 animate-fade-in">
                ✓ Copied to clipboard!
              </div>
            )}
            
            {(!dataset && !isConnected) ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative py-8 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 min-h-full w-full max-w-7xl mx-auto px-4"
              >
                {/* Left Column: Welcome & Modern Upload Grid */}
                <div className="flex-1 flex flex-col items-center text-center w-full">

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-8 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/80 text-sky-400 text-xs font-mono mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Autonomous OLAP Sandbox Ready
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 font-sans">
                    Accelerate your data <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-white">intelligence</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
                    Upload any CSV or link your marketplace store to auto-generate executive briefings, audit fee leakage, and query with vector copilot.
                  </p>
                </motion.div>
                
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleDatasetUpload}
                  className="hidden"
                />

                                  {/* 1-Click Instant Demo Presets for 3 Domain Hubs */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10">
                    <span className="text-xs font-mono text-slate-400">⚡ Instant Domain Hubs:</span>
                    <button
                      onClick={() => {
                        setActiveDomainHub('ecom');
                        const demoRows = DOMAIN_PRESETS.ecom.data;
                        setDataset(demoRows);
                        const profile = {
                          filename: DOMAIN_PRESETS.ecom.datasetName,
                          totalRows: demoRows.length,
                          columns: Object.keys(demoRows[0]),
                          columnTypes: Object.keys(demoRows[0]).reduce((acc, col) => {
                            acc[col] = typeof demoRows[0][col] === 'number' ? 'numeric' : 'categorical';
                            return acc;
                          }, {}),
                          fileSize: "64 KB",
                          processedAt: new Date().toISOString()
                        };
                        setDatasetProfile(profile);
                        setExecutiveBriefing(analyzeDatasetIntelligence(demoRows, profile.columns));
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>🛒 E-Commerce &amp; Retail (₹18L GMV)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDomainHub('saas');
                        const demoRows = DOMAIN_PRESETS.saas.data;
                        setDataset(demoRows);
                        const profile = {
                          filename: DOMAIN_PRESETS.saas.datasetName,
                          totalRows: demoRows.length,
                          columns: Object.keys(demoRows[0]),
                          columnTypes: Object.keys(demoRows[0]).reduce((acc, col) => {
                            acc[col] = typeof demoRows[0][col] === 'number' ? 'numeric' : 'categorical';
                            return acc;
                          }, {}),
                          fileSize: "48 KB",
                          processedAt: new Date().toISOString()
                        };
                        setDatasetProfile(profile);
                        setExecutiveBriefing(analyzeDatasetIntelligence(demoRows, profile.columns));
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-sky-500/50 text-sky-300 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>📈 B2B SaaS &amp; Growth (NDR &amp; Churn)</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveDomainHub('studio');
                        const demoRows = DOMAIN_PRESETS.studio.data;
                        setDataset(demoRows);
                        const profile = {
                          filename: DOMAIN_PRESETS.studio.datasetName,
                          totalRows: demoRows.length,
                          columns: Object.keys(demoRows[0]),
                          columnTypes: Object.keys(demoRows[0]).reduce((acc, col) => {
                            acc[col] = typeof demoRows[0][col] === 'number' ? 'numeric' : 'categorical';
                            return acc;
                          }, {}),
                          fileSize: "32 KB",
                          processedAt: new Date().toISOString()
                        };
                        setDatasetProfile(profile);
                        setExecutiveBriefing(analyzeDatasetIntelligence(demoRows, profile.columns));
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>⚡ Universal Studio (DuckDB OLAP)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-2 z-10">
                  
                  {/* Dedicated Amazon & Flipkart Seller Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -3 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="group bg-[#090D14]/90 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all cursor-pointer flex flex-col items-start text-left justify-between relative overflow-hidden h-[190px]"
                  >
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                    
                    <div className="w-full flex items-center justify-between z-10">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-inner">
                        ⚡
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        NEW · SELLER HUB
                      </span>
                    </div>

                    <div className="z-10 mt-2">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        Amazon &amp; Flipkart Report
                        <span className="text-xs text-slate-500 font-mono">(.csv)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Instant MTR fee breakdown, FBA commission audits, return rate leakage &amp; net settlement calculation.
                      </p>
                    </div>

                    <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-emerald-400 z-10">
                      <span>Upload Seller CSV →</span>
                    </div>
                  </motion.div>

                  {/* Standard Universal CSV Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -3 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="group bg-[#090D14]/90 backdrop-blur-xl p-6 rounded-2xl border border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_30px_rgba(2,132,199,0.2)] transition-all cursor-pointer flex flex-col items-start text-left justify-between relative overflow-hidden h-[190px]"
                  >
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
                    
                    <div className="w-full flex items-center justify-between z-10">
                      <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center font-bold text-lg shadow-inner">
                        📊
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        ZERO-COPY OLAP
                      </span>
                    </div>

                    <div className="z-10 mt-2">
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                        Universal Business CSV
                        <span className="text-xs text-slate-500 font-mono">Any Schema</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Auto-detects GMV, payouts, dates &amp; SKUs. Instant executive summary dashboard with one-click follow-up queries.
                      </p>
                    </div>

                    <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-sky-400 z-10">
                      <span>Browse Files or Drag &amp; Drop →</span>
                    </div>
                  </motion.div>

                  {/* Web Import Card */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="bg-[#090D14]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[190px] text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5">
                          🌐 Import from Public URL
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ingest remote CSV, JSON or public API endpoint directly into DuckDB sandbox.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <input 
                        type="url" 
                        placeholder="https://example.com/data.csv" 
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/80 text-white focus:border-sky-500 outline-none font-mono"
                      />
                      <button 
                        onClick={() => handleExternalImport('url', importUrl)}
                        disabled={isImporting || !importUrl}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 hover:text-white text-xs font-mono rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isImporting ? 'Ingesting…' : 'Fetch & Analyze'}
                      </button>
                    </div>
                  </motion.div>

                  {/* Google Sheets Card */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-[#090D14]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-[190px] text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1.5">
                          📑 Sync Google Sheets
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Live sync published Google Sheet to run instant cohort queries and watchdogs.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <input 
                        type="url" 
                        placeholder="https://docs.google.com/spreadsheets/..." 
                        value={gsheetUrl}
                        onChange={(e) => setGsheetUrl(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-slate-950/80 text-white focus:border-emerald-500 outline-none font-mono"
                      />
                      <button 
                        onClick={() => handleExternalImport('gsheet', gsheetUrl)}
                        disabled={isImporting || !gsheetUrl}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-white text-xs font-mono rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isImporting ? 'Syncing…' : 'Sync & Ingest'}
                      </button>
                    </div>
                  </motion.div>

                </div>
                </div>

                {/* Right Column: Prompt Suggestions */}
                <div className="w-full xl:w-[420px] flex-shrink-0">
                  <div className="bg-[#090D14]/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 flex items-center gap-2">
                        💡 Analyst Inspiration
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">Click to populate</span>
                    </div>
                    <PromptSuggestions
                      dataset={datasetProfile}
                      onSelectPrompt={(prompt) => setInput(prompt)}
                    />
                  </div>
                </div>

              </motion.div>
            ) : (
                          <div className="max-w-4xl mx-auto space-y-8">
<AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
                <motion.div
                key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group w-full mb-6`}
              >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-black font-black text-xs">
                        DG
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 ml-3 mt-1 order-last">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm font-mono text-xs font-bold">
                        YOU
                      </div>
                    </div>
                  )}

                  <motion.div
                    className={`max-w-3xl rounded-2xl px-6 py-4 relative shadow-sm text-sm font-sans leading-relaxed ${
                      message.role === "user"
                        ? "bg-sky-50 dark:bg-[#0B1524] text-slate-900 dark:text-sky-100 rounded-tr-sm border border-sky-200 dark:border-sky-500/40"
                        : "bg-white dark:bg-[#090D14] text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-800"
                    }`}
                  >
                  {message.role === 'assistant' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      onClick={() => copyToClipboard(message.content, index)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      title="Copy message"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </motion.button>
            )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="mb-3 rounded-lg max-w-md"
                    />
            )}
                  
                  {/* Display executed code blocks with enhanced features */}
                  {message.code && message.code.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {message.code.map((codeBlock, idx) => {
                        const messageIndex = index;
                        const key = `${messageIndex}-code-${idx}`;
                        const isExpanded = expandedCodeBlocks[key] ?? false; // Default to collapsed to save space
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070A]/80 max-h-[60vh] flex flex-col mb-2"
                          >
                            <div className="dark:dark:border-b border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                              <motion.button
                                
                                onClick={() => {
                                  setExpandedCodeBlocks(prev => ({
                                    ...prev,
                                    [key]: !prev[key]
                                  }));
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 font-mono text-xs">
                                  <CallChip 
                                    name={codeBlock.tool === 'run_python_code' ? 'python_runtime' : codeBlock.tool}
                                    status="success"
                                    duration="142ms"
                                  />
                                  <span className="text-slate-300 font-semibold">
                                    {codeBlock.tool === 'run_python_code' ? 'Vectorized Python Execution' : codeBlock.tool}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    {codeBlock.code.split("\n").length} lines
                                  </span>
                                </div>
                                <motion.svg
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              </motion.button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="border-t border-gray-200 dark:border-gray-700 overflow-hidden max-h-[50vh] overflow-y-auto"
                                  >
                                    <CodeBlock
                                      code={codeBlock.code}
                                      language="python"
                                      tool={codeBlock.tool}
                                      onRunCode={() => {
                                        // Re-run code functionality can be added here
                                      }}
                                    />
                                  </motion.div>
            )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
            )}
                  
                  {/* Display code outputs in collapsible dropdowns */}
                  {message.outputs && message.outputs.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {message.outputs.map((output, idx) => {
                        const messageIndex = index;
                        const key = `${messageIndex}-output-${idx}`;
                        const isExpanded = expandedOutputs[key] ?? false; // Default to collapsed to save space
                        // Try to parse as table
                        let tableData = null;
                        try {
                          tableData = parseMarkdownTable(output);
                        } catch (e) {
                          console.error('Error parsing table:', e);
                          tableData = null;
                        }
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-xl overflow-hidden border border-slate-800 bg-[#05070A]/80 max-h-[60vh] flex flex-col mb-2"
                          >
                            <div className="dark:dark:border-b border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                              <motion.button
                                
                                onClick={() => {
                                  setExpandedOutputs(prev => ({
                                    ...prev,
                                    [key]: !prev[key]
                                  }));
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    View Execution Results
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                                    {output.split('\n').length} lines
                                  </span>
                                </div>
                                <motion.svg
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              </motion.button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="border-t border-gray-200 dark:border-gray-700 overflow-hidden max-h-[50vh] overflow-y-auto"
                                  >
                                    {tableData && tableData.rows && tableData.rows.length > 0 ? (
                                      <div className="p-4">
                                        <EnhancedTableViewer data={tableData.rows} />
                                      </div>
                                    ) : (
                                      <pre className="bg-gray-900 dark:bg-black text-gray-100 p-4 overflow-x-auto text-xs max-h-[50vh] overflow-y-auto whitespace-pre-wrap font-mono">
                                        {output}
                                      </pre>
            )}
                                  </motion.div>
            )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
            )}
                  
                  {/* Display Plotly visualizations */}
                  {message.plots && message.plots.filter(plot => plot && plot.data && plot.data.length > 0).map((plot, i) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    const textColor = isDark ? '#e5e7eb' : '#374151'; // gray-200 or gray-700
                    const gridColor = isDark ? '#374151' : '#e5e7eb';
                    
                    const themedLayout = {
                      ...plot.layout,
                      autosize: true,
                      paper_bgcolor: 'transparent', 
                      plot_bgcolor: 'transparent',
                      font: { ...plot.layout?.font, color: textColor },
                      xaxis: { ...plot.layout?.xaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor }, titlefont: { color: textColor } },
                      yaxis: { ...plot.layout?.yaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor }, titlefont: { color: textColor } },
                      legend: { ...plot.layout?.legend, font: { color: textColor } },
                      title: { ...plot.layout?.title, font: { color: textColor } }
                    };

                    return (
                      <div key={i} className="my-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full relative group z-0">
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async () => {
                              try {
                                await dashboardApi.saveChart(plot.layout?.title?.text || plot.layout?.title || "DataGem Chart", JSON.stringify(plot));
                                alert("Chart saved to Dashboard!");
                              } catch(e) {
                                alert("Failed to save chart");
                              }
                            }}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center gap-2 text-sm font-medium transition-colors"
                            title="Save to Dashboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            Save to Dashboard
                          </button>
                        </div>
                        <Plot
                          data={plot.data}
                          layout={themedLayout}
                          useResizeHandler={true}
                          style={{width: '100%', minHeight: '450px'}}
                          config={{responsive: true, displayModeBar: true, displaylogo: false}}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Display text summary - Enhanced UI */}
                  {(message.content || (message.code && message.code.length > 0) || (message.outputs && message.outputs.length > 0) || (message.plots && message.plots.length > 0)) && (
                  <div className={`prose prose-sm leading-relaxed max-w-none ${message.role === 'user' ? 'prose-invert' : 'dark:prose-invert'} ${message.role === 'assistant' ? 'response-enhanced' : ''}`}>
{message.content && message.content.trim() ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="my-4">
                              <CodeBlock
                                code={String(children).replace(/\n$/, '')}
                                language={match[1]}
                              />
                            </div>
                          ) : (
                            <code className={`px-2 py-1 rounded-md text-sm font-mono ${
                              message.role === 'user' 
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                                : 'bg-accent-50 dark:bg-gray-800 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-gray-700'
                            }`} {...props}>
                              {children}
                            </code>
                          )
                        },
                        ul: ({ children }) => <ul className="list-disc list-outside mb-4 ml-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-outside mb-4 ml-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
                        li: ({ children }) => <li className="pl-2">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="w-1 h-6 bg-gray-200 dark:bg-gray-800 rounded-full"></span>
                          {children}
                        </h2>,
                        h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-gray-800 dark:text-gray-200">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 dark:border-gray-700 pl-4 py-2 my-3 bg-gray-200 dark:bg-gray-700 rounded-r-lg italic text-gray-700 dark:text-gray-300">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-800">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-slate-50 dark:bg-slate-800/80">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800/60">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-sky-600 dark:text-sky-400">
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="my-3 border-slate-200 dark:border-slate-800" />,
                      }}
                    >
                      {message.content.replace(/^DataGem:\s*/i, '').replace(/^\*\*Executing:\*\* `run_python_code`[\s\S]*?(?=\n\n|$)/i, '')}
                    </ReactMarkdown>
                      ) : (
                        // If we have code/output/images but no text content, show a minimal completion message
                        (message.code && message.code.length > 0) || (message.outputs && message.outputs.length > 0) || (message.images && message.images.length > 0) ? (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                            <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Analysis completed</span>
                          </div>
                        ) : null
            )}

            {/* In-Message Executive Briefing Card */}
            {message.briefing && (
              <div className="mt-4">
                <ExecutiveBriefingCard 
                  briefing={message.briefing} 
                  onSelectPrompt={(promptText) => {
                    setInput(promptText);
                    const userMessage = { role: 'user', content: promptText };
                    setMessages((prev) => [...prev, userMessage]);
                    setLoading(true);
                    setCurrentResponse('');
                    setExecutionStep(1);

                    const streamDataset = dataset;
                    const activeSession = sessions.find(s => s.id === currentSessionId);
      const streamDatasetPath = activeSession ? activeSession.datasetPath : null;

                    chatAPI.streamChat(promptText, null, streamDataset, streamDatasetPath, isConnected ? connectionString : null, currentSessionId || "default")
                      .then(async (reader) => {
                        if (!reader) throw new Error('Failed to get response stream');
                        const decoder = new TextDecoder();
                        const streamReader = typeof reader.getReader === 'function' ? reader.getReader() : reader;
                        let accumulated = '';
                        while (true) {
                          const { done, value } = await streamReader.read();
                          if (done) break;
                          const chunk = decoder.decode(value, { stream: true });
                          accumulated += chunk;
                          setCurrentResponse(accumulated);
                        }
                        setMessages((prev) => [...prev, { role: 'assistant', content: accumulated }]);
                        setCurrentResponse('');
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error('Chat error:', err);
                        setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Error executing query: ${err.message || 'Stream timeout'}` }]);
                        setLoading(false);
                      });
                  }}
                />
              </div>
            )}
                </div>
            )}
                </motion.div>
              </motion.div>
            ))}
            </AnimatePresence>

            {loading && currentResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="max-w-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100  border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4"
                >
                  {/* Show images in streaming response */}
                  {(() => {
                    const imageRegex = /PLOT_IMG_BASE64:([A-Za-z0-9+/=]+)/g;
                    const images = [];
                    let match;
                    const responseCopy = currentResponse;
                    while ((match = imageRegex.exec(responseCopy)) !== null) {
                      images.push(`data:image/png;base64,${match[1]}`);
                    }
                    return images.length > 0 ? (
                      <div className="mb-4 space-y-3">
                        {images.map((imgSrc, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={imgSrc}
                              alt={`Visualization ${idx + 1}`}
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  
                  <div className="prose prose-sm leading-relaxed dark:prose-invert max-w-none response-enhanced">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                        code: ({ inline, children }) => 
                          inline ? (
                            <code className="bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-md text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block text-sm font-mono overflow-x-auto text-gray-800 dark:text-gray-200">
                              {children}
                            </code>
                          ),
                        pre: ({ children }) => (
                          <pre className="p-4 rounded-xl overflow-x-auto my-4  border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => <ul className="list-disc list-outside mb-4 ml-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-outside mb-4 ml-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
                        li: ({ children }) => <li className="pl-2">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="w-1 h-6 bg-gray-200 dark:bg-gray-800 rounded-full"></span>
                          {children}
                        </h2>,
                        h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-gray-800 dark:text-gray-200">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 dark:border-gray-700 pl-4 py-2 my-3 bg-gray-200 dark:bg-gray-700 rounded-r-lg italic text-gray-700 dark:text-gray-300">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-800">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-xs">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-slate-50 dark:bg-slate-800/80">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800/60">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-sky-600 dark:text-sky-400">
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="my-3 border-slate-200 dark:border-slate-800" />,
                      }}
                    >
                      {currentResponse
                        .replace(/^DataGem:\s*/i, '')
                        .replace(/^\*\*Executing:\*\* `run_python_code`[\s\S]*?(?=\n\n|$)/i, '')
                        .replace(/```(?:python)?\n?[\s\S]*?(```|$)/gi, '')
                        .replace(/<<<PLOTLY_JSON_START>>>[\s\S]*?(<<<PLOTLY_JSON_END>>>|$)/g, '')
                        .replace(/PLOTLY_JSON:\{[\s\S]*?(?=\n|$)/g, '')
                        .trim()
                      }
                    </ReactMarkdown>
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-2.5 h-5 bg-accent-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] ml-1"
                  />
                </motion.div>
              </motion.div>
            )}

            {loading && !currentResponse && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start my-4"
              >
                <div className="max-w-2xl bg-white dark:bg-[#090D14]/95 border border-slate-200 dark:border-sky-500/40 rounded-2xl p-5 shadow-sm dark:shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">DataGem Execution Engine</span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full ml-auto">
                      DuckDB Out-of-Core
                    </span>
                  </div>

                  <div className="my-2">
                    <ThoughtLine
                      working={loading}
                      steps={[
                        'Ingesting tabular schema & column statistics',
                        'Optimizing DuckDB vectorized query plan',
                        'Filtering anomalies and calculating aggregations',
                        'Generating visual charts & markdown response'
                      ]}
                      label="Compiling & running analysis…"
                      doneLabel="Reasoned in"
                      glyph="sparkle"
                      glyphColor="#10b981"
                      color={theme === 'dark' ? '#e2e8f0' : '#1e293b'}
                      fontSize={14}
                      breathPeriod={1.5}
                      collapsible
                      collapseOnSettle
                      showTimer
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                    <CallChip
                      icon="terminal"
                      name="DuckDB Engine"
                      argument={dataset ? `${dataset.length || 'active'} rows in memory` : "Streaming sandbox"}
                      status="running"
                      expectedMs={2200}
                      size={30}
                      radius={8}
                      color="#38bdf8"
                      surfaceColor={theme === 'dark' ? '#0f172a' : '#f1f5f9'}
                      progressColor="#0284c7"
                      doneColor="#10b981"
                      showTimer
                    />
                  </div>
                </div>
              </motion.div>
            )}

              </div>
            )}
            
            {/* Show Prompts in the scrollable area if dataset is loaded but no messages yet */}
            {(dataset || isConnected) && !loading && (!messages || messages.length <= 1) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto mt-8 bg-white/20 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Suggested Analysis</h3>
                <PromptSuggestions
                  dataset={datasetProfile}
                  onSelectPrompt={(prompt) => setInput(prompt)}
                />
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* Input Area - Fixed at Bottom */}
        {workspaceViewMode === 'chat' && (
        <div className="flex-shrink-0 bg-transparent py-4 px-6 z-30 relative">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <PromptBar
              value={input}
              onChange={setInput}
              placeholder="Ask anything about this dataset (e.g. 'calculate blended ROAS', 'top churned customers')..."
              width={760}
              sources={[
                { key: 'dataset', name: dataset ? 'Active Dataset' : 'No Data Ingested', description: dataset ? `${dataset.length || 'Ready'} rows` : 'Upload CSV/Parquet', icon: Attachment01Icon, attach: true },
                { key: 'web', name: 'Web Benchmarks', description: 'Real-time CAC & CPM comparison', icon: Globe02Icon }
              ]}
              commands={[
                { key: 'summarize', name: '/summarize', description: 'Digest data into Monday executive briefing' },
                { key: 'roas', name: '/roas', description: 'Calculate blended ROAS across marketing channels' },
                { key: 'anomalies', name: '/anomalies', description: 'Scan for return rate or price outliers' },
                { key: 'clean', name: '/clean', description: 'Impute missing values and detect column formats' }
              ]}
              models={[]}
              efforts={[]}
              busy={loading}
              onSend={(text) => {
                if (!text || !text.trim()) return;
                setInput(text);
                // Trigger submit directly with the entered text
                const userMessage = { role: 'user', content: text };
                setMessages((prev) => [...prev, userMessage]);
                setLoading(true);
                setCurrentResponse('');
                setExecutionStep(1);

                const streamDataset = dataset;
                const activeSession = sessions.find(s => s.id === currentSessionId);
      const streamDatasetPath = activeSession ? activeSession.datasetPath : null;

                chatAPI.streamChat(text, null, streamDataset, streamDatasetPath, isConnected ? connectionString : null, currentSessionId || "default")
                  .then(async (reader) => {
                    if (!reader) throw new Error('Failed to get response stream');
                    const decoder = new TextDecoder();
                    const streamReader = typeof reader.getReader === 'function' ? reader.getReader() : reader;
                    let accumulated = '';
                    while (true) {
                      const { done, value } = await streamReader.read();
                      if (done) break;
                      const chunk = decoder.decode(value, { stream: true });
                      accumulated += chunk;
                      setCurrentResponse(accumulated);
                    }
                    const parsed = parseResponse(accumulated);
                    setMessages((prev) => [...prev, { 
                      role: 'assistant', 
                      content: parsed.text,
                      plots: parsed.plots,
                      code: parsed.code,
                      outputs: parsed.outputs
                    }]);
                    setCurrentResponse('');
                    setLoading(false);
                  })
                  .catch((err) => {
                    console.error('Chat error:', err);
                    setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Error executing query: ${err.message || 'Stream timeout'}` }]);
                    setLoading(false);
                  });
              }}
              onStop={handleStop}
              onAttach={() => {
                const fileInput = document.getElementById('file-upload-input');
                if (fileInput) fileInput.click();
              }}
              onDictate={toggleListening}
              sparkColor="#0284c7"
              sparkBoost={1.2}
              radius={20}
            />

            {/* Hidden Voice Input Indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Listening to voice input... speak clearly
              </motion.div>
            )}
          </div>
        </div>
        )}
      </div>

    </div>
          <WatchdogModal
        isOpen={isWatchdogModalOpen}
        onClose={() => setIsWatchdogModalOpen(false)}
      />
      <MarketplaceConnectorsModal
        isOpen={isConnectorsModalOpen}
        onClose={() => setIsConnectorsModalOpen(false)}
        onSyncComplete={(syncData) => {
          setDataset([
            { order_id: "SYNC-AMZ-01", sku: "TOP-TIER-EARBUD", revenue: syncData.gross_gmv, fee: syncData.fee_leakage, status: "Delivered" }
          ]);
          setIsConnectorsModalOpen(false);
        }}
      />
      <ExecutiveDeckModal 
        isOpen={isDeckModalOpen} 
        onClose={() => setIsDeckModalOpen(false)} 
        dataset={dataset} 
        datasetProfile={datasetProfile} 
      />
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onStepChange={(stepNumber) => setActiveTourStep(stepNumber)}
      />
      <DisputeTicketModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        disputeData={disputeModalData}
      />
    </>
  );
}