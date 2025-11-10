import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { authAPI } from '../utils/api';
import { FaEnvelope, FaLock, FaFilm } from 'react-icons/fa';
import { RiTvFill } from 'react-icons/ri';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await authAPI.login(formData);
      dispatch(loginSuccess(response.data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0917] to-[#1a1125] p-3 py-6 md:p-4">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-[#6556CD]/20 text-6xl hidden md:block">
        <FaFilm />
      </div>
      <div className="absolute bottom-10 right-10 text-[#6556CD]/20 text-6xl hidden md:block">
        <RiTvFill />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-4 md:mb-3">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-2 md:p-3 rounded-xl shadow-lg">
                <RiTvFill className="text-white text-2xl md:text-3xl" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                <span className="text-[#6556CD]">Movie</span>Hub
              </h1>
            </div>
          </Link>
          <p className="text-zinc-400 text-xs md:text-sm">Your Ultimate Entertainment Guide</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 md:p-5 shadow-2xl border border-[#6556CD]/20">
          <h2 className="text-lg md:text-xl font-bold text-white mb-0.5 text-center">Welcome Back</h2>
          <p className="text-zinc-400 text-xs text-center mb-2">Sign in to continue to MovieHub</p>

          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-2 md:mb-2">
              <label className="block text-zinc-300 mb-1 text-xs font-medium" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="text-zinc-500 text-sm" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 md:py-1.5 text-sm bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none focus:ring-2 focus:ring-[#6556CD]/50 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="mb-3 md:mb-2.5">
              <label className="block text-zinc-300 mb-1 text-xs font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-zinc-500 text-sm" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 md:py-1.5 text-sm bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none focus:ring-2 focus:ring-[#6556CD]/50 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-[#6556CD] hover:text-[#7561e0] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[#6556CD]/50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-3 md:mt-2.5 text-center">
            <p className="text-zinc-400 text-xs md:text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-[#6556CD] hover:text-[#9b8aff] font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-3 md:mt-6">
          © 2024 MovieHub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
