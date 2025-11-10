import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const EmailVerificationBanner = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  if (!user || user.isEmailVerified || !showBanner) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/resend-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend email');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Please verify your email address to access all features.</span>
        </div>
        
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm">{message}</span>
          )}
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 text-sm font-medium"
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-black hover:text-gray-700 transition"
            aria-label="Close banner"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
