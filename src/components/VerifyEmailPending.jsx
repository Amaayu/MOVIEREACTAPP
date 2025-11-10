import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { RiTvFill } from 'react-icons/ri';
import api from '../utils/api';

const VerifyEmailPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    setResending(true);
    setMessage('');
    
    try {
      await api.post('/auth/resend-verification');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0917] to-[#1a1125] p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-3 rounded-xl shadow-lg">
                <RiTvFill className="text-white text-3xl" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                <span className="text-[#6556CD]">Movie</span>Hub
              </h1>
            </div>
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-8 shadow-2xl border border-[#6556CD]/20">
          <div className="text-center">
            {/* Icon */}
            <div className="bg-[#6556CD]/20 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-[#6556CD] text-4xl" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">Verify Your Email</h2>
            
            {/* Description */}
            <p className="text-zinc-300 mb-2">
              We've sent a verification link to:
            </p>
            <p className="text-[#6556CD] font-semibold mb-6">
              {email}
            </p>

            {/* Instructions */}
            <div className="bg-[#0d0917]/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3 mb-3">
                <FaCheckCircle className="text-[#6556CD] mt-1 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">
                  Click the verification link in your email to activate your account
                </p>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <FaCheckCircle className="text-[#6556CD] mt-1 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">
                  Check your spam folder if you don't see the email
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-[#6556CD] mt-1 flex-shrink-0" />
                <p className="text-zinc-300 text-sm">
                  The link will expire in 24 hours
                </p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('sent') 
                  ? 'bg-green-500/20 border border-green-500 text-green-400' 
                  : 'bg-red-500/20 border border-red-500 text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Resend Button */}
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-3 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#6556CD]/50 mb-4"
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Sending...
                </span>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            {/* Back to Login */}
            <Link
              to="/login"
              className="text-zinc-400 hover:text-[#6556CD] text-sm transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-6">
          © 2024 MovieHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPending;
