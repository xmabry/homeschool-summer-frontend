import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from "react-oidc-context";



const cognitoAuthConfig = {
  authority: import.meta.env.REACT_APP_COGNITO_AUTHORITY,
  client_id: import.meta.env.REACT_APP_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || window.location.origin,
  response_type: "code",
  scope: "phone openid email",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

