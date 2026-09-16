import React from 'react';
import { UserPlus, CreditCard, MessageSquare, ArrowUpRight, Activity } from 'lucide-react';
import { useGym } from '../../context/GymContext';

export const RecentActivity: React.FC = () => {
  const { activities } = useGym();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'join': return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-[#0099ff]" />;
      case 'enquiry': return <MessageSquare className="w-4 h-4 text-amber-400" />;
      default: return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  const getBg = (type?: string) => {
    switch (type) {
      case 'join': return 'bg-emerald-500/15 border-emerald-500/30';
      case 'payment': return 'bg-[#0099ff]/15 border-[#0099ff]/30';
      case 'enquiry': return 'bg-amber-500/15 border-amber-500/30';
      default: return 'bg-purple-500/15 border-purple-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#22324b] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">Recent Activity Stream</h3>
            <p className="text-xs text-[#8e9db5] mt-0.5">Real-time log of joinings, payments & enquiries</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
        </div>

        <div className="space-y-3 mt-4">
          {activities.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[#0f1624] border border-[#22324b] rounded-xl flex items-center justify-between hover:border-[#2d4160] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${getBg(item.iconType)} border flex items-center justify-center shrink-0`}>
                  {getIcon(item.iconType)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{item.memberName}</div>
                  <div className="text-[11px] text-[#8e9db5] font-medium capitalize mt-0.5">{item.detail}</div>
                </div>
              </div>
              <div className="text-[10px] text-[#8e9db5] font-mono shrink-0">{item.timeAgo}</div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-xs text-[#8e9db5]">No recent activities logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
