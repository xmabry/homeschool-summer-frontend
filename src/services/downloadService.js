// Example usage for the S3 Downloader Lambda function
// Add this to your existing apiService.js or create a new downloadService.js

/**
 * Download a PDF file from S3 using the downloader Lambda
 * @param {string} pdfKey - The S3 key/path to the PDF file
 * @param {string} userId - The user ID for access validation
 * @param {string} token - The authentication token (JWT)
 * @param {string} bucketName - Optional bucket name (uses default if not provided)
 * @returns {Promise<void>} - Triggers browser download
 */
export const downloadPDF = async (pdfKey, userId, token, bucketName = null) => {
  try {
    console.log(`Initiating download for: ${pdfKey}`);
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    // Prepare request parameters
    const params = new URLSearchParams({
      key: pdfKey,
      userId: userId
    });
    
    if (bucketName) {
      params.append('bucket', bucketName);
    }
    
    // Call the downloader Lambda
    const response = await fetch(`https://your-api-gateway-url/download?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Download failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Download failed: ${result.error}`);
    }
    
    console.log('Download URL generated successfully:', result.objectInfo);
    
    // Use the pre-signed URL to download the file
    // This approach works without CORS issues since the download URL is direct from S3
    const downloadUrl = result.downloadUrl;
    const filename = pdfKey.split('/').pop(); // Extract filename from key
    
    // Option 1: Direct browser download (recommended)
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Option 2: Alternative - open in new tab
    // window.open(downloadUrl, '_blank');
    
    console.log(`Download initiated for ${filename}`);
    
    return {
      success: true,
      filename: filename,
      size: result.objectInfo.size,
      downloadUrl: downloadUrl,
      expiresAt: result.expiresAt
    };
    
  } catch (error) {
    console.error('Download error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Authentication')) {
      // Redirect to login or refresh token
      window.location.href = '/login';
      return;
    }
    
    if (error.message.includes('Access denied')) {
      alert('You do not have permission to download this file.');
      return;
    }
    
    if (error.message.includes('not found')) {
      alert('The requested file could not be found. It may have been deleted or moved.');
      return;
    }
    
    // Generic error handling
    alert(`Download failed: ${error.message}`);
    throw error;
  }
};

/**
 * Download multiple PDFs as a batch
 * @param {Array} pdfList - Array of {key, userId, token, bucketName} objects
 * @returns {Promise<Array>} - Array of download results
 */
export const downloadMultiplePDFs = async (pdfList) => {
  const results = [];
  
  for (const pdf of pdfList) {
    try {
      const result = await downloadPDF(pdf.key, pdf.userId, pdf.token, pdf.bucketName);
      results.push({ ...pdf, success: true, result });
      
      // Add small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Failed to download ${pdf.key}:`, error);
      results.push({ ...pdf, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Get download URL without triggering download (useful for preview)
 * @param {string} pdfKey - The S3 key/path to the PDF file
 * @param {string} userId - The user ID for access validation
 * @param {string} token - The authentication token (JWT)
 * @param {string} bucketName - Optional bucket name
 * @returns {Promise<Object>} - Object with download URL and metadata
 */
export const getDownloadURL = async (pdfKey, userId, token, bucketName = null) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const params = new URLSearchParams({
      key: pdfKey,
      userId: userId
    });
    
    if (bucketName) {
      params.append('bucket', bucketName);
    }
    
    const response = await fetch(`https://your-api-gateway-url/download?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return {
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
      expiresIn: result.expiresIn,
      objectInfo: result.objectInfo,
      instructions: result.instructions
    };
    
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error;
  }
};