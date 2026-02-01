import React, { useState, useEffect, useMemo } from 'react';
import '../styles/HWHistory.css';
import { useAuth } from '../contexts/AuthContext';
import ErrorResponse from './ErrorResponse';
import { getHistory } from '../services/generatorService';
import { downloadMultiplePDFs } from '../services/downloadService';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

const HWHistory = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [homeworkHistory, setHomeworkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [userGroups, setUserGroups] = useState([]);

  // Extract user groups from JWT token
  const extractUserGroups = (token) => {
    if (!token) return [];
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload['cognito:groups'] || [];
    } catch (error) {
      console.error('Error extracting user groups:', error);
      return [];
    }
  };

  // Check if user has sharing permissions (member or premium)
  const canShare = useMemo(() => {
    return userGroups.includes('member') || userGroups.includes('premium');
  }, [userGroups]);

  // Fetch homework history from API - only when user is authenticated
  useEffect(() => {
    const fetchHomeworkHistory = async () => {
      // Don't fetch if auth is still loading or user is not authenticated
      if (authLoading || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get user-specific history through the authorized service
        const data = await getHistory();
        
        // Ensure we only display data that belongs to the authenticated user
        const userHistory = Array.isArray(data.activities) ? data.activities : 
                           Array.isArray(data) ? data : [];
        
        setHomeworkHistory(userHistory);
      } catch (err) {
        console.error('Error fetching homework history:', err);
        if (err.message.includes('Authentication failed')) {
          setError('Please log in again to view your homework history.');
        } else {
          setError(err.message || 'Failed to load homework history.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkHistory();
  }, [isAuthenticated, authLoading]);

  // Extract user groups when user changes
  useEffect(() => {
    const extractGroups = async () => {
      if (isAuthenticated && user) {
        try {
          const session = await fetchAuthSession();
          const idToken = session?.tokens?.idToken?.toString();
          if (idToken) {
            const groups = extractUserGroups(idToken);
            setUserGroups(groups);
          }
        } catch (error) {
          console.error('Error extracting user groups:', error);
          setUserGroups([]);
        }
      } else {
        setUserGroups([]);
      }
    };

    extractGroups();
  }, [user, isAuthenticated]);

  // Handle item selection (max 3 items)
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else if (newSelected.size < 3) {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  // Handle bulk download of selected items
  const handleDownloadSelected = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to download.');
      return;
    }

    try {
      setDownloading(true);
      
      // Get current user and auth session using the updated Amplify v6 API
      const [currentUser, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession()
      ]);
      
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const selectedHomework = homeworkHistory.filter(item => 
        selectedItems.has(item.id)
      );

      const downloadRequests = selectedHomework.map(homework => ({
        key: homework.pdfKey || homework.s3Key || `homework-${homework.id}.pdf`,
        userId: currentUser.userId,
        token: token,
        bucketName: null // Use default bucket
      }));

      const results = await downloadMultiplePDFs(downloadRequests);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed > 0) {
        alert(`Downloaded ${successful} files successfully. ${failed} downloads failed.`);
      } else {
        alert(`Successfully downloaded ${successful} files.`);
      }
      
      // Clear selection after download
      setSelectedItems(new Set());
      
    } catch (err) {
      console.error('Download error:', err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Handle sharing of selected items
  const handleShareSelected = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to share.');
      return;
    }

    try {
      setSharing(true);
      
      // Get current user and auth session
      const [currentUser, session] = await Promise.all([
        getCurrentUser(),
        fetchAuthSession()
      ]);
      
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const selectedHomework = homeworkHistory.filter(item => 
        selectedItems.has(item.id)
      );

      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || import.meta.env.REACT_APP_API_ENDPOINT;
      
      // Share each selected item
      const sharePromises = selectedHomework.map(homework => 
        fetch(`${apiEndpoint}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            itemId: homework.id,
            userId: currentUser.userId,
            title: homework.title,
            subject: homework.subject,
            gradeLevel: homework.gradeLevel
          })
        })
      );

      const results = await Promise.allSettled(sharePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failed = results.length - successful;
      
      if (failed > 0) {
        alert(`Shared ${successful} items successfully. ${failed} items failed to share.`);
      } else {
        alert(`Successfully shared ${successful} item${successful === 1 ? '' : 's'}! They are now visible to all users.`);
      }
      
      // Clear selection after sharing
      setSelectedItems(new Set());
      
    } catch (err) {
      console.error('Share error:', err);
      alert(`Sharing failed: ${err.message}`);
    } finally {
      setSharing(false);
    }
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filteredData = homeworkHistory.filter(item => {
      const matchesGrade = !filterGrade || item.gradeLevel === filterGrade;
      const matchesSubject = !filterSubject || item.subject === filterSubject;
      const matchesSearch = !searchTerm || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesGrade && matchesSubject && matchesSearch;
    });

    // Sort data
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
  }, [homeworkHistory, sortConfig, filterGrade, filterSubject, searchTerm]);

  // Get unique grades and subjects for filters
  const uniqueGrades = [...new Set(homeworkHistory.map(item => item.gradeLevel))].sort();
  const uniqueSubjects = [...new Set(homeworkHistory.map(item => item.subject))].sort();

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="hw-history-container">
        <div className="loading-spinner">Loading homework history...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hw-history-container">
        <div className="auth-required">
          <h3>Authentication Required</h3>
          <p>Please log in to view your homework history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hw-history-container">
        <ErrorResponse 
          error={{ message: error }}
          onRetry={() => {
            setError(null);
            // Only retry if user is authenticated
            if (isAuthenticated) {
              window.location.reload();
            }
          }}
          onDismiss={() => {
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="hw-history-container">
      <div className="hw-history-header">
        <h2>Homework Generation History</h2>
        {selectedItems.size > 0 && (
          <div className="selection-controls">
            <span className="selection-info">
              {selectedItems.size} of 3 items selected
            </span>
            <button 
              className="download-selected-btn"
              onClick={handleDownloadSelected}
              disabled={downloading || selectedItems.size === 0}
            >
              {downloading ? 'Downloading...' : `Download Selected (${selectedItems.size})`}
            </button>
            {canShare && (
              <button 
                className="share-selected-btn"
                onClick={handleShareSelected}
                disabled={sharing || selectedItems.size === 0}
              >
                {sharing ? 'Sharing...' : `Share Selected (${selectedItems.size})`}
              </button>
            )}
            <button 
              className="clear-selection-btn"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          </div>
        )}
        <div className="controls-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search homework..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="filter-select"
            >
              <option value="">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="hw-history-table">
          <thead>
            <tr>
              <th className="select-column">Select</th>
              <th onClick={() => requestSort('title')} className="sortable">
                Title {getSortIcon('title')}
              </th>
              <th onClick={() => requestSort('gradeLevel')} className="sortable">
                Grade {getSortIcon('gradeLevel')}
              </th>
              <th onClick={() => requestSort('subject')} className="sortable">
                Subject {getSortIcon('subject')}
              </th>
              <th onClick={() => requestSort('difficulty')} className="sortable">
                Difficulty {getSortIcon('difficulty')}
              </th>
              <th onClick={() => requestSort('createdAt')} className="sortable">
                Created {getSortIcon('createdAt')}
              </th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((homework, index) => {
                const isSelected = selectedItems.has(homework.id);
                const canSelect = selectedItems.size < 3 || isSelected;
                
                return (
                  <tr key={homework.id || index} className={`table-row ${isSelected ? 'selected' : ''}`}>
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemSelect(homework.id)}
                        disabled={!canSelect}
                        className="select-checkbox"
                      />
                    </td>
                    <td className="title-cell">{homework.title || 'Untitled'}</td>
                  <td className="grade-cell">
                    <span className="grade-badge">Grade {homework.gradeLevel}</span>
                  </td>
                  <td className="subject-cell">{homework.subject}</td>
                  <td className="difficulty-cell">
                    <span className={`difficulty-badge ${homework.difficulty?.toLowerCase()}`}>
                      {homework.difficulty}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(homework.createdAt)}</td>
                  <td className="description-cell">
                    <div className="description-text">
                      {homework.description || 'No description available'}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => console.log('View homework:', homework.id)}
                    >
                      View
                    </button>
                    <button 
                      className="action-btn regenerate-btn"
                      onClick={() => console.log('Regenerate homework:', homework.id)}
                    >
                      Regenerate
                    </button>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No homework history found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="results-info">
        Showing {filteredAndSortedData.length} of {homeworkHistory.length} homework assignments
      </div>
    </div>
  );
};

export default HWHistory;