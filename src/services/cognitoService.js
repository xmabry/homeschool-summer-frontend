import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

// Configure Amplify with your Cognito settings
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    }
  }
});

class CognitoService {
  // Sign in user
  async signIn(username, password) {
    try {
      const user = await signIn({
        username,
        password
      });
      return { success: true, user };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign up new user
  async signUp(username, password, email) {
    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      return { success: true, result };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  }

  // Confirm sign up with verification code
  async confirmSignUp(username, confirmationCode) {
    try {
      await confirmSignUp({
        username,
        confirmationCode
      });
      return { success: true };
    } catch (error) {
      console.error('Error confirming sign up:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Resend confirmation code
  async resendConfirmationCode(username) {
    try {
      await resendSignUpCode({ username });
      return { success: true };
    } catch (error) {
      console.error('Error resending code:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CognitoService();