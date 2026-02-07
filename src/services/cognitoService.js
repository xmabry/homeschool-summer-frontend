import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';

class CognitoService {
  constructor() {
    // Get configuration from environment variables
    this.userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || import.meta.env.REACT_APP_COGNITO_USER_POOL_ID;
    this.clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || 
                    import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || 
                    import.meta.env.REACT_APP_COGNITO_CLIENT_ID ||
                    import.meta.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID;
    this.region = import.meta.env.VITE_AWS_REGION || import.meta.env.REACT_APP_AWS_REGION || 'us-east-1';
    this.domain = import.meta.env.VITE_COGNITO_DOMAIN || import.meta.env.REACT_APP_COGNITO_DOMAIN;    
    // Initialize Cognito client
    this.client = new CognitoIdentityProviderClient({
      region: this.region
    });
    
    // Storage keys for tokens
    this.ACCESS_TOKEN_KEY = 'cognito_access_token';
    this.ID_TOKEN_KEY = 'cognito_id_token';
    this.REFRESH_TOKEN_KEY = 'cognito_refresh_token';
    this.USER_INFO_KEY = 'cognito_user_info';
  }

  // Store tokens in localStorage - handles both OAuth and direct auth formats
  _storeTokens(tokens) {
    // Handle OAuth format (snake_case)
    if (tokens.access_token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    }
    if (tokens.id_token) {
      localStorage.setItem(this.ID_TOKEN_KEY, tokens.id_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    
    // Handle direct auth format (PascalCase) - backward compatibility
    if (tokens.AccessToken) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.AccessToken);
    }
    if (tokens.IdToken) {
      localStorage.setItem(this.ID_TOKEN_KEY, tokens.IdToken);
    }
    if (tokens.RefreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.RefreshToken);
    }
  }

  // Get stored tokens
  _getStoredTokens() {
    return {
      accessToken: localStorage.getItem(this.ACCESS_TOKEN_KEY),
      idToken: localStorage.getItem(this.ID_TOKEN_KEY),
      refreshToken: localStorage.getItem(this.REFRESH_TOKEN_KEY)
    };
  }

  // Clear stored tokens
  _clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.ID_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  // Parse JWT token payload
  _parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  // Check if token is expired
  _isTokenExpired(token) {
    if (!token) return true;
    const payload = this._parseJWT(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }
  // Sign in user
  async signIn(username, password) {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      });

      const response = await this.client.send(command);
      
      if (response.AuthenticationResult) {
        // Store tokens
        this._storeTokens(response.AuthenticationResult);
        
        // Get user info and store it
        const userInfo = await this._getUserInfo(response.AuthenticationResult.AccessToken);
        localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
        
        return { 
          success: true, 
          user: userInfo,
          tokens: response.AuthenticationResult
        };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out user
  async signOut() {
    try {
      const tokens = this._getStoredTokens();
      
      if (tokens.accessToken) {
        // Perform global sign out if we have an access token
        const command = new GlobalSignOutCommand({
          AccessToken: tokens.accessToken
        });
        
        try {
          await this.client.send(command);
        } catch (error) {
          console.warn('Global sign out failed, clearing local tokens anyway:', error);
        }
      }
      
      // Always clear local tokens
      this._clearTokens();
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear tokens even if sign out fails
      this._clearTokens();
      return { success: false, error: error.message };
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const tokens = this._getStoredTokens();
      
      if (!tokens.accessToken || this._isTokenExpired(tokens.accessToken)) {
        throw new Error('No valid access token found');
      }

      // Try to get cached user info first
      const cachedUserInfo = localStorage.getItem(this.USER_INFO_KEY);
      if (cachedUserInfo) {
        try {
          const userInfo = JSON.parse(cachedUserInfo);
          return { success: true, user: userInfo };
        } catch (parseError) {
          console.warn('Failed to parse cached user info, fetching fresh');
        }
      }

      // Fetch fresh user info
      const userInfo = await this._getUserInfo(tokens.accessToken);
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to get user info
  async _getUserInfo(accessToken) {
    const command = new GetUserCommand({
      AccessToken: accessToken
    });

    const response = await this.client.send(command);
    
    // Transform Cognito user attributes to a more usable format
    const attributes = {};
    if (response.UserAttributes) {
      response.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });
    }

    return {
      username: response.Username,
      userId: attributes.sub || response.Username,
      email: attributes.email,
      attributes: attributes,
      userStatus: response.UserStatus
    };
  }

  // Sign up new user
  async signUp(username, password, email) {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          }
        ]
      });

      const response = await this.client.send(command);
      
      return { 
        success: true, 
        user: {
          username: response.UserSub,
          userId: response.UserSub,
          email: email,
          confirmed: response.UserConfirmed
        }
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  }

  // Confirm sign up with verification code
  async confirmSignUp(username, confirmationCode) {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: username,
        ConfirmationCode: confirmationCode
      });

      await this.client.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error confirming sign up:', error);
      return { success: false, error: error.message };
    }
  }

  // Get access token for API calls
  getAccessToken() {
    const tokens = this._getStoredTokens();
    return tokens.accessToken && !this._isTokenExpired(tokens.accessToken) 
      ? tokens.accessToken 
      : null;
  }

  // Get ID token for API calls
  getIdToken() {
    const tokens = this._getStoredTokens();
    return tokens.idToken && !this._isTokenExpired(tokens.idToken) 
      ? tokens.idToken 
      : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const tokens = this._getStoredTokens();
    return tokens.accessToken && !this._isTokenExpired(tokens.accessToken);
  }

  // OAuth2 Authorization Code Exchange
  async exchangeCodeForTokens(authCode, redirectUri = null) {
    try {
      if (!this.domain) {
        throw new Error('Cognito domain not configured. Set VITE_COGNITO_DOMAIN in environment variables.');
      }
      
      if (!this.clientId) {
        throw new Error('Cognito client ID not configured. Set VITE_COGNITO_CLIENT_ID in environment variables.');
      }

      // Use provided redirectUri or construct default
      const finalRedirectUri = redirectUri || 
        import.meta.env.VITE_COGNITO_REDIRECT_URI || 
        import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
        `${window.location.origin}/`;

      console.log('CognitoService: Exchanging authorization code for tokens', {
        domain: this.domain,
        clientId: this.clientId.substring(0, 10) + '...',
        redirectUri: finalRedirectUri,
        authCode: authCode.substring(0, 10) + '...'
      });

      const response = await fetch(`https://${this.domain}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          code: authCode,
          redirect_uri: finalRedirectUri,
        }),
      });

      console.log('CognitoService: Token exchange response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CognitoService: Token exchange failed:', errorText);
        
        // Parse and enhance error message
        let errorMessage = `Token exchange failed: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `${errorData.error}: ${errorData.error_description || 'No description provided'}`;
            
            if (errorData.error === 'invalid_grant') {
              errorMessage += '\n\nCommon causes:\n• Authorization code expired or already used\n• Redirect URI mismatch\n• Check that VITE_COGNITO_REDIRECT_URI matches Cognito App Client settings';
            } else if (errorData.error === 'invalid_client') {
              errorMessage += '\n\nCheck:\n• Client ID is correct\n• OAuth flows enabled in Cognito\n• Domain configuration is correct';
            }
          }
        } catch (parseError) {
          errorMessage += `\nRaw response: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const tokens = await response.json();
      console.log('CognitoService: Received tokens:', {
        access_token: tokens.access_token ? 'present' : 'missing',
        id_token: tokens.id_token ? 'present' : 'missing',
        refresh_token: tokens.refresh_token ? 'present' : 'missing'
      });
      
      // Store tokens (handles OAuth format automatically)
      this._storeTokens(tokens);
      
      // Extract user info from ID token and cache it
      if (tokens.id_token) {
        try {
          const userInfo = this._extractUserFromIdToken(tokens.id_token);
          localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
          console.log('CognitoService: User info extracted and cached');
        } catch (error) {
          console.warn('CognitoService: Failed to extract user info from ID token:', error);
        }
      }
      
      return {
        success: true,
        tokens: tokens
      };
    } catch (error) {
      console.error('CognitoService: Error in exchangeCodeForTokens:', error);
      throw error;
    }
  }

  // Extract user information from ID token
  _extractUserFromIdToken(idToken) {
    const payload = this._parseJWT(idToken);
    if (!payload) {
      throw new Error('Invalid ID token');
    }
    
    return {
      username: payload['cognito:username'] || payload.sub,
      userId: payload.sub,
      email: payload.email,
      attributes: {
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        'cognito:groups': payload['cognito:groups'] || [],
        'cognito:username': payload['cognito:username']
      },
      userStatus: 'CONFIRMED' // OAuth users are always confirmed
    };
  }

  // Build Cognito Hosted UI login URL
  buildLoginUrl(redirectUri = null, state = null) {
    if (!this.domain || !this.clientId) {
      throw new Error('Cognito domain and client ID must be configured');
    }
    
    const finalRedirectUri = redirectUri || 
      import.meta.env.VITE_COGNITO_REDIRECT_URI || 
      import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
      `${window.location.origin}/`;
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'email openid phone profile',
      redirect_uri: finalRedirectUri
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `https://${this.domain}/login?${params.toString()}`;
  }
}

const cognitoService = new CognitoService();
export default cognitoService;