import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Automatically logout and redirect to login
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0d0917]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6556CD] mx-auto mb-4"></div>
        <p className="text-zinc-400">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
