import React, { useState } from 'react';
import { Dumbbell, Lock, Shield, User as UserIcon, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('owner@rkfitness.com');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(emailOrUser, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (userStr: string, passStr: string) => {
    setEmailOrUser(userStr);
    setPassword(passStr);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#0c1017] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#0099ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#00d284]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f1624] border border-[#22324b] rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-glow-blue text-white mb-4">
            <Dumbbell className="w-8 h-8 transform -rotate-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Rk Fitness World</h1>
          <p className="text-xs text-[#8e9db5] mt-1">Gym Management OS & Executive Dashboard</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8e9db5] mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="owner@rkfitness.com"
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8e9db5] mb-1.5">
              Password or Passcode PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying Account...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-[#22324b]">
          <div className="text-[11px] text-[#8e9db5] font-semibold mb-2.5 flex items-center justify-between">
            <span>Quick Demo Credentials:</span>
            <KeyRound className="w-3.5 h-3.5 text-[#0099ff]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('owner@rkfitness.com', 'admin123')}
              className="p-2.5 bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] rounded-xl text-left transition-colors"
            >
              <div className="text-xs font-bold text-white">Gym Owner</div>
              <div className="text-[10px] text-[#8e9db5] font-mono mt-0.5">admin123</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin', 'admin123')}
              className="p-2.5 bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] rounded-xl text-left transition-colors"
            >
              <div className="text-xs font-bold text-white">System Admin</div>
              <div className="text-[10px] text-[#8e9db5] font-mono mt-0.5">admin123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
