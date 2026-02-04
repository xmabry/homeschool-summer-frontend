import React from 'react';
import '../styles/Welcome.css';

const Welcome = ({ onLogin }) => {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div className="header-content">
          <h1 className="site-title">Mabry Education</h1>
          <button 
            className="login-button"
            onClick={onLogin}
            aria-label="Login to your account"
          >
            Login
          </button>
        </div>
      </header>

      <main className="welcome-main">
        <div className="hero-section">
          <h2 className="hero-title">
            Personalized Homeschool Activity Generator
          </h2>
          <p className="hero-subtitle">
            Create engaging, customized learning activities tailored to your child&apos;s interests and educational needs
          </p>
        </div>

        <div className="features-section">
          <h3>Why Choose Our Activity Generator?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Generation</h3>
              <p>Create personalized learning activities in seconds, not hours</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Age-Appropriate Content</h3>
              <p>Activities automatically adjusted for your child&apos;s grade level and learning style</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3>Multiple Subjects</h3>
              <p>Cover math, science, reading, writing, history, and more with diverse activity types</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Customizable</h3>
              <p>Tailor activities to your child&apos;s interests, learning goals, and educational preferences</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Track Progress</h3>
              <p>Keep a history of activities and monitor your child&apos;s learning journey</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Family-Friendly</h3>
              <p>Designed specifically for homeschooling families with multiple children and varying needs</p>
            </div>
          </div>
        </div>

        <div className="membership-tiers-section">
          <h3>Choose Your Access Level</h3>
          <p>Select the plan that best fits your homeschooling needs</p>
          <div className="tiers-grid">
            <div className="tier-card viewer">
              <div className="tier-header">
                <div className="tier-icon">👀</div>
                <h4>Viewer</h4>
                <div className="tier-price">Free</div>
              </div>
              <div className="tier-features">
                <ul>
                  <li>Review previously generated content</li>
                  <li>Browse shared activities</li>
                  <li>Access to educational resources</li>
                  <li>View activity templates</li>
                </ul>
                <div className="tier-limitation">
                  <strong>No content generation</strong>
                </div>
              </div>
            </div>

            <div className="tier-card member">
              <div className="tier-badge">Most Popular</div>
              <div className="tier-header">
                <div className="tier-icon">⭐</div>
                <h4>Member</h4>
                <div className="tier-price">$6<span className="price-period">/month</span></div>
              </div>
              <div className="tier-features">
                <ul>
                  <li>Generate up to 40 assignments per month</li>
                  <li>That is two (2) assignments per day on average</li>
                  <li>Access to all subject areas</li>
                  <li>Download PDF activities</li>
                  <li>Track activity history</li>
                  <li>Basic customization options</li>
                  <li>Share activities with community</li>
                </ul>
                <div className="tier-highlight">
                  <strong>Perfect for occasional use</strong>
                </div>
              </div>
            </div>

            <div className="tier-card premium popular">
              <div className="tier-header">
                <div className="tier-icon">🚀</div>
                <h4>Premium</h4>
                <div className="tier-price">$16<span className="price-period">/month</span></div>
              </div>
              <div className="tier-features">
                <ul>
                  <li>Generate up to 100 assignments per month</li>
                  <li>That is five (5) assignments per day on average</li>
                  <li>Priority support</li>
                  <li>Bulk download options</li>
                  <li>Early access to new features</li>
                  <li>Share activities with community</li>
                  <li>Unused credits roll over to next month</li>
                </ul>
                <div className="tier-highlight">
                  <strong>Ideal for active homeschoolers</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="how-it-works-section">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Choose Your Topic</h4>
                <p>Select a subject area or let your child pick their favorite topic</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Customize Settings</h4>
                <p>Set age level, difficulty, and any specific learning goals</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Generate & Download</h4>
                <p>Get your custom activity as a PDF ready for printing or digital use</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to Get Started?</h3>
          <p>Join me in creating amazing learning experiences for work from home and homeschooling parents</p>
          <button 
            className="cta-button"
            onClick={onLogin}
          >
            Start Creating Activities
          </button>
        </div>
      </main>

      <footer className="welcome-footer">
        <p>&copy; 2026 Mabry Education. Empowering homeschool families with AI-generated learning activities.</p>
      </footer>
    </div>
  );
};

export default Welcome;