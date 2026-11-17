import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Clock, 
  Layers, 
  Database,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  Message01Icon, 
  Folder01Icon, 
  SparklesIcon, 
  Analytics01Icon
} from '@hugeicons/core-free-icons';
import BranchedMenu from './BranchedMenu';
import { 
  getProjects, 
  createProject, 
  addChatToProject, 
  deleteChatFromProject, 
  deleteProject,
  getCurrentProjectId,
  setCurrentProjectId
} from '../utils/chatHistory';

export default function ChatHistory({
  isOpen, 
  onClose, 
  onSelectChat,
  currentChatId
}) {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(currentChatId || 'chat_roas');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [activeTargetProject, setActiveTargetProject] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const list = getProjects();
    setProjects(list);
  };

  const handleSelect = (value, item) => {
    setActiveChat(value);
    if (onSelectChat) {
      onSelectChat(value, item);
    }
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const created = createProject(newProjectName);
    setNewProjectName('');
    setShowNewProjectInput(false);
    loadData();
    if (created.chats[0]) {
      handleSelect(created.chats[0].id, created.chats[0]);
    }
  };

  const handleAddChat = (e, projectId) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    const added = addChatToProject(projectId, newChatTitle);
    setNewChatTitle('');
    setActiveTargetProject(null);
    loadData();
    if (added) {
      handleSelect(added.id, added);
    }
  };

  const handleDeleteChat = (e, projectId, chatId) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat thread?')) {
      deleteChatFromProject(projectId, chatId);
      loadData();
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Delete this entire project and its chats?')) {
      deleteProject(projectId);
      loadData();
    }
  };

  // Convert projects to BranchedMenu structure
  const branchedMenuItems = projects
    .filter(proj => {
      if (!searchQuery) return true;
      const matchProj = proj.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChat = proj.chats.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProj || matchChat;
    })
    .map(proj => ({
      label: proj.name,
      value: proj.id,
      children: proj.chats
        .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(c => ({
          value: c.id,
          label: c.title,
          icon: Message01Icon,
          raw: c,
          projectId: proj.id
        }))
    }));

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Sidebar drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 h-full w-[420px] max-w-[95vw] bg-[#070A0F] border-l border-slate-800/90 shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Projects & Chat Trees
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-header & Action Bar */}
            <div className="p-4 border-b border-slate-900 bg-[#090E17]/60 flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter projects & threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05070B] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>

              {/* New Project Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Workspaces ({projects.length})
                </span>
                <button
                  onClick={() => setShowNewProjectInput(prev => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900 text-xs font-mono transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              {/* Inline Project Creator */}
              {showNewProjectInput && (
                <form onSubmit={handleCreateProject} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Project name (e.g. Q4 Margins)"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    className="flex-1 bg-[#05070B] border border-cyan-500/50 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Tree View using React Bits BranchedMenu */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {branchedMenuItems.length > 0 ? (
                <div className="mb-6">
                  <BranchedMenu
                    items={branchedMenuItems}
                    defaultOpen={[0, 1]}
                    defaultActive={activeChat}
                    onSelect={handleSelect}
                    color="#94a3b8"
                    accentColor="#22d3ee"
                    lineColor="#1e293b"
                    width={360}
                    rowHeight={34}
                    indent={38}
                    trunk={14}
                    radius={10}
                    lineWidth={1.5}
                    fontSize={13}
                    drawDuration={350}
                    foldDuration={250}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No matching projects or chat threads found.
                </div>
              )}

              {/* Project Quick Actions / Quick Chat Adders */}
              <div className="mt-8 border-t border-slate-900 pt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-3">
                  Project Management
                </span>
                <div className="space-y-2">
                  {projects.map(proj => (
                    <div 
                      key={proj.id}
                      className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-200 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          {proj.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveTargetProject(activeTargetProject === proj.id ? null : proj.id)}
                            title="New Thread"
                            className="p-1 rounded text-cyan-400 hover:bg-cyan-950/60 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(e, proj.id)}
                            title="Delete Project"
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {activeTargetProject === proj.id && (
                        <form onSubmit={(e) => handleAddChat(e, proj.id)} className="flex gap-2 mt-2 pt-2 border-t border-slate-800/80">
                          <input
                            type="text"
                            placeholder="Chat title (e.g. Return Rate Spike)"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            autoFocus
                            className="flex-1 bg-[#05070B] border border-cyan-500/50 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold text-[11px] font-mono"
                          >
                            Create
                          </button>
                        </form>
                      )}

                      <div className="text-[10px] font-mono text-slate-500 flex items-center gap-3 mt-1">
                        <span>{proj.chats.length} threads</span>
                        <span>•</span>
                        <span>Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">Active Thread:</span>
                <span className="text-slate-200 truncate max-w-[180px]">{activeChat}</span>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
