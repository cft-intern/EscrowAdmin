import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, AlertCircle, KeyRound, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import adminService from '@/services/adminService';
import { useCategory } from '@/context/CategoryContext';
import { useAppDispatch } from '@/hooks/redux';
import { setTokens } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signup } = useCategory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMessage('');

    // Extract values from state or DOM fallback for browser autofill
    const domEmail = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || '';
    const domPassword = (document.querySelector('input[type="password"]') as HTMLInputElement)?.value || '';

    const activeEmail = (email || domEmail).trim();
    const activePassword = (password || domPassword).trim();

    if (!activeEmail) {
      setErrorMessage('Please enter your email address.');
      toast.error('Please enter your email address.');
      return;
    }

    if (!activePassword) {
      setErrorMessage('Please enter your password.');
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('API BASE URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('AUTH REQUEST: POST /admin/authenticate', { email: activeEmail });

      // Call authentication API
      const response = await adminService.authenticate({ email: activeEmail, password: activePassword });
      console.log('AUTH RESPONSE:', response);

      // Extract real token from response contract
      const realAccessToken =
        response?.token ||
        response?.accessToken ||
        response?.access_token ||
        response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.access_token;

      const realRefreshToken =
        response?.refreshToken ||
        response?.refresh_token ||
        response?.data?.refreshToken ||
        response?.data?.refresh_token ||
        '';

      if (!realAccessToken) {
        const errorMsg = response?.message || 'Authentication failed: No access token returned from server.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Update Redux state with real backend tokens
      dispatch(
        setTokens({
          accessToken: realAccessToken,
          refreshToken: realRefreshToken,
        })
      );

      // Sync user session in CategoryContext
      signup('Admin', activeEmail);

      toast.success('Admin authentication successful!');
      navigate('/categories');
    } catch (error: any) {
      console.error('Login error:', error);
      const rawMsg = error.response?.data?.message || error.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : typeof rawMsg === 'object' && rawMsg !== null
        ? JSON.stringify(rawMsg)
        : 'Login failed. Please check your credentials.';

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Branding Banner */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              ESCROW ADMIN PORTAL
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage categories, dynamic form schemas, and platform configuration.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-7 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Admin Sign In</h2>
            </div>
            <KeyRound className="h-5 w-5 text-indigo-400" />
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-9 h-10 text-sm bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 pr-10 h-10 text-sm bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 rounded-xl transition-all mt-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Admin Panel'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AdminSignupPage = AdminLoginPage;
export default AdminLoginPage;
