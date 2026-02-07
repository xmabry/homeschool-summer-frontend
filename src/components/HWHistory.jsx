import React, { useState, useEffect, useMemo } from 'react';
import '../styles/HWHistory.css';
import ErrorResponse from './ErrorResponse';
import { downloadMultiplePDFs } from '../services/downloadService';
import homeworkHistoryService from '../services/homeworkHistoryService';

const HWHistory = () => {
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



  // Check if user has sharing permissions (member or premium)
  const canShare = useMemo(() => {
    return userGroups.includes('member') || userGroups.includes('premium');
  }, [userGroups]);

  // Fetch homework history from API
  useEffect(() => {
    const loadHomeworkHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userHistory = await homeworkHistoryService.fetchHomeworkHistory();
        setHomeworkHistory(userHistory);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeworkHistory();
  }, []);

  // TODO: Extract user groups from API or context when needed
  useEffect(() => {
    // For now, assume user has basic permissions
    // This should be handled by the parent authentication system
    setUserGroups(['viewer']); // Default permission
  }, []);

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
      
      const selectedHomework = homeworkHistory.filter(item => 
        selectedItems.has(item.id)
      );

      const downloadRequests = selectedHomework.map(homework => ({
        key: homework.pdfKey || homework.s3Key || `homework-${homework.id}.pdf`,
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
      
      const selectedHomework = homeworkHistory.filter(item => 
        selectedItems.has(item.id)
      );

      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || import.meta.env.REACT_APP_API_ENDPOINT;
      
      // Share each selected item - auth handled by App.jsx
      const sharePromises = selectedHomework.map(homework => 
        fetch(`${apiEndpoint}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemId: homework.id,
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

  // Filter and sort data using service
  const filteredAndSortedData = useMemo(() => {
    const filters = {
      grade: filterGrade,
      subject: filterSubject,
      searchTerm: searchTerm
    };
    
    return homeworkHistoryService.filterAndSortHomeworkHistory(
      homeworkHistory, 
      filters, 
      sortConfig
    );
  }, [homeworkHistory, sortConfig, filterGrade, filterSubject, searchTerm]);

  // Get unique grades and subjects for filters
  const uniqueGrades = homeworkHistoryService.getUniqueGrades(homeworkHistory);
  const uniqueSubjects = homeworkHistoryService.getUniqueSubjects(homeworkHistory);

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  if (loading) {
    return (
      <div className="hw-history-container">
        <div className="loading-spinner">
          Loading homework history...
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
            window.location.reload();
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
                  <td className="date-cell">{homeworkHistoryService.formatDate(homework.createdAt)}</td>
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