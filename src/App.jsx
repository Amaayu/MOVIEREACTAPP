import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Trending from './components/Trending';
import Home from './components/Home';
import Popular from './components/Popular';
import Movies from './components/ Movies';
import TVShows from './components/TVShows';
import People from './components/ People ';
import Logout from './components/Logout';
import Login from './components/Login';
import Register from './components/Register';
import About from './components/About';
import Contact from './components/Contact';
import Settings from './components/Settings';
import MovieDetail from './components/MovieDetail';
import Music from './components/Music';
import ProtectedRoute from './components/ProtectedRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import VerifyEmail from './components/VerifyEmail';
import VerifyEmailPending from './components/VerifyEmailPending';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

const App = () => {
  return (
    <>
      <PWAInstallPrompt />
      <OfflineIndicator />
      <PWAUpdatePrompt />
      <div className="w-screen h-screen bg-[#1F1E24] flex overflow-hidden overflow-x-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="//verify-email" element={<VerifyEmail />} /> {/* Handle double slash from old emails */}
          <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/popular"
            element={
              <ProtectedRoute>
                <Popular />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv-shows"
            element={
              <ProtectedRoute>
                <TVShows />
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <People />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/music"
            element={
              <ProtectedRoute>
                <Music />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default App;
