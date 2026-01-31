import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../styles/GererateActivityForm.css';
import ErrorResponse from './ErrorResponse';

const GenerateActivityForm = () => {
  const [formData, setFormData] = useState({
    gradeLevel: '',
    subject: '',
    activityDate: new Date(),
    prompt: '',
    skills: [],
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Configuration for AWS API Gateway
  const API_ENDPOINT = import.meta.env.REACT_APP_API_ENDPOINT;
  if (!API_ENDPOINT) {
    // In development, surface a clear configuration error.
    // Ensure REACT_APP_API_ENDPOINT is set in your environment (e.g., .env file).
    // eslint-disable-next-line no-console
    console.error(
      'GenerateActivityForm: REACT_APP_API_ENDPOINT is not set. ' +
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
    { value: 'finance', label: 'Finance' },
    { value: 'history', label: 'History/Social Studies' },
    { value: 'coding', label: 'Coding/Computer Science' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'physical-ed', label: 'Physical Education' },
    { value: 'geography', label: 'Geography' },
    { value: 'spanish', label: 'Spanish' }
  ];

  const skills = [
    { value: '', label: 'Select Skill' },
    { value: 'critical-thinking', label: 'Critical Thinking' },
    { value: 'problem-solving', label: 'Problem Solving' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'communication', label: 'Communication' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'time-management', label: 'Time Management' },
    { value: 'adaptability', label: 'Adaptability' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Handle multi-select for skills
    if (name === 'skills') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        [name]: selectedOptions,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
      const result = await axios.post(`${API_ENDPOINT}/generate-hw`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setResponse(result.data);
      
      // Reset form on success
      setFormData({
        gradeLevel: '', 
        subject: '',
        activityDate: new Date(),
        prompt: '', 
        skills: [],
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
      <h1>Homeschool Summer Activity Generator</h1>
      <p className="subtitle">Submit parameters to develop a prompt for the type of learning activity you want to generate.</p>

      <form onSubmit={handleSubmit} className="homeschool-form">

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

        {/* Prompt - Long Text Box */}
{/*         <div className="form-group">
          <label htmlFor="prompt">Prompt*</label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            required
            placeholder="Describe the learning activity in detail in the form of a prompt for Generative AI foundation model"
            rows="6"
          />
        </div> */}

        {/*  Skills multi-select */}
        <div className="form-group">
          <label htmlFor="skills">Skills/Learning Objectives</label>
          <select
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            multiple
            size="5"
            className="multi-select"
          >
            {skills.slice(1).map((skill) => ( // Fixed: Skip the first "Select Skill" option for multi-select
              <option key={skill.value} value={skill.value}>
                {skill.label}
              </option>
            ))}
          </select>
          <small className="help-text">Hold Ctrl (Cmd on Mac) to select multiple skills</small>
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
      
      <ErrorResponse 
        error={error ? { 
          message: 'Failed to submit activity',
          details: error
        } : null}
        onRetry={() => {
          setError(null);
          handleSubmit(new Event('submit'));
        }}
        onDismiss={() => {
          setError(null);
        }}
      />
    </div>
  );
};

export default GenerateActivityForm;