import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  CreditCard,
  Receipt,
  UserCheck,
  Settings,
  Dumbbell,
  ShieldCheck,
  Database,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'members' 
  | 'enquiries' 
  | 'alerts' 
  | 'finance' 
  | 'expenses' 
  | 'staff' 
  | 'database'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profile, members } = useGym();
  const { user, logout } = useAuth();

  const expiringCount = members.filter((m) => m.status === 'Expired').length;

  const sections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'MEMBERS & LEADS',
      items: [
        { id: 'members', label: 'Members', icon: Users },
        { id: 'enquiries', label: 'Inquiries & Leads', icon: MessageSquare },
        { id: 'alerts', label: 'Expiring Members', icon: Bell, badge: expiringCount > 0 ? expiringCount : undefined }
      ]
    },
    {
      title: 'MONEY & STAFF',
      items: [
        { id: 'finance', label: 'Payments', icon: CreditCard },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'staff', label: 'Staff & Trainers', icon: UserCheck }
      ]
    },
    {
      title: 'REPORTS & BACKUP',
      items: [
        { id: 'database', label: 'Database Backup', icon: Database },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Plans & Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0f1624] border-r border-[#22324b] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#22324b]">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-blue text-white">
              <Dumbbell className="w-5 h-5 transform -rotate-12" />
            </div>
            <div>
              <span className="text-[#0099ff] font-extrabold text-base tracking-tight leading-none block">Rk Fitness World</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8e9db5] block font-semibold mt-0.5">Gym Manager</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#162032] rounded-xl border border-[#22324b]">
            <div className="text-[11px] font-semibold text-[#8e9db5] uppercase tracking-wider">Gym Name</div>
            <div className="text-white font-bold text-sm tracking-wide mt-0.5 truncate">{profile.name}</div>
            <div className="text-[11px] text-[#0099ff] font-mono mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>CODE: {profile.code}</span>
            </div>
          </div>
        </div>

        {/* Categorized Menu Sections */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8e9db5]">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-[#0099ff]/15 text-[#0099ff] border border-[#0099ff]/30 shadow-glow-blue font-bold'
                        : 'text-[#8e9db5] hover:text-white hover:bg-[#162032]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0099ff]' : 'text-[#8e9db5]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#22324b] bg-[#0c1017]">
        <div className="p-3 bg-[#162032] rounded-xl border border-[#22324b] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'RK'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'RK Owner'}</div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-mono font-semibold">@{user?.username || 'user'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-all shrink-0"
            title="Sign Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
