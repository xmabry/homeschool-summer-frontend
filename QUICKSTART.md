# Quick Start Guide

## Getting Started

This guide will help you get the Homeschool Summer Frontend application up and running quickly.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

### Required for AWS Cognito Authentication (Required)

The app now uses AWS Cognito for authentication. You must configure these environment variables:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure your AWS Cognito settings:
   
   **Note:** Some environment variables appear duplicated because different parts of the codebase use different naming conventions (react-oidc-context vs aws-amplify). All variables listed below are required.
   
   ```
   # AWS Cognito Configuration (Required)
   REACT_APP_COGNITO_USER_POOL_ID=your-user-pool-id
   REACT_APP_COGNITO_USER_POOL_CLIENT_ID=your-client-id
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_COGNITO_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com
   REACT_APP_LOGOUT_URI=http://localhost:3000
   
   # OIDC Configuration (Required for react-oidc-context)
   REACT_APP_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id
   REACT_APP_COGNITO_CLIENT_ID=your-client-id                # Same value as REACT_APP_COGNITO_USER_POOL_CLIENT_ID
   REACT_APP_COGNITO_REDIRECT_URI=http://localhost:3000
   
   # AWS Amplify Configuration (if using aws-amplify)
   REACT_APP_USER_POOL_ID=your-user-pool-id                  # Same value as REACT_APP_COGNITO_USER_POOL_ID
   REACT_APP_USER_POOL_WEB_CLIENT_ID=your-client-id          # Same value as REACT_APP_COGNITO_USER_POOL_CLIENT_ID
   REACT_APP_USER_POOL_DOMAIN=https://your-domain.auth.us-east-1.amazoncognito.com  # Same value as REACT_APP_COGNITO_DOMAIN
   
   # AWS API Gateway Configuration (Required)
   REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod
   REACT_APP_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com/prod        # Same value as REACT_APP_API_ENDPOINT
   ```

### Setting Up AWS Cognito

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Create a new User Pool
3. Note down your User Pool ID and User Pool Client ID
4. Configure the client app settings:
   - Enable "Username" and "Email" as sign-in options
   - Set password policy as needed
   - Disable MFA for development (optional)

If you skip Cognito configuration, the app will not function as authentication is required.

## Step 3: Run the Development Server

```bash
npm start
```

The application will automatically open in your browser at [http://localhost:3000](http://localhost:3000)

**Note:** The app now has a login page. Authentication is handled by AWS Cognito in both development and production, so you must log in using a valid user from your configured Cognito User Pool; arbitrary usernames and passwords will not work.

## Application Features

### Login System
- AWS Cognito-powered authentication
- Secure user sessions
- Automatic logout functionality

### Activity Generator Form
- **Grade Level Selection:** Kindergarten through 12th grade
- **Subject Areas:** Math, Science, English/Language Arts, History, Art, Music, PE, Coding, and Foreign Language  
- **Multi-Select Skills:** Choose multiple learning objectives like Critical Thinking, Problem Solving, Creativity, etc.
- **Activity Date:** Date picker for when the activity took place
- **Custom Prompts:** Detailed description for AI-powered activity generation
- **Real-time Validation:** Form validation and error handling

## Step 4: Build for Production

When you're ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deploying to AWS Amplify

### Method 1: AWS Amplify Console (Recommended)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Amplify will auto-detect the `amplify.yml` configuration
5. Add environment variables:
   - Key: `REACT_APP_COGNITO_USER_POOL_ID`, Value: Your User Pool ID
   - Key: `REACT_APP_COGNITO_USER_POOL_CLIENT_ID`, Value: Your Client ID
   - Key: `REACT_APP_AWS_REGION`, Value: Your AWS Region (e.g., us-east-1)
   - Key: `REACT_APP_COGNITO_DOMAIN`, Value: Your Cognito Domain (e.g., https://your-domain.auth.us-east-1.amazoncognito.com)
   - Key: `REACT_APP_LOGOUT_URI`, Value: Your App URL (e.g., https://your-app.amplifyapp.com)
   - Key: `REACT_APP_COGNITO_AUTHORITY`, Value: Your OIDC Authority (e.g., https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id)
   - Key: `REACT_APP_COGNITO_CLIENT_ID`, Value: Your Client ID
   - Key: `REACT_APP_COGNITO_REDIRECT_URI`, Value: Your App URL (e.g., https://your-app.amplifyapp.com)
   - Key: `REACT_APP_USER_POOL_ID`, Value: Your User Pool ID
   - Key: `REACT_APP_USER_POOL_WEB_CLIENT_ID`, Value: Your Client ID
   - Key: `REACT_APP_USER_POOL_DOMAIN`, Value: Your Cognito Domain
   - Key: `REACT_APP_API_ENDPOINT`, Value: Your API Gateway URL
   - Key: `REACT_APP_API_GATEWAY_URL`, Value: Your API Gateway URL
6. Click "Save and deploy"

### Method 2: Amplify CLI

```bash
# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Initialize Amplify in your project
amplify init

# Add hosting
amplify add hosting

# Publish your app
amplify publish
```

## Backend API Requirements

Your AWS API Gateway should have:

- **Endpoint:** `/generate-hw` (updated from `/activities`)
- **Method:** POST
- **CORS enabled** with appropriate headers
- **Authentication:** Integrate with AWS Cognito for secure API access
- **Expected payload:**
  ```json
  {
    "gradeLevel": "string (e.g., 'kindergarten', '1st', '2nd', etc.)",
    "subject": "string (e.g., 'math', 'science', 'english', etc.)",
    "activityDate": "ISO 8601 date string",
    "prompt": "string (detailed activity description)",
    "skills": ["array", "of", "selected", "skills"],
    "timestamp": "ISO 8601 date string (auto-generated)"
  }
  ```

## Current Dependencies

The application now includes:

- **Authentication:** `aws-amplify`, `@aws-amplify/ui-react`
- **HTTP Requests:** `axios`
- **Date Handling:** `react-datepicker` 
- **UI Components:** React 19.2.3
- **Testing:** Latest React Testing Library

## Troubleshooting

### Authentication Issues
- Verify your Cognito User Pool ID and Client ID are correct
- Ensure the AWS region matches your Cognito setup
- Check that your Cognito app client has the correct configuration

### Build warnings about date-fns
This is a known warning from the react-datepicker dependency and can be safely ignored.

### API connection errors
- Check that your `REACT_APP_API_ENDPOINT` is correctly set
- Verify CORS is enabled on your API Gateway
- Check browser console for detailed error messages

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Open an issue on GitHub for bugs or questions
