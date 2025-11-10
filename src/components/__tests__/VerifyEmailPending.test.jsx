import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmailPending from '../VerifyEmailPending';
import api from '../../utils/api';

vi.mock('../../utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
const mockLocation = {
  state: { email: 'test@example.com' },
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe('VerifyEmailPending Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with email from location state', () => {
    render(
      <BrowserRouter>
        <VerifyEmailPending />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows instructions for email verification', () => {
    render(
      <BrowserRouter>
        <VerifyEmailPending />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/click the verification link in your email/i)).toBeInTheDocument();
    expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
    expect(screen.getByText(/the link will expire in 24 hours/i)).toBeInTheDocument();
  });

  it('successfully resends verification email', async () => {
    api.post.mockResolvedValue({
      data: { message: 'Verification email sent' },
    });

    render(
      <BrowserRouter>
        <VerifyEmailPending />
      </BrowserRouter>
    );
    
    const resendButton = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/resend-verification');
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  it('shows error when resend fails', async () => {
    api.post.mockRejectedValue({
      response: {
        data: { message: 'Failed to send email' },
      },
    });

    render(
      <BrowserRouter>
        <VerifyEmailPending />
      </BrowserRouter>
    );
    
    const resendButton = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send email/i)).toBeInTheDocument();
    });
  });

  it('has link back to login', () => {
    render(
      <BrowserRouter>
        <VerifyEmailPending />
      </BrowserRouter>
    );
    
    const loginLink = screen.getByText('Back to Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
