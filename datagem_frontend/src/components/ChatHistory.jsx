import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getChatSessionsList, 
  deleteChatSession, 
  getCurrentDatasetId,
  setCurrentDatasetId 
} from '../utils/chatHistory';

export default function ChatHistory({ 
  isOpen, 
  onClose, 
  onSelectChat,
  currentDatasetId,
  currentDatasetName 
}) {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = () => {
    const chatSessions = getChatSessionsList();
    setSessions(chatSessions);
  };

  const handleSelectChat = (sessionId) => {
    setCurrentDatasetId(sessionId);
    onSelectChat(sessionId);
    onClose();
  };

  const handleDeleteChat = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      deleteChatSession(sessionId);
      loadSessions();
      if (sessionId === currentDatasetId) {
        setCurrentDatasetId(null);
        onSelectChat(null);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredSessions = sessions.filter(session => {
    const name = session.name || session.filename || 'Untitled Dataset';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Chat History
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Current Chat Indicator */}
            {currentDatasetId && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800">
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                  Current Chat
                </p>
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {currentDatasetName || 'Current Dataset'}
                </p>
              </div>
            )}

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {searchQuery ? 'No chats found' : 'No chat history yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Upload a dataset to start a new chat
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSessions.map((session) => {
                    const isActive = session.id === currentDatasetId;
                    const sessionName = session.title || session.name || session.filename || 'Untitled Chat';
                    const messageCount = session.messages?.length || 0;

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelectChat(session.id)}
                        className={`group relative p-4 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500 dark:border-indigo-400'
                            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium truncate ${
                              isActive
                                ? 'text-indigo-900 dark:text-indigo-100'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {sessionName}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs ${
                                isActive
                                  ? 'text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                              </span>
                              <span className={`text-xs ${
                                isActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {formatDate(session.lastUpdated)}
                              </span>
                            </div>
                            {session.shape && (
                              <p className={`text-xs mt-1 ${
                                isActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}>
                                {session.shape.rows} rows × {session.shape.cols} columns
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleDeleteChat(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                            title="Delete chat"
                          >
                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {sessions.length} {sessions.length === 1 ? 'chat session' : 'chat sessions'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

