import React, { useState } from 'react';
import '../styles/Feedback.css';
import ErrorResponse from './ErrorResponse';
import { submitFeedback } from '../services/feedbackService';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    uiRating: '',
    contentRating: '',
    feedback: '',
    pricePoint: ''
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
        uiRating: formData.uiRating || null,
        contentRating: formData.contentRating || null,
        feedback: formData.feedback.trim(),
        pricePoint: formData.pricePoint || null
      });

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', uiRating: '', contentRating: '', feedback: '', pricePoint: '' });
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
    setFormData({ name: '', email: '', uiRating: '', contentRating: '', feedback: '', pricePoint: '' });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Share Your Feedback</h2>
          <p>We`apost;`d love to hear your thoughts about the Homeschool Activity Generator</p>
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
              <label htmlFor="uiRating">How would you rate the user interface and ease of use?</label>
              <div className="rating-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="ui-excellent"
                    name="uiRating"
                    value="Excellent"
                    checked={formData.uiRating === 'Excellent'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="ui-excellent">Excellent</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="ui-good"
                    name="uiRating"
                    value="Good"
                    checked={formData.uiRating === 'Good'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="ui-good">Good</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="ui-average"
                    name="uiRating"
                    value="Average"
                    checked={formData.uiRating === 'Average'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="ui-average">Average</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="ui-poor"
                    name="uiRating"
                    value="Poor"
                    checked={formData.uiRating === 'Poor'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="ui-poor">Poor</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contentRating">How would you rate the quality of the generated learning activities?</label>
              <div className="rating-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="content-excellent"
                    name="contentRating"
                    value="Excellent"
                    checked={formData.contentRating === 'Excellent'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="content-excellent">Excellent</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="content-good"
                    name="contentRating"
                    value="Good"
                    checked={formData.contentRating === 'Good'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="content-good">Good</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="content-average"
                    name="contentRating"
                    value="Average"
                    checked={formData.contentRating === 'Average'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="content-average">Average</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="content-poor"
                    name="contentRating"
                    value="Poor"
                    checked={formData.contentRating === 'Poor'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="content-poor">Poor</label>
                </div>
              </div>
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

            <div className="form-group">
              <label htmlFor="pricePoint">What do you think would be a fair annual price for unlimited access to this service?</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="price-20-30"
                    name="pricePoint"
                    value="$20-$30/year"
                    checked={formData.pricePoint === '$20-$30/year'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="price-20-30">$20-$30/year</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="price-31-40"
                    name="pricePoint"
                    value="$31-$40/year"
                    checked={formData.pricePoint === '$31-$40/year'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="price-31-40">$31-$40/year</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="price-41-50"
                    name="pricePoint"
                    value="$41-$50/year"
                    checked={formData.pricePoint === '$41-$50/year'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="price-41-50">$41-$50/year</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="price-51-plus"
                    name="pricePoint"
                    value="$51+/year"
                    checked={formData.pricePoint === '$51+/year'}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="price-51-plus">$51+/year</label>
                </div>
              </div>
              <small className="help-text">Optional - This helps us understand what pricing would be most accessible for homeschooling families</small>
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