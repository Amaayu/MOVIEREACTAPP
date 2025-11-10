import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from '../VerifyEmail';
import axios from 'axios';

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('token=valid-token')],
  };
});

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows verifying state initially', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Verifying Email')).toBeInTheDocument();
  });

  it('shows success message on successful verification', async () => {
    axios.get.mockResolvedValue({
      data: { message: 'Email verified successfully' },
    });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    });

    // Should redirect after 3 seconds
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 4000 });
  });

  it('shows error message on verification failure', async () => {
    axios.get.mockRejectedValue({
      response: {
        data: { message: 'Invalid or expired token' },
      },
    });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
    });
  });

  it('shows error when no token provided', async () => {
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams('')],
      };
    });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
  });
});
