import React from 'react';
import '../styles/Welcome.css';

const Welcome = () => {
  const handleLogin = () => {
    // Get Cognito configuration from environment variables
    // Support both VITE_ and REACT_APP_ prefixes for compatibility
    const cognitoConfig = {
      domain: import.meta.env.VITE_COGNITO_DOMAIN || 
              import.meta.env.REACT_APP_COGNITO_DOMAIN,
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 
                import.meta.env.REACT_APP_COGNITO_CLIENT_ID ||
                import.meta.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION || 
              import.meta.env.REACT_APP_AWS_REGION || 
              'us-east-1',
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || 
                   import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
                   window.location.origin
    };

    // Validate required environment variables
    if (!cognitoConfig.domain || !cognitoConfig.clientId) {
      console.error('Missing required Cognito configuration. Please ensure the following environment variables are set:');
      console.error('For Vite:');
      console.error('- VITE_COGNITO_DOMAIN');
      console.error('- VITE_COGNITO_CLIENT_ID');
      console.error('- VITE_AWS_REGION (optional, defaults to us-east-1)');
      console.error('- VITE_COGNITO_REDIRECT_URI (optional, defaults to current origin)');
      console.error('Current values:');
      console.error('Domain:', cognitoConfig.domain);
      console.error('Client ID:', cognitoConfig.clientId);
      console.error('Region:', cognitoConfig.region);
      alert('Login configuration is missing. Please contact support.');
      return;
    }

    // Build Cognito hosted UI login URL
    const loginUrl = `https://${cognitoConfig.domain}/login?` +
      `client_id=${cognitoConfig.clientId}&` +
      `response_type=code&` +
      `scope=email+openid+phone+profile&` +
      `redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`;

    // Redirect to Cognito login page
    window.location.href = loginUrl;
  };

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div className="header-content">
          <h1 className="site-title">Mabry Education</h1>
          <button 
            className="login-button"
            onClick={handleLogin}
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
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Curriculum-Aligned</h3>
              <p>Activities designed to support your homeschool curriculum and learning objectives</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Creative & Interactive</h3>
              <p>Engaging activities that combine learning with creativity and hands-on experiences</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>AI-Powered Generation</h3>
              <p>Advanced AI creates unique activities based on your child&apos;s age, interests, and learning style</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Print-Ready Materials</h3>
              <p>Download professionally formatted PDFs with all the materials you need to get started</p>
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
              <div className="tier-header">
                <div className="tier-icon">⭐</div>
                <h4>Member</h4>
              </div>
              <div className="tier-features">
                <ul>
                  <li>Generate up to 10 assignments per month</li>
                  <li>Access to all subject areas</li>
                  <li>Download PDF activities</li>
                  <li>Track activity history</li>
                  <li>Basic customization options</li>
                </ul>
                <div className="tier-highlight">
                  <strong>Perfect for occasional use</strong>
                </div>
              </div>
            </div>

            <div className="tier-card premium popular">
              <div className="tier-badge">Most Popular</div>
              <div className="tier-header">
                <div className="tier-icon">🚀</div>
                <h4>Premium</h4>
              </div>
              <div className="tier-features">
                <ul>
                  <li>Generate up to 30 assignments per month</li>
                  <li>Advanced AI customization</li>
                  <li>Priority support</li>
                  <li>Bulk download options</li>
                  <li>Advanced reporting & analytics</li>
                  <li>Early access to new features</li>
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
                <p>Our AI creates a unique activity and provides a print-ready PDF</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Learn & Enjoy</h4>
                <p>Use the activity with your child and watch them learn through play</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to Get Started?</h3>
          <p>Join thousands of homeschooling families creating amazing learning experiences</p>
          <button 
            className="cta-button"
            onClick={handleLogin}
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