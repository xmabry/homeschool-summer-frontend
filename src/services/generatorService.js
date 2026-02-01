import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export const generateActivity = async (activityData) => {
  try {
    // Get current user and auth session from Cognito
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession()
    ]);
    
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('User is not authenticated');
    }
    
    const response = await fetch(`${import.meta.env.REACT_APP_API_ENDPOINT}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...activityData,
        userId: user.userId
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating activity:', error);
    throw error;
  }
};

export const getHistory = async (filters = {}) => {
  try {
    // Get current user and auth session from Cognito
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession()
    ]);
    
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('User is not authenticated');
    }
    
    // Build query parameters if filters are provided
    const queryParams = new URLSearchParams({
      userId: user.userId,
      ...filters
    });
    
    const response = await fetch(`${import.meta.env.REACT_APP_API_ENDPOINT}/activities/history?${queryParams}`, {
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
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    // Get current user and auth session from Cognito (optional for feedback)
    let userId = null;
    let token = null;
    
    try {
      const [user, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession()
      ]);
      
      userId = user.userId;
      token = session.tokens?.idToken?.toString();
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
    
    const response = await fetch(`${import.meta.env.REACT_APP_API_ENDPOINT}/feedback`, {
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