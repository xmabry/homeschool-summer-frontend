import React, { useState } from 'react';
import '../styles/Feedback.css';
import ErrorResponse from './ErrorResponse';
import { submitFeedback } from '../services/generatorService';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.feedback.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await submitFeedback({
        name: formData.name.trim(),
        email: formData.email.trim(),
        feedback: formData.feedback.trim()
      });

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', feedback: '' });
      } else {
        throw new Error(result.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', feedback: '' });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Share Your Feedback</h2>
          <p>We`apost;d love to hear your thoughts about the Homeschool Activity Generator</p>
        </div>

        {success && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Thank you for your feedback!</h3>
            <p>We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve the experience for all homeschooling families.</p>
            <button 
              className="submit-another-btn"
              onClick={handleReset}
            >
              Submit Another Feedback
            </button>
          </div>
        )}

        {!success && (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Your Feedback *</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                placeholder="Share your thoughts, suggestions, or report any issues you've encountered. What do you like? What could be improved?"
                required
                disabled={loading}
                className="form-textarea"
                rows={6}
              />
              <div className="character-count">
                {formData.feedback.length} characters
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
                disabled={loading}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.feedback.trim()}
              >
                {loading ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}

        <ErrorResponse 
          error={error ? { message: error } : null}
          onRetry={() => {
            setError(null);
            handleSubmit(new Event('submit'));
          }}
          onDismiss={() => {
            setError(null);
          }}
        />
      </div>
    </div>
  );
};

export default Feedback;