// Feedback Service
// Handles feedback submission and processing

import cognitoService from './cognitoService';

/**
 * Submits user feedback to the API
 * @param {Object} feedbackData - The feedback data to submit
 * @returns {Promise<Object>} The API response
 * @throws {Error} If the submission fails
 */
export const submitFeedback = async (feedbackData) => {
  try {
    // Get current user info from Cognito service (optional for feedback)
    let userId = null;
    let token = null;
    
    try {
      const userResult = await cognitoService.getCurrentUser();
      if (userResult.success) {
        userId = userResult.user.userId;
        token = cognitoService.getIdToken();
      }
    } catch (authError) {
      // User might not be authenticated for feedback - that's okay
      console.log('User not authenticated for feedback submission');
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if user is authenticated
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || import.meta.env.REACT_APP_API_ENDPOINT;
    const response = await fetch(`${apiEndpoint}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...feedbackData,
        ...(userId && { userId }),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default {
  submitFeedback
};