import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaStar, FaCheckCircle, FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../components/ui/Logo';
import { useAuthStore } from '../store/authStore';

const Signin = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading, error, initializeAuth, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSocialLogin = (provider) => {
    // For now, just show an alert
    alert(`${provider} login coming soon!`);
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden">
      {/* Left side (Brand / Illustration) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 h-screen bg-gradient-to-br from-[#0e0e14] to-[#1a1a2e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/15 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-md px-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 logo-badge rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold">Y</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Yaksh</span>
          </h1>
          <p className="soft text-lg leading-relaxed">
            Learn, grow, and achieve milestones — all in one platform.
            Unlock badges, complete courses, and showcase your learning journey.
          </p>

          {/* Icons */}
          <div className="mt-12 flex justify-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <FaBook className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <FaStar className="w-8 h-8 text-purple-400" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <FaCheckCircle className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side (Scrollable Login Form) */}
      <div className="flex flex-col w-full lg:w-1/2 bg-gradient-to-b from-[var(--bg-1)] to-[var(--bg-2)] px-8 sm:px-16 pt-4 lg:pt-12 overflow-y-auto h-screen relative grid-texture">
        <div className="w-full max-w-md mx-auto space-y-6 pb-10">
          {/* Brand */}
          <div className="flex items-center mb-4">
            <Logo />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">Welcome Back 👋</h2>
            <p className="muted text-sm mt-2">Sign in to continue your learning journey</p>
          </div>

          {/* Alert */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium soft mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium soft mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FaEye className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4 text-gray-400" />
                  ) : (
                    <FaEye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
              <div className="text-right mt-2">
                <Link href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-white/10"></div>
            <span className="mx-4 text-sm muted">or continue with</span>
            <div className="flex-grow h-px bg-white/10"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="social-btn flex items-center justify-center rounded-xl p-3 w-14 h-14"
              disabled={isLoading}
            >
              <FaGoogle className="w-6 h-6 text-red-400" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="social-btn flex items-center justify-center rounded-xl p-3 w-14 h-14"
              disabled={isLoading}
            >
              <FaGithub className="w-6 h-6 text-white" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              className="social-btn flex items-center justify-center rounded-xl p-3 w-14 h-14"
              disabled={isLoading}
            >
              <FaLinkedin className="w-6 h-6 text-blue-400" />
            </button>
          </div>

          {/* Sign Up */}
          <p className="text-center text-sm muted mt-6">
            Don't have an account?
            <Link to="/signup" className="text-indigo-400 font-medium hover:text-indigo-300 transition ml-1">
              Sign Up
            </Link>
          </p>

          {/* Footer */}
          <div className="text-center text-xs muted pt-8 pb-4">
            © 2025 Yaksh. Developed by FOSSEE group, IIT Bombay
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
