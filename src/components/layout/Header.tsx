import React, { useState, useEffect } from 'react';
import { Search, Plus, User as UserIcon, Clock, LogOut } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  onOpenAddMember: () => void;
  onOpenAddEnquiry: () => void;
  onOpenAddPayment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenAddMember,
  onOpenAddEnquiry
}) => {
  const { profile } = useGym();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'members': return 'Members List';
      case 'enquiries': return 'Inquiries & Leads';
      case 'alerts': return 'Expiring Members';
      case 'finance': return 'Payments & Income';
      case 'expenses': return 'Expenses';
      case 'staff': return 'Staff & Trainers';
      case 'database': return 'Database Backup';
      case 'reports': return 'Reports & Analytics';
      case 'settings': return 'Plans & Settings';
      default: return 'Dashboard';
    }
  };

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="h-20 bg-[#0f1624]/80 backdrop-blur-md border-b border-[#22324b] px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>{getTitle()}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#0099ff]/15 text-[#0099ff] border border-[#0099ff]/30">
            {profile.name}
          </span>
        </h1>
        <div className="flex items-center gap-2 text-xs text-[#8e9db5] mt-0.5 font-medium">
          <span>{formattedDate}</span>
          <span className="text-[#22324b]">•</span>
          <span className="text-cyan-400 font-mono font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#162032] border border-[#22324b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff] transition-all"
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddMember}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>

          <button
            onClick={onOpenAddEnquiry}
            className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-[#8e9db5] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-[#0099ff]" />
            <span>Add Inquiry</span>
          </button>
        </div>

        {/* Active User Badge & Sign Out Button */}
        <div className="pl-3 border-l border-[#22324b] flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name || 'Active User'}</div>
            <div className="text-[10px] text-cyan-400 font-mono">@{user?.username || 'user'}</div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all"
            title="Switch User / Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
