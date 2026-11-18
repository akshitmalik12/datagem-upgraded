/**
 * Chat & Project History Management Utility
 * Manages projects and their nested chat threads
 */

const STORAGE_KEY_SESSIONS = 'datagem_chat_sessions';
const STORAGE_KEY_PROJECTS = 'datagem_projects';
const STORAGE_KEY_ACTIVE_PROJECT = 'datagem_current_project_id';
const STORAGE_KEY_ACTIVE_DATASET = 'datagem_current_dataset_id';

// Default initial clean projects without dead mock chats
const DEFAULT_PROJECTS = [
  {
    id: 'proj_forensic',
    name: 'Executive Audits',
    description: 'Marketplace fee reconciliation, clawback tickets, and dispute dockets',
    createdAt: Date.now(),
    chats: []
  },
  {
    id: 'proj_modeling',
    name: 'Profit Modeling',
    description: 'Price elasticity simulations, Buy Box defense, and margin sensitivity',
    createdAt: Date.now(),
    chats: []
  }
];

export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    // Auto-clean legacy dead mock chats (chat_roas, chat_cohorts, chat_runway)
    const hasLegacyMock = parsed.some(p => p.chats && p.chats.some(c => c.id === 'chat_roas' || c.id === 'chat_runway'));
    if (hasLegacyMock) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return parsed;
  } catch (e) {
    console.error('Error reading projects:', e);
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects:', e);
  }
}

export function createProject(name, description = '') {
  const projects = getProjects();
  const newProj = {
    id: `proj_${Date.now()}`,
    name: name.trim() || 'Untitled Project',
    description: description.trim(),
    createdAt: Date.now(),
    chats: [
      {
        id: `chat_${Date.now()}`,
        title: 'Initial Metric Briefing',
        lastUpdated: Date.now(),
        queryCount: 0
      }
    ]
  };
  projects.unshift(newProj);
  saveProjects(projects);
  return newProj;
}

export function addChatToProject(projectId, chatTitle) {
  const projects = getProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return null;
  const newChat = {
    id: `chat_${Date.now()}`,
    title: chatTitle.trim() || 'New Chat Thread',
    lastUpdated: Date.now(),
    queryCount: 0
  };
  proj.chats.unshift(newChat);
  saveProjects(projects);
  return newChat;
}

export function deleteChatFromProject(projectId, chatId) {
  const projects = getProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return false;
  proj.chats = proj.chats.filter(c => c.id !== chatId);
  saveProjects(projects);
  return true;
}

export function deleteProject(projectId) {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== projectId);
  saveProjects(projects);
  return true;
}

export function getCurrentProjectId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT) || 'proj_ecommerce';
}

export function setCurrentProjectId(projectId) {
  if (projectId) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, projectId);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_PROJECT);
  }
}

// Generate a unique ID for a dataset based on its content and metadata
export function generateDatasetId(dataset, filename = null) {
  const datasetInfo = {
    shape: dataset.length,
    columns: Object.keys(dataset[0] || {}),
    sample: dataset.slice(0, 3).map(row => Object.values(row).slice(0, 3)),
    filename: filename || 'unknown',
  };
  
  const str = JSON.stringify(datasetInfo);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `dataset_${Math.abs(hash)}_${datasetInfo.filename}`;
}

// Get all chat sessions
export function getAllChatSessions() {
  try {
    const sessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    return sessions ? JSON.parse(sessions) : {};
  } catch (error) {
    console.error('Error loading chat sessions:', error);
    return {};
  }
}

// Get chat session for a specific dataset
export function getChatSession(datasetId) {
  const sessions = getAllChatSessions();
  return sessions[datasetId] || null;
}

// Save chat session
export function saveChatSession(datasetId, sessionData) {
  try {
    const sessions = getAllChatSessions();
    sessions[datasetId] = {
      ...sessionData,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('Error saving chat session:', error);
    return false;
  }
}

// Delete a chat session
export function deleteChatSession(datasetId) {
  try {
    const sessions = getAllChatSessions();
    delete sessions[datasetId];
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
}

// Get all chat sessions sorted by last updated
export function getChatSessionsList() {
  const sessions = getAllChatSessions();
  return Object.entries(sessions)
    .map(([id, data]) => ({
      id,
      ...data,
    }))
    .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
}

// Clear all chat sessions
export function clearAllChatSessions() {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    return true;
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    return false;
  }
}

// Get current active dataset ID
export function getCurrentDatasetId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_DATASET);
}

// Set current active dataset ID
export function setCurrentDatasetId(datasetId) {
  if (datasetId) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_DATASET, datasetId);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_DATASET);
  }
}
