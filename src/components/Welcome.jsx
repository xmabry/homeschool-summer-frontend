import React from 'react';
import '../styles/Welcome.css';

const Welcome = () => {
  const handleLogin = () => {
    // Get Cognito configuration from environment variables
    const cognitoConfig = {
      domain: import.meta.env.REACT_APP_COGNITO_DOMAIN,
      clientId: import.meta.env.REACT_APP_COGNITO_CLIENT_ID,
      region: import.meta.env.REACT_APP_AWS_REGION || 'us-east-1',
      redirectUri: import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
                   window.location.origin
    };

    // Validate required environment variables
    if (!cognitoConfig.domain || !cognitoConfig.clientId) {
      console.error('Missing required Cognito configuration. Please ensure the following environment variables are set:');
      console.error('-  REACT_APP_COGNITO_DOMAIN');
      console.error('- REACT_APP_COGNITO_CLIENT_ID');
      console.error('- REACT_APP_AWS_REGION (optional, defaults to us-east-1)');
      console.error('- REACT_APP_COGNITO_REDIRECT_URI (optional, defaults to current origin)');
      alert('Login configuration is missing. Please contact support.');
      return;
    }

    // Build Cognito hosted UI login URL
    const loginUrl = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/login?` +
      `client_id=${cognitoConfig.clientId}&` +
      `response_type=code&` +
      `scope=email+openid+profile&` +
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
            Create engaging, customized learning activities tailored to your child`&apos;s interests and educational needs
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
              <p>Advanced AI creates unique activities based on your child`&apos;s age, interests, and learning style</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Print-Ready Materials</h3>
              <p>Download professionally formatted PDFs with all the materials you need to get started</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Track Progress</h3>
              <p>Keep a history of activities and monitor your child`&apos;s learning journey</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Family-Friendly</h3>
              <p>Designed specifically for homeschooling families with multiple children and varying needs</p>
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