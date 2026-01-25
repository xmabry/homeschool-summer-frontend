// Example usage for the S3 Downloader Lambda function
// Add this to your existing apiService.js or create a new downloadService.js

/**
 * Download a PDF file from S3 using the downloader Lambda
 * @param {string} pdfKey - The S3 key/path to the PDF file
 * @param {string} userId - The user ID for access validation
 * @param {string} bucketName - Optional bucket name (uses default if not provided)
 * @returns {Promise<void>} - Triggers browser download
 */
export const downloadPDF = async (pdfKey, userId, bucketName = null) => {
  try {
    console.log(`Initiating download for: ${pdfKey}`);
    
    // Get the JWT token from your auth context
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
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
    throw error;\n  }\n};\n\n/**\n * Download multiple PDFs as a batch\n * @param {Array} pdfList - Array of {key, userId, bucketName} objects\n * @returns {Promise<Array>} - Array of download results\n */\nexport const downloadMultiplePDFs = async (pdfList) => {\n  const results = [];\n  \n  for (const pdf of pdfList) {\n    try {\n      const result = await downloadPDF(pdf.key, pdf.userId, pdf.bucketName);\n      results.push({ ...pdf, success: true, result });\n      \n      // Add small delay between downloads to avoid overwhelming the browser\n      await new Promise(resolve => setTimeout(resolve, 500));\n      \n    } catch (error) {\n      console.error(`Failed to download ${pdf.key}:`, error);\n      results.push({ ...pdf, success: false, error: error.message });\n    }\n  }\n  \n  return results;\n};\n\n/**\n * Get download URL without triggering download (useful for preview)\n * @param {string} pdfKey - The S3 key/path to the PDF file\n * @param {string} userId - The user ID for access validation\n * @param {string} bucketName - Optional bucket name\n * @returns {Promise<Object>} - Object with download URL and metadata\n */\nexport const getDownloadURL = async (pdfKey, userId, bucketName = null) => {\n  try {\n    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');\n    \n    if (!token) {\n      throw new Error('Authentication token not found');\n    }\n    \n    const params = new URLSearchParams({\n      key: pdfKey,\n      userId: userId\n    });\n    \n    if (bucketName) {\n      params.append('bucket', bucketName);\n    }\n    \n    const response = await fetch(`https://your-api-gateway-url/download?${params.toString()}`, {\n      method: 'GET',\n      headers: {\n        'Authorization': `Bearer ${token}`,\n        'Content-Type': 'application/json'\n      }\n    });\n    \n    if (!response.ok) {\n      const errorData = await response.json();\n      throw new Error(errorData.error || response.statusText);\n    }\n    \n    const result = await response.json();\n    \n    if (!result.success) {\n      throw new Error(result.error);\n    }\n    \n    return {\n      downloadUrl: result.downloadUrl,\n      expiresAt: result.expiresAt,\n      expiresIn: result.expiresIn,\n      objectInfo: result.objectInfo,\n      instructions: result.instructions\n    };\n    \n  } catch (error) {\n    console.error('Failed to get download URL:', error);\n    throw error;\n  }\n};\n\n// Usage examples:\n\n/*\n// Example 1: Simple PDF download\nimport { downloadPDF } from './downloadService';\n\nconst handleDownload = async () => {\n  try {\n    await downloadPDF(\n      '2026-01-24/user_12345/math-worksheet-123.pdf',\n      'user_12345'\n    );\n    console.log('Download completed successfully');\n  } catch (error) {\n    console.error('Download failed:', error);\n  }\n};\n\n// Example 2: Download from specific bucket\nconst handleCustomBucketDownload = async () => {\n  await downloadPDF(\n    'special-activities/advanced/science-lab.pdf',\n    'user_12345',\n    'special-content-bucket'\n  );\n};\n\n// Example 3: Batch download\nimport { downloadMultiplePDFs } from './downloadService';\n\nconst handleBatchDownload = async () => {\n  const pdfsToDownload = [\n    { key: 'user_12345/2026-01-24/math-worksheet.pdf', userId: 'user_12345' },\n    { key: 'user_12345/2026-01-23/reading-exercise.pdf', userId: 'user_12345' },\n    { key: 'user_12345/2026-01-22/science-lab.pdf', userId: 'user_12345' }\n  ];\n  \n  const results = await downloadMultiplePDFs(pdfsToDownload);\n  \n  const successful = results.filter(r => r.success).length;\n  const failed = results.filter(r => !r.success).length;\n  \n  console.log(`Downloaded ${successful} files successfully, ${failed} failed`);\n};\n\n// Example 4: Get download URL for preview\nimport { getDownloadURL } from './downloadService';\n\nconst handlePreview = async () => {\n  try {\n    const urlInfo = await getDownloadURL(\n      '2026-01-24/user_12345/worksheet.pdf',\n      'user_12345'\n    );\n    \n    // Open in new tab for preview\n    window.open(urlInfo.downloadUrl, '_blank');\n    \n    console.log('Preview opened, URL expires at:', urlInfo.expiresAt);\n  } catch (error) {\n    console.error('Preview failed:', error);\n  }\n};\n\n// Example 5: React component usage\nimport React from 'react';\nimport { downloadPDF } from './downloadService';\n\nconst DownloadButton = ({ pdfKey, userId, filename }) => {\n  const [isDownloading, setIsDownloading] = React.useState(false);\n  \n  const handleClick = async () => {\n    setIsDownloading(true);\n    try {\n      await downloadPDF(pdfKey, userId);\n      // Optional: Show success message\n    } catch (error) {\n      // Error handling is done in the downloadPDF function\n    } finally {\n      setIsDownloading(false);\n    }\n  };\n  \n  return (\n    <button \n      onClick={handleClick} \n      disabled={isDownloading}\n      className=\"download-btn\"\n    >\n      {isDownloading ? 'Downloading...' : `Download ${filename}`}\n    </button>\n  );\n};\n*/\n