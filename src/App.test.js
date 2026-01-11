import { render, screen } from '@testing-library/react';
import App from './App';

test('renders homeschool summer activity log', () => {
  render(<App />);
  const headingElement = screen.getByText(/homeschool summer activity log/i);
  expect(headingElement).toBeInTheDocument();
});
