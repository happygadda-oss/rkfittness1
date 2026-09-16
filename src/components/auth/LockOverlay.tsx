import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LockOverlay: React.FC = () => {
  const { user, unlockSession, logout } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsSubmitting(true);

    try {
      const ok = await unlockSession(pinInput);
      if (!ok) {
        setError(true);
        setPinInput('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1017]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-[#0f1624] border border-[#22324b] rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white">Session Locked</h2>
        <p className="text-xs text-[#8e9db5] mt-1">
          Enter passcode for <span className="text-white font-bold">{user?.name || 'RK Admin'}</span>
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Incorrect passcode. Please try again.</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <input
            type="password"
            autoFocus
            required
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter passcode (e.g. admin123)"
            className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-4 py-3 text-center text-sm font-mono text-white placeholder-[#8e9db5] focus:outline-none focus:border-amber-400 transition-all"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <button
          onClick={logout}
          className="mt-6 text-xs text-[#8e9db5] hover:text-white transition-colors"
        >
          Sign out as {user?.username}
        </button>
      </div>
    </div>
  );
};
