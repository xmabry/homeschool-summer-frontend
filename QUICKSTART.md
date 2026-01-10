# Quick Start Guide

## Getting Started

This guide will help you get the Homeschool Summer Frontend application up and running quickly.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure AWS API Gateway (Optional)

If you want to connect to an AWS API Gateway backend:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API Gateway endpoint:
   ```
   REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod
   ```

If you skip this step, the app will still work but will show an error message when you try to submit the form.

## Step 3: Run the Development Server

```bash
npm start
```

The application will automatically open in your browser at [http://localhost:3000](http://localhost:3000)

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
5. Add environment variable:
   - Key: `REACT_APP_API_ENDPOINT`
   - Value: Your API Gateway URL
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

- **Endpoint:** `/activities`
- **Method:** POST
- **CORS enabled** with appropriate headers
- **Expected payload:**
  ```json
  {
    "studentName": "string",
    "gradeLevel": "string",
    "subject": "string",
    "activityDate": "ISO 8601 date string",
    "description": "string",
    "learningGoals": "string",
    "timestamp": "ISO 8601 date string"
  }
  ```

## Troubleshooting

### Build warnings about date-fns
This is a known warning from the react-datepicker dependency and can be safely ignored.

### API connection errors
- Check that your `REACT_APP_API_ENDPOINT` is correctly set
- Verify CORS is enabled on your API Gateway
- Check browser console for detailed error messages

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Open an issue on GitHub for bugs or questions
