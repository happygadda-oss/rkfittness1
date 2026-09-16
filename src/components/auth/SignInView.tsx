import React, { useState } from 'react';
import {
  Dumbbell,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  AlertCircle,
  Database,
  CheckCircle2,
  Users,
  UserPlus,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SignInView: React.FC = () => {
  const { users, login, signUp, quickLogin } = useAuth();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(users.length === 0 ? 'signup' : 'signin');

  // Sign In Form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await login(loginUsername.trim(), loginPassword);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Sign in failed. Check credentials.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpUsername.trim() || !signUpPassword) {
      setErrorMsg('Username and password are required.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await signUp({
      name: signUpName || `${signUpUsername} Gym`,
      username: signUpUsername,
      email: signUpEmail,
      password: signUpPassword
    });

    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Account created successfully! Credentials synced to Supabase gym_users server.');
    } else {
      setErrorMsg(res.error || 'Sign up failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0099ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0099ff] to-cyan-400 flex items-center justify-center shadow-glow-blue text-white">
            <Dumbbell className="w-6 h-6 transform -rotate-12" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0099ff] tracking-tight leading-none">Rk Fitness World</h1>
            <p className="text-[11px] uppercase tracking-widest text-[#8e9db5] font-semibold mt-0.5">Isolated Multi-Tenant Gym Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#0f1624] border border-[#22324b] px-3.5 py-1.5 rounded-full text-xs text-[#8e9db5] font-mono">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>{users.length} / 4 Accounts Registered</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 z-10 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Isolated User Workspaces
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {authMode === 'signup' ? 'Create Custom Account' : 'Sign In to Your Workspace'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8e9db5]">
            Create up to 4 custom user accounts. Accounts & passcodes sync automatically to the admin Supabase <code className="text-cyan-400">gym_users</code> database.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="bg-[#0f1624] border border-[#22324b] p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                authMode === 'signin'
                  ? 'bg-[#0099ff] text-white shadow-glow-blue'
                  : 'text-[#8e9db5] hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In ({users.length})</span>
            </button>

            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              disabled={users.length >= 4}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 ${
                authMode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                  : 'text-[#8e9db5] hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account (Sign Up)</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-[#22324b] space-y-5">
          <div className="flex items-center justify-between border-b border-[#22324b] pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base">
                {authMode === 'signup' ? 'New Account Registration' : 'Account Credentials'}
              </h3>
              <p className="text-xs text-[#8e9db5]">
                {authMode === 'signup' ? 'Set custom username & password' : 'Enter your custom credentials'}
              </p>
            </div>
            {authMode === 'signup' ? <UserPlus className="w-5 h-5 text-emerald-400" /> : <ShieldCheck className="w-5 h-5 text-[#0099ff]" />}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Username or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0099ff] to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-extrabold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Gym / User Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. RK Fitness World - Main Branch"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Choose Username *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. rk_owner1"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="owner@rkfitness.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Set Account Password *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || users.length >= 4}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-glow-green flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Sync to Supabase'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-[#22324b] text-center">
            <div className="text-[11px] text-[#8e9db5] flex items-center justify-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Synced with <code className="text-cyan-300">gym_users</code> Supabase table</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-[#8e9db5] z-10 pt-4">
        Rk Fitness World Gym Management &copy; {new Date().getFullYear()} — Multi-Tenant Architecture
      </div>
    </div>
  );
};
