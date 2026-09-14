/**
 * Chat History Management Utility
 * Manages chat sessions per dataset
 */

// Generate a unique ID for a dataset based on its content and metadata
export function generateDatasetId(dataset, filename = null) {
  // Create a hash from dataset shape, columns, and first few rows
  const datasetInfo = {
    shape: dataset.length,
    columns: Object.keys(dataset[0] || {}),
    sample: dataset.slice(0, 3).map(row => Object.values(row).slice(0, 3)),
    filename: filename || 'unknown',
  };
  
  // Simple hash function
  const str = JSON.stringify(datasetInfo);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add timestamp for uniqueness
  return `dataset_${Math.abs(hash)}_${datasetInfo.filename}`;
}

// Get all chat sessions
export function getAllChatSessions() {
  try {
    const sessions = localStorage.getItem('datagem_chat_sessions');
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
    localStorage.setItem('datagem_chat_sessions', JSON.stringify(sessions));
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
    localStorage.setItem('datagem_chat_sessions', JSON.stringify(sessions));
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
    localStorage.removeItem('datagem_chat_sessions');
    return true;
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    return false;
  }
}

// Get current active dataset ID
export function getCurrentDatasetId() {
  return localStorage.getItem('datagem_current_dataset_id');
}

// Set current active dataset ID
export function setCurrentDatasetId(datasetId) {
  if (datasetId) {
    localStorage.setItem('datagem_current_dataset_id', datasetId);
  } else {
    localStorage.removeItem('datagem_current_dataset_id');
  }
}

