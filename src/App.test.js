import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from 'react-oidc-context';

// Mock the child components that use axios
jest.mock('./components/GenerateActivityForm', () => {
  return function MockGenerateActivityForm() {
    return <div>Generate Activity Form</div>;
  };
});

jest.mock('./components/HWHistory', () => {
  return function MockHWHistory() {
    return <div>HW History</div>;
  };
});

// Mock the useAuth hook
jest.mock('react-oidc-context', () => ({
  ...jest.requireActual('react-oidc-context'),
  useAuth: jest.fn(),
}));

const { useAuth } = require('react-oidc-context');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sign in button when not authenticated', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      error: null,
      signinRedirect: jest.fn(),
    });

    render(<App />);
    const signInButton = screen.getByText(/sign in/i);
    expect(signInButton).toBeInTheDocument();
  });

  test('renders loading state', () => {
    useAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      error: null,
    });

    render(<App />);
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders authenticated header and navigation when authenticated', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      error: null,
      user: {
        profile: {
          email: 'test@example.com',
        },
        access_token: 'mock-token',
      },
      removeUser: jest.fn(),
    });

    render(<App />);
    
    // Check for the authenticated header
    const headerElement = screen.getByText(/homeschool activity generator/i);
    expect(headerElement).toBeInTheDocument();
    
    // Check for user email
    const emailElement = screen.getByText(/hello, test@example.com/i);
    expect(emailElement).toBeInTheDocument();
    
    // Check for navigation buttons using role
    const buttons = screen.getAllByRole('button');
    const generateButton = buttons.find(btn => btn.textContent === 'Generate Activity');
    const historyButton = buttons.find(btn => btn.textContent === 'Activity History');
    expect(generateButton).toBeInTheDocument();
    expect(historyButton).toBeInTheDocument();
  });

  test('renders error message when authentication error occurs', () => {
    useAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      error: { message: 'Authentication failed' },
    });

    render(<App />);
    const errorElement = screen.getByText(/encountering error.*authentication failed/i);
    expect(errorElement).toBeInTheDocument();
  });
});
