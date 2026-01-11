import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import './HomeschoolForm.css';

const HomeschoolForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    gradeLevel: '',
    subject: '',
    activityDate: new Date(),
    description: '',
    learningGoals: '',
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Configuration for AWS API Gateway
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  if (!API_ENDPOINT) {
    // In development, surface a clear configuration error.
    // Ensure REACT_APP_API_ENDPOINT is set in your environment (e.g., .env file).
    // eslint-disable-next-line no-console
    console.error(
      'HomeschoolForm: REACT_APP_API_ENDPOINT is not set. ' +
      'Please configure the API endpoint before using this form.'
    );
  }

  const gradeLevels = [
    { value: '', label: 'Select Grade Level' },
    { value: 'kindergarten', label: 'Kindergarten' },
    { value: '1st', label: '1st Grade' },
    { value: '2nd', label: '2nd Grade' },
    { value: '3rd', label: '3rd Grade' },
    { value: '4th', label: '4th Grade' },
    { value: '5th', label: '5th Grade' },
    { value: '6th', label: '6th Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '8th', label: '8th Grade' },
    { value: '9th', label: '9th Grade' },
    { value: '10th', label: '10th Grade' },
    { value: '11th', label: '11th Grade' },
    { value: '12th', label: '12th Grade' },
  ];

  const subjects = [
    { value: '', label: 'Select Subject' },
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English/Language Arts' },
    { value: 'history', label: 'History/Social Studies' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'physical-ed', label: 'Physical Education' },
    { value: 'foreign-language', label: 'Foreign Language' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      activityDate: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Prepare data for API
      // Note: `activityDate` captures when the learning activity occurred (user-selected),
      // while `timestamp` records when this form was submitted. Both are sent so the
      // backend can distinguish the event date from the submission/ingestion time.
      const payload = {
        ...formData,
        // Date the activity actually took place (from the date picker)
        activityDate: formData.activityDate.toISOString(),
        // ISO 8601 timestamp of when this record is submitted/created
        timestamp: new Date().toISOString(),
      };

      // Call AWS API Gateway
      const result = await axios.post(`${API_ENDPOINT}/activities`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setResponse(result.data);
      
      // Reset form on success
      setFormData({
        studentName: '',
        gradeLevel: '',
        subject: '',
        activityDate: new Date(),
        description: '',
        learningGoals: '',
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to submit activity. Please check your API endpoint configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homeschool-form-container">
      <h1>Homeschool Summer Activity Log</h1>
      <p className="subtitle">Record your summer learning activities</p>

      <form onSubmit={handleSubmit} className="homeschool-form">
        {/* Student Name Input */}
        <div className="form-group">
          <label htmlFor="studentName">Student Name *</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            required
            placeholder="Enter student name"
          />
        </div>

        {/* Grade Level Dropdown */}
        <div className="form-group">
          <label htmlFor="gradeLevel">Grade Level *</label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleInputChange}
            required
          >
            {gradeLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          >
            {subjects.map((subj) => (
              <option key={subj.value} value={subj.value}>
                {subj.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div className="form-group">
          <label htmlFor="activityDate">Activity Date *</label>
          <DatePicker
            id="activityDate"
            selected={formData.activityDate}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy"
            className="date-picker-input"
            required
            aria-label="Activity date"
            aria-required="true"
          />
        </div>

        {/* Activity Description - Long Text Box */}
        <div className="form-group">
          <label htmlFor="description">Activity Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Describe the learning activity in detail..."
            rows="6"
          />
        </div>

        {/* Learning Goals - Long Text Box */}
        <div className="form-group">
          <label htmlFor="learningGoals">Learning Goals</label>
          <textarea
            id="learningGoals"
            name="learningGoals"
            value={formData.learningGoals}
            onChange={handleInputChange}
            placeholder="What were the learning objectives? (Optional)"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <div className="form-group">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Submitting...' : 'Submit Activity'}
          </button>
        </div>
      </form>

      {/* Success Message */}
      {response && (
        <div className="success-message">
          <h3>✓ Activity submitted successfully!</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <h3>⚠ Error</h3>
          <p>{error}</p>
          <p className="help-text">
            To connect to AWS API Gateway, set the REACT_APP_API_ENDPOINT 
            environment variable in your .env file.
          </p>
        </div>
      )}
    </div>
  );
};

export default HomeschoolForm;
