import { Auth } from 'aws-amplify';

export const generateActivity = async (activityData) => {
  try {
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const user = await Auth.currentAuthenticatedUser();
    
    const response = await fetch(`${import.meta.env.REACT_APP_API_ENDPOINT}/generate-hw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...activityData,
        userId: user.attributes.sub
      })
    });
    
    if (!response.ok) {
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
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    const user = await Auth.currentAuthenticatedUser();
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      userId: user.attributes.sub,
      ...filters
    });
    
    const response = await fetch(`${import.meta.env.REACT_APP_API_ENDPOINT}/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};