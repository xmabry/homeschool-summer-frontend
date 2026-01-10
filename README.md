# Homeschool Summer Frontend

A React-based frontend application for logging and tracking homeschool summer learning activities. This application features various form input types and integrates with AWS API Gateway for backend services.

## Features

- 📝 **Multiple Input Types**:
  - Text inputs for student names
  - Dropdown selects for grade levels and subjects
  - Date picker for activity dates
  - Long text boxes (textareas) for detailed descriptions and learning goals

- ☁️ **AWS Integration**:
  - Configured to work with AWS API Gateway
  - Ready for deployment on AWS Amplify
  - Environment-based API endpoint configuration

- 🎨 **Modern UI**:
  - Responsive design for mobile and desktop
  - Clean, professional styling
  - User-friendly form validation
  - Success and error message displays

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- AWS account (for backend integration)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xmabry/homeschool-summer-frontend.git
cd homeschool-summer-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your AWS API Gateway endpoint:
```
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod
```

## Running Locally

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Building for Production

Create an optimized production build:
```bash
npm run build
```

The build files will be in the `build/` directory.

## Deploying to AWS Amplify

### Option 1: Using AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" > "Host web app"
3. Connect your GitHub repository
4. AWS Amplify will automatically detect the `amplify.yml` configuration
5. Add environment variables in the Amplify Console:
   - Key: `REACT_APP_API_ENDPOINT`
   - Value: Your API Gateway URL
6. Deploy!

### Option 2: Using Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

## AWS API Gateway Setup

Your backend API should have an endpoint that accepts POST requests at `/activities` with the following payload structure:

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

### CORS Configuration

Ensure your API Gateway has CORS enabled with the following headers:
- `Access-Control-Allow-Origin: *` (or your specific domain)
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
homeschool-summer-frontend/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── HomeschoolForm.js
│   │   └── HomeschoolForm.css
│   ├── App.js          # Main app component
│   ├── App.css         # App styles
│   └── index.js        # Entry point
├── amplify.yml         # AWS Amplify configuration
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

## Technologies Used

- **React** - Frontend framework
- **axios** - HTTP client for API calls
- **react-datepicker** - Date selection component
- **AWS Amplify** - Hosting platform
- **AWS API Gateway** - Backend API integration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
