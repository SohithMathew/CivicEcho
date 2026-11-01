import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Lock,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  RefreshCw
} from 'lucide-react';
import { civicApi } from '../services/api';
import { User as UserType } from '../types';
import { detectRealLocation } from '../services/locationService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'register';
  forcedRole?: 'citizen' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  forcedRole
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'citizen' | 'admin'>(forcedRole || 'citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-detection of location for citizen accounts using real GPS
  const [neighborhood, setNeighborhood] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [allowManualLocalityEdit, setAllowManualLocalityEdit] = useState(false);

  const detectLocation = async () => {
    setDetectingLocation(true);
    setLocationStatus('Accessing device GPS...');
    setErrorMsg(null);

    try {
      const result = await detectRealLocation();
      setDetectedCoords({ lat: result.latitude, lng: result.longitude });
      setNeighborhood(result.locationName);
      setLocationStatus('Real GPS location detected');
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      setLocationStatus(err?.message || 'GPS access unavailable');
      setAllowManualLocalityEdit(true);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Trigger location auto-detection automatically when register mode for citizen is active
  useEffect(() => {
    if (isOpen && mode === 'register' && role === 'citizen' && !neighborhood) {
      detectLocation();
    }
  }, [isOpen, mode, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          setErrorMsg('Please enter your email address');
          setLoading(false);
          return;
        }
        if (!password) {
          setErrorMsg('Please enter your password');
          setLoading(false);
          return;
        }

        const res = await civicApi.login({
          email: email.trim(),
          password,
          role
        });
        onLoginSuccess(res.user);
        onClose();
      } else {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMsg('Please enter a valid email address');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setErrorMsg('Password must be at least 6 characters in length');
          setLoading(false);
          return;
        }
        if (!confirmPassword) {
          setErrorMsg('Please re-type your password to confirm');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match. Please verify your re-typed password.');
          setLoading(false);
          return;
        }
        if (role === 'citizen' && !neighborhood.trim()) {
          setErrorMsg('Please specify your locality or allow GPS detection.');
          setLoading(false);
          return;
        }
        if (role === 'admin' && !department.trim()) {
          setErrorMsg('Please enter your municipal department');
          setLoading(false);
          return;
        }

        const res = await civicApi.register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          neighborhood: role === 'citizen' ? neighborhood.trim() : undefined,
          department: role === 'admin' ? department.trim() : undefined,
          role
        } as any);

        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs ${
              role === 'admin'
                ? 'bg-purple-100 border border-purple-200 text-purple-700'
                : 'bg-teal-100 border border-teal-200 text-teal-700'
            }`}
          >
            {role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === 'login'
              ? role === 'admin'
                ? 'Municipal Staff Portal'
                : 'Sign In to CivicEcho'
              : role === 'admin'
              ? 'Register Staff Account'
              : 'Create Citizen Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Enter your account details to access your dashboard'
              : role === 'citizen'
              ? 'Create your resident profile to report and track neighborhood issues'
              : 'Register authorized municipal personnel'}
          </p>
        </div>

        {/* Role Selector: Citizen vs Municipal Staff */}
        <div className="mb-4 p-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center">
          <button
            type="button"
            onClick={() => {
              setRole('citizen');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'citizen'
                ? 'bg-white text-teal-700 border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-purple-700 border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Municipal Staff</span>
          </button>
        </div>

        {/* Mode Switch (Sign In vs Register) */}
        <div className="flex items-center border-b border-slate-200 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 font-semibold text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'login'
                ? role === 'admin'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setPassword('');
              setConfirmPassword('');
              setErrorMsg(null);
              if (role === 'citizen') detectLocation();
            }}
            className={`flex-1 py-2 font-semibold text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'register'
                ? role === 'admin'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Full Name <span className="text-teal-600 font-bold">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Email Address <span className="text-teal-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-slate-700">
                {mode === 'register' ? 'Password (min. 6 characters)' : 'Password'}{' '}
                <span className="text-teal-600 font-bold">*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Create a secure password' : 'Enter your password'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'View password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Re-type Password Field during registration */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700">
                  Re-type Password <span className="text-teal-600 font-bold">*</span>
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password to confirm"
                  className={`w-full bg-slate-50 border rounded-lg pl-9 pr-10 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white font-mono transition-colors ${
                    passwordsMismatch
                      ? 'border-rose-400 bg-rose-50'
                      : passwordsMatch
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 focus:border-teal-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors p-1 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'View password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordsMatch && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords match</span>
                </div>
              )}
              {passwordsMismatch && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>
          )}

          {/* CITIZEN LOCATION: ACCURATE REAL GPS */}
          {mode === 'register' && role === 'citizen' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-medium text-slate-700">
                  Locality / Neighborhood <span className="text-teal-600 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${detectingLocation ? 'animate-spin' : ''}`} />
                  <span>{detectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Current Location
                    </span>
                  </div>
                  {detectedCoords && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {detectedCoords.lat.toFixed(4)}°, {detectedCoords.lng.toFixed(4)}°
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900">
                    {detectingLocation ? 'Detecting current GPS location...' : neighborhood || 'Detecting locality...'}
                  </span>
                </div>

                {locationStatus && (
                  <p className="text-[10px] text-slate-500">{locationStatus}</p>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Used for local ward service dispatch</span>
                  <button
                    type="button"
                    onClick={() => setAllowManualLocalityEdit(!allowManualLocalityEdit)}
                    className="text-teal-700 hover:text-teal-900 underline cursor-pointer"
                  >
                    {allowManualLocalityEdit ? 'Done editing' : 'Edit manually'}
                  </button>
                </div>

                {allowManualLocalityEdit && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Enter your street or neighborhood"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'register' && role === 'admin' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Department / Authority <span className="text-purple-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Public Works Department"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
              role === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : role === 'admin'
                ? 'Create Staff Account'
                : 'Create Citizen Account'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
