import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/GererateActivityForm.css';
import ErrorResponse from './ErrorResponse';
import { generateActivity } from '../services/generatorService';

const GenerateActivityForm = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    gradeLevel: '',
    subject: '',
    prompt: '',
    skills: [],
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check authentication before submitting
    if (!isAuthenticated) {
      setError('Please log in to generate activities.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Prepare data for API
      // Use current timestamp as the activity date since user doesn't specify
      const payload = {
        ...formData,
        // ISO 8601 timestamp of when this record is submitted/created
        timestamp: new Date().toISOString(),
      };

      // Call the authenticated generate activity service
      const result = await generateActivity(payload);

      setResponse(result);
      
      // Reset form on success
      setFormData({
        gradeLevel: '', 
        subject: '',
        prompt: '', 
        skills: [],
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.message.includes('Authentication failed')) {
        setError('Please log in again to generate activities.');
      } else {
        setError(
          err.message || 
          'Failed to generate activity. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="homeschool-form-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Require authentication to access the form
  if (!isAuthenticated) {
    return (
      <div className="homeschool-form-container">
        <div className="auth-required">
          <h3>Authentication Required</h3>
          <p>Please log in to generate homeschool activities.</p>
        </div>
      </div>
    );
  }

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
          message: 'Failed to generate activity',
          details: error
        } : null}
        onRetry={() => {
          if (isAuthenticated) {
            setError(null);
            handleSubmit(new Event('submit'));
          }
        }}
        onDismiss={() => {
          setError(null);
        }}
      />
    </div>
  );
};

export default GenerateActivityForm;