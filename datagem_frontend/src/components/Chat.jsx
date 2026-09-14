import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InteractiveChart from './InteractiveChart';
import CodeBlock from './CodeBlock';
import CommandPalette from './CommandPalette';
import PromptSuggestions from './PromptSuggestions';
import { MessageSkeleton, CodeBlockSkeleton, ProgressIndicator } from './LoadingSkeleton';
import EnhancedTableViewer from './EnhancedTableViewer';
import ChatHistory from './ChatHistory';
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


// Global memory cache to persist chat state across page navigations
let chatMemoryCache = null;

export default function Chat() {

  const { user, logout } = useAuth(); 
  const [messages, setMessages] = useState(chatMemoryCache?.messages || []);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [dataset, setDataset] = useState(chatMemoryCache?.dataset || null);
  const [datasetProfile, setDatasetProfile] = useState(chatMemoryCache?.datasetProfile || null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");

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
    const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('datagem_sessions')) || []);
  const [currentSessionId, setCurrentSessionId] = useState(chatMemoryCache?.currentSessionId || null);
  const fileInputRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem('datagem_sessions', JSON.stringify(sessions));
  }, [sessions]);

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

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(prev => prev + ' ' + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
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
        
        const initMessages = [{
          role: 'assistant',
          content: `Dataset "${file.name}" loaded successfully!\n\nShape: ${shape.rows} rows × ${shape.cols} columns\nColumns: ${columns.join(', ')}\n\nYou can now ask me questions about your dataset!`,
        }];
        setMessages(initMessages);

        setSessions(prev => [{
            id: datasetId,
            title: 'New Chat',
            dataset: df,
            profile: profile,
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
      const endpoint = type === 'url' ? 'http://127.0.0.1:8000/import/url' : 'http://127.0.0.1:8000/import/gsheet';
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

      const profile = { shape, columns, numericColumns, stats, head: df.slice(0, 5), sample: df.slice(0, 10) };
      
      const datasetId = 'sess_' + Date.now();
      setCurrentSessionId(datasetId);
      
      const filename = result.filename || (type === 'url' ? 'Web Import' : 'Sheet Import');
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
        title: 'New Chat',
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
      title: 'New Chat',
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
    
    // Generate AI Title if the chat is still named "New Chat"
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession && currentSession.title === 'New Chat') {
      chatAPI.generateTitle(input, datasetFilename, datasetProfile?.columns).then(newTitle => {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: newTitle } : s));
        setDatasetFilename(newTitle); // Update the active UI title as well
      }).catch(console.error);
    }
    
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
      const streamDatasetPath = currentSession ? currentSession.datasetPath : null;
      
      const reader = await chatAPI.streamChat(input, null, streamDataset, streamDatasetPath, isConnected ? connectionString : null, currentSessionId || "default");
      if (!reader) {
        throw new Error('Failed to get response stream');
      }
      
      const decoder = new TextDecoder();
      const streamReader = reader.getReader();
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

  return (
    <>
    <AnimatePresence>
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onAction={handlePaletteAction} 
      />
    </AnimatePresence>
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0F19] transition-colors relative overflow-hidden z-0">
      
      {/* Universal Floating Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] -right-[10%] w-[70vw] h-[70vw] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[150px]" 
        />
      </div>
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
      {showSidebar && (
          <motion.div
            initial={{ marginLeft: -320, opacity: 0 }}
            animate={{ marginLeft: 0, opacity: 1 }}
            exit={{ marginLeft: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 flex-shrink-0 backdrop-blur-xl bg-white/70 dark:bg-gray-900/80 border-r border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-colors flex flex-col z-20"
          >
            <div className="w-80 h-full overflow-y-auto overflow-x-hidden">
                    <div className="p-4 flex flex-col h-full">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-gray-100 border border-gray-300 dark:border-gray-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition mb-6 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              New Chat
            </button>
            
            {datasetProfile && (
              <div className="mb-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Dataset Profile
                </h2>
                
                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Filename</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold truncate max-w-[120px]" title={datasetFilename}>{datasetFilename}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Rows</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{datasetProfile.rows?.toLocaleString() || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Duplicates</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{datasetProfile.duplicates !== undefined ? datasetProfile.duplicates.toLocaleString() : "..."}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Columns</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{datasetProfile.columns?.length || 0}</span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Column Schema</label>
                    <select className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-accent-500">
                      <option disabled selected>View all columns...</option>
                      {datasetProfile.columns?.map((col, idx) => (
                        <option key={idx} disabled>{col.name} ({col.type})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex-shrink-0">Chat History</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => restoreSession(s)}
                  className={`w-full group cursor-pointer flex flex-col px-4 py-3 rounded-lg text-sm transition-colors ${currentSessionId === s.id ? 'bg-gray-900 text-white dark:bg-gray-700 border border-gray-300 dark:border-gray-700' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                  {editingSessionId === s.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editSessionTitle} 
                        onChange={(e) => setEditSessionTitle(e.target.value)} 
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === 'Enter' && saveRenaming(e, s.id)}
                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-600 text-black dark:text-white rounded border-none outline-none focus:ring-2 focus:ring-accent-500" 
                        autoFocus 
                      />
                      <button onClick={(e) => saveRenaming(e, s.id)} className="text-green-500 hover:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="font-medium truncate flex-1">{s.title || 'Untitled Session'}</div>
                      <div className="hidden group-hover:flex items-center gap-1 ml-2">
                        <button onClick={(e) => startRenaming(e, s)} className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors" title="Rename">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={(e) => exportSingleSession(e, s)} className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors" title="Export">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </button>
                        <button onClick={(e) => deleteSession(e, s.id)} className="p-1 hover:bg-red-500 dark:hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {s.messages?.length || 0} messages
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No recent chats</p>
                            )}
            </div>
          </div>
            </div>
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
          className="flex-shrink-0 backdrop-blur-xl bg-white/70 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 transition-colors z-20 relative flex flex-col"
        >
          {/* Top Row: Brand & Theme Toggle */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  D
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">DataGem</h1>
                    {user?.tier && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                        {user.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">AI Analyst Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>

          {/* Sub Row: Tools & Navigation */}
          <div className="px-6 py-2.5 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between overflow-x-auto gap-4 custom-scrollbar">
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800/30 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                My Dashboard
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                About
              </Link>
              
              {(user?.tier?.toLowerCase() === 'enterprise' || user?.email === 'aakshitmalik@gmail.com') && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/30 whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Admin Portal
                </Link>
              )}
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Upgrade Plan
              </Link>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent whitespace-nowrap"
                    title="Export chat history"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Chat
                  </button>
                  <button
                    onClick={clearChat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800/30 whitespace-nowrap"
                    title="Clear chat history"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Clear Chat
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Messages Area - Scrollable */}
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
                className="relative py-12 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-12 min-h-full w-full max-w-7xl mx-auto px-4"
              >
                {/* Left Column: Welcome & Upload Options */}
                <div className="flex-1 flex flex-col items-center text-center w-full">


                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4 tracking-tight">
                    Welcome to your workspace.
                  </h2>
                  <p className="text-lg text-gray-500 dark:text-gray-400 mb-16 font-medium">Connect a data source below to begin generating insights.</p>
                </motion.div>
                
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleDatasetUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4 z-10">
                  
                  {/* CSV Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all cursor-pointer flex flex-col items-center text-center h-[240px] justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="absolute inset-0 to-transparent dark:opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-10">Upload CSV</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 z-10">Analyze local spreadsheet data</p>
                  </motion.div>

                  {/* Web Import Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all flex flex-col items-center text-center h-[240px] justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center mb-4 z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-10 mb-3">Import from Web</h3>
                    <div className="flex flex-col gap-2 w-full z-10">
                      <input 
                        type="url" 
                        placeholder="Paste URL..." 
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                      />
                      <button 
                        onClick={() => handleExternalImport('url', importUrl)}
                        disabled={isImporting || !importUrl}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                      >
                        Fetch
                      </button>
                    </div>
                  </motion.div>

                  {/* Google Sheets Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-green-500/50 dark:hover:border-green-400/50 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20 transition-all flex flex-col items-center text-center h-[240px] justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-14 h-14 bg-green-600 dark:bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center mb-4 z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-10 mb-3">Google Sheets</h3>
                    <div className="flex flex-col gap-2 w-full z-10">
                      <input 
                        type="url" 
                        placeholder="Public Sheet URL..." 
                        value={gsheetUrl}
                        onChange={(e) => setGsheetUrl(e.target.value)}
                        className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                      />
                      <button 
                        onClick={() => handleExternalImport('gsheet', gsheetUrl)}
                        disabled={isImporting || !gsheetUrl}
                        className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl shadow-md hover:bg-green-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                      >
                        Sync
                      </button>
                    </div>
                  </motion.div>

                  {/* Database Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-500/50 dark:hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20 transition-all flex flex-col items-center text-center h-[240px] justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-lg flex items-center justify-center mb-4 z-10">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white z-10 mb-3">Connect Database</h3>
                    <div className="flex flex-col gap-2 w-full z-10">
                      <input 
                        type="password" 
                        placeholder="postgresql://..." 
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                      />
                      <button 
                        onClick={() => handleConnectDb(connectionString)}
                        disabled={!connectionString}
                        className="w-full px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                      >
                        Connect
                      </button>
                    </div>
                  </motion.div>
                </div>
                </div>

                {/* Right Column: Prompt Suggestions */}
                <div className="w-full xl:w-[450px] flex-shrink-0">
                  <div className="bg-white/20 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Inspiration</h3>
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
                    <div className="flex-shrink-0 mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 ml-4 mt-1 order-last">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <motion.div
                    className={`max-w-3xl rounded-2xl px-6 py-4 relative shadow-sm ${
                      message.role === 'user'
                        ? 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-tr-sm border border-gray-200/50 dark:border-gray-700/50'
                        : 'bg-white/70 dark:bg-[#1E1E1E]/70 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                  {message.role === 'assistant' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      
                      
                      onClick={() => copyToClipboard(message.content, index)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700  border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                      title="Copy message"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 max-h-[60vh] flex flex-col mb-2"
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
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-accent-500 "></div>
                                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {codeBlock.tool === 'run_python_code' ? 'View Python Analysis' : `View ${codeBlock.tool}`}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                                    {codeBlock.code.split('\n').length} lines
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
                            className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 max-h-[60vh] flex flex-col mb-2"
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
                          <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700 ">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="dark:dark:to-purple-900/30">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className={`hover:underline font-medium ${
                            message.role === 'user' 
                              ? 'text-gray-900 dark:text-gray-100' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
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
                          <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700 ">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="dark:dark:to-purple-900/30">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {children}
                          </td>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-gray-100 hover:underline font-medium">
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
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
                  {executionStep !== null && (
                    <div className="mb-4">
                      <ProgressIndicator
                        steps={['Analyzing', 'Executing', 'Summarizing']}
                        currentStep={executionStep}
                      />
                    </div>
            )}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className=" absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-500"></span>
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ">
                        DataGem is analyzing...
                      </span>
                    </div>
                    <div className="space-y-3 opacity-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 " />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded " />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded  w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded  w-5/6" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded  w-4/6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
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

        {/* Input Area - Fixed at Bottom */}
        <div className="flex-shrink-0 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-6 py-4 transition-colors"
          >
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <AnimatePresence>
            </AnimatePresence>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or describe what you'd like to analyze..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={loading}
                />
                
              </div>
              <motion.button
                type="button"
                onClick={toggleListening}
                
                
                className={`px-4 py-3 rounded-xl transition-all  flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white  hover:bg-red-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Voice Input"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || (!input.trim())}
                className="px-6 py-3 bg-gray-900 text-white dark:bg-gray-700 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Send'
            )}
              </motion.button>
            </div>
          </form>
          

          </motion.div>
        </div>
      </div>

    </div>
    </>
  );
}