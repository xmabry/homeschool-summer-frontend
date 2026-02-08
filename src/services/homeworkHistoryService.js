// Homework History Service
// Handles fetching and processing homework history data

import cognitoService from './cognitoService';

/**
 * Fetches homework history for the current user
 * @param {Object} filters - Optional filters for the history query
 * @returns {Promise<Array>} Array of homework history items
 * @throws {Error} If the fetch operation fails
 */
export const fetchHomeworkHistory = async (filters = {}) => {
  try {
    // Get current user info from Cognito service
    const userResult = await cognitoService.getCurrentUser();
    if (!userResult.success) {
      throw new Error('User is not authenticated');
    }
    
    const token = cognitoService.getIdToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }
    
    console.log('HomeworkHistory: Fetching history for user:', {
      username: userResult.user.username,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'none'
    });
    
    // Build query parameters using the actual username from login
    const queryParams = new URLSearchParams({
      username: userResult.user.username,
      ...filters
    });
    
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || import.meta.env.REACT_APP_API_ENDPOINT;
    const response = await fetch(`${apiEndpoint}history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure we handle different response formats
    const userHistory = Array.isArray(data.activities) ? data.activities : 
                       Array.isArray(data) ? data : [];
    
    return userHistory;
  } catch (error) {
    console.error('Error fetching homework history:', error);
    throw new Error(error.message || 'Failed to load homework history.');
  }
};

/**
 * Gets unique grade levels from homework history
 * @param {Array} homeworkHistory - Array of homework items
 * @returns {Array} Sorted array of unique grade levels
 */
export const getUniqueGrades = (homeworkHistory) => {
  return [...new Set(homeworkHistory.map(item => item.gradeLevel))].sort();
};

/**
 * Gets unique subjects from homework history
 * @param {Array} homeworkHistory - Array of homework items
 * @returns {Array} Sorted array of unique subjects
 */
export const getUniqueSubjects = (homeworkHistory) => {
  return [...new Set(homeworkHistory.map(item => item.subject))].sort();
};

/**
 * Filters and sorts homework history data
 * @param {Array} homeworkHistory - Array of homework items
 * @param {Object} filters - Filter options
 * @param {string} filters.grade - Grade level to filter by
 * @param {string} filters.subject - Subject to filter by
 * @param {string} filters.searchTerm - Search term to filter by
 * @param {Object} sortConfig - Sort configuration
 * @param {string} sortConfig.key - Field to sort by
 * @param {string} sortConfig.direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Filtered and sorted homework history
 */
export const filterAndSortHomeworkHistory = (homeworkHistory, filters, sortConfig) => {
  const { grade, subject, searchTerm } = filters;
  
  // Apply filters
  let filteredData = homeworkHistory.filter(item => {
    const matchesGrade = !grade || item.gradeLevel === grade;
    const matchesSubject = !subject || item.subject === subject;
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesGrade && matchesSubject && matchesSearch;
  });

  // Apply sorting
  if (sortConfig.key) {
    filteredData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  return filteredData;
};

/**
 * Formats a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  fetchHomeworkHistory,
  getUniqueGrades,
  getUniqueSubjects,
  filterAndSortHomeworkHistory,
  formatDate
};