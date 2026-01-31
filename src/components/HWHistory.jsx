import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from 'aws-amplify';
import '../styles/HWHistory.css';
import ErrorResponse from './ErrorResponse';
import { getHistory } from '../services/generatorService';
import { downloadMultiplePDFs } from '../services/downloadService';

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

  // Fetch homework history from API
  useEffect(() => {
    const fetchHomeworkHistory = async () => {
      try {
        setLoading(true);
        const data = await getHistory();
        setHomeworkHistory(data.activities || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkHistory();
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
      const user = await Auth.currentAuthenticatedUser();
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();

      const selectedHomework = homeworkHistory.filter(item => 
        selectedItems.has(item.id)
      );

      const downloadRequests = selectedHomework.map(homework => ({
        key: homework.pdfKey || homework.s3Key || `homework-${homework.id}.pdf`,
        userId: user.attributes.sub,
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

  if (loading) {
    return (
      <div className="hw-history-container">
        <div className="loading-spinner">Loading homework history...</div>
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
            // Retry loading the history
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