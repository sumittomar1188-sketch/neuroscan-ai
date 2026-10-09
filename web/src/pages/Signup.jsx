import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Loader2 } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address (e.g. name@example.com)';
    return '';
  };

  const validatePasswords = (p, cp) => {
    if (!p) return 'Password is required';
    if (p.length < 8) return 'Password must be at least 8 characters';
    if (p !== cp) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    const emailErr = validateEmail(trimmedEmail);
    if (emailErr) { setEmailError(emailErr); return; }
    setEmailError('');

    const passErr = validatePasswords(password, confirmPassword);
    if (passErr) { setPasswordError(passErr); return; }
    setPasswordError('');

    const result = await signup(trimmedName, trimmedEmail, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const triggerGoogleSignup = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      const result = await googleLogin(tokenResponse.access_token);
      setGoogleLoading(false);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    },
    onError: (err) => {
      setGoogleLoading(false);
      if (err.error === 'popup_closed_by_user' || err.error === 'access_denied') {
        setError('Google sign-in was cancelled.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    },
  });

  const handleGoogleSignup = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in web/.env');
      return;
    }
    setError('');
    triggerGoogleSignup();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center mb-4">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm mt-1">Join NeuroScan AI today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-hidden transition-all text-sm"
              placeholder="Dr. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              onBlur={() => setEmailError(validateEmail(email))}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 outline-hidden transition-all text-sm ${
                emailError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="name@example.com"
            />
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 outline-hidden transition-all text-sm ${
                passwordError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="••••••••  (min 8 characters)"
            />
            {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError(''); }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-hidden transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold rounded-xl shadow-md shadow-yellow-600/25 transition-all text-sm mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between w-full">
          <hr className="w-full border-slate-200" />
          <span className="p-2 text-xs text-slate-400 font-medium">OR</span>
          <hr className="w-full border-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full mt-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? 'Signing up…' : 'Continue with Google'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
