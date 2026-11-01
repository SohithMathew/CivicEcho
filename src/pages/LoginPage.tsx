import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  RefreshCw,
  Loader2,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { civicApi } from '../services/api';
import { User as UserType } from '../types';
import { detectRealLocation } from '../services/locationService';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
  defaultRole?: 'citizen' | 'admin';
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  defaultRole,
  onBackToLanding
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'citizen' | 'admin'>(defaultRole || 'citizen');
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

  // Real GPS detection for citizen registration
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
      console.warn('GPS detection:', err);
      setLocationStatus(err?.message || 'GPS access unavailable');
      setAllowManualLocalityEdit(true);
    } finally {
      setDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (mode === 'register' && role === 'citizen' && !neighborhood) {
      detectLocation();
    }
  }, [mode, role]);


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
          setErrorMsg('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (!confirmPassword) {
          setErrorMsg('Please confirm your password');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match');
          setLoading(false);
          return;
        }
        if (role === 'citizen' && !neighborhood.trim()) {
          setErrorMsg('Please specify your locality or allow GPS detection');
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
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail ||
          'Authentication failed. Please verify your credentials and selected role.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen w-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Subtle Ambient Background Lighting */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-50/60 via-slate-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-400/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header / Back Link */}
      <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        {onBackToLanding ? (
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/60 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">CivicEcho</span>
        </div>
      </header>

      {/* Main Elegant Card Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          
          {/* Brand & Heading */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/60 mb-2 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {mode === 'login'
                ? 'Sign in to access real-time civic triage, hazard reports, and municipal dispatches.'
                : 'Join CivicEcho to report local infrastructure defects and track public works.'}
            </p>
          </div>

          {/* Role Segmented Pill Switcher */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/70">
            <button
              type="button"
              onClick={() => {
                setRole('citizen');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'citizen'
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Citizen Resident</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Municipal Staff</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 pb-2.5 font-semibold text-center transition-all border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-teal-600 text-teal-800'
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
              }}
              className={`flex-1 pb-2.5 font-semibold text-center transition-all border-b-2 cursor-pointer ${
                mode === 'register'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>


          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Nair"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your account password'}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full bg-white border rounded-xl pl-9 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none font-mono transition-all text-xs ${
                      passwordsMismatch
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : passwordsMatch
                        ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'View password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* GPS Location for Citizen Register */}
            {mode === 'register' && role === 'citizen' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">
                    Locality / Ward <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3 h-3 ${detectingLocation ? 'animate-spin' : ''}`} />
                    <span>{detectingLocation ? 'Locating...' : 'Detect GPS'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Detected Position</span>
                    </div>
                    {detectedCoords && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {detectedCoords.lat.toFixed(4)}°, {detectedCoords.lng.toFixed(4)}°
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-900">
                    {detectingLocation ? (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        Detecting your accurate device position...
                      </span>
                    ) : (
                      neighborhood || 'Click Detect GPS or specify your ward'
                    )}
                  </div>

                  {locationStatus && (
                    <p className="text-[10px] text-slate-500">{locationStatus}</p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                    <span>Used for local ward complaint routing</span>
                    <button
                      type="button"
                      onClick={() => setAllowManualLocalityEdit(!allowManualLocalityEdit)}
                      className="text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
                    >
                      {allowManualLocalityEdit ? 'Done editing' : 'Edit address'}
                    </button>
                  </div>

                  {allowManualLocalityEdit && (
                    <div className="pt-1">
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
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Department / Authority <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Public Works Department (PWD)"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-xs"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98470 12345"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? `Sign In as ${role === 'admin' ? 'Municipal Staff' : 'Citizen'}`
                      : `Create ${role === 'admin' ? 'Staff' : 'Citizen'} Account`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Prompt */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer ml-0.5"
                >
                  Create one
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
                  className="font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer ml-0.5"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Elegant, Minimalist Footer */}
      <footer className="relative z-10 max-w-md w-full mx-auto text-center pt-6 text-[11px] text-slate-400">
        <span>CivicEcho Municipal Intelligence Platform · Secure Official Node</span>
      </footer>
    </div>
  );
};

export default LoginPage;
