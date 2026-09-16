import React from 'react';
import { Bell, MessageSquare, RefreshCw } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import type { Member } from '../../types';

interface MemberAlertsProps {
  onSelectMember: (member: Member) => void;
}

export const MemberAlerts: React.FC<MemberAlertsProps> = ({ onSelectMember }) => {
  const { members, profile } = useGym();

  const expiredMembers = members.filter((m) => m.status === 'Expired');

  const handleSendWhatsApp = (e: React.MouseEvent, m: Member) => {
    e.stopPropagation();
    const cleanPhone = m.phone.replace(/[^0-9]/g, '');
    let template = profile.whatsappReminderTemplate || 'Hello {NAME}, your membership for {PLAN} at Rk Fitness World has expired on {EXPIRY}. Please renew soon!';
    template = template
      .replace('{NAME}', m.name)
      .replace('{PLAN}', m.plan)
      .replace('{EXPIRY}', m.expiryDate);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Expiring Members</h2>
            <p className="text-xs text-[#8e9db5]">Members whose membership has expired and need renewal</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {expiredMembers.length} Expired
        </span>
      </div>

      {/* Member Alerts Table */}
      <div className="glass-card rounded-2xl border border-[#22324b] overflow-hidden">
        {expiredMembers.length === 0 ? (
          <div className="p-12 text-center text-[#8e9db5] text-xs">
            🎉 All member memberships are currently active!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1624] border-b border-[#22324b] text-[#8e9db5] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Expired Member</th>
                  <th className="py-3.5 px-5">Plan</th>
                  <th className="py-3.5 px-5">Days Left</th>
                  <th className="py-3.5 px-5">Join Date</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22324b]">
                {expiredMembers.map((m) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const expDate = new Date(m.expiryDate);
                  expDate.setHours(0, 0, 0, 0);
                  const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

                  return (
                    <tr
                      key={m.id}
                      onClick={() => onSelectMember(m)}
                      className="hover:bg-[#1c2a42]/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold flex items-center justify-center text-xs">
                            {m.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{m.name}</span>
                              {m.appNumber && (
                                <span className="text-[10px] font-mono text-[#8e9db5] px-1.5 py-0.5 rounded bg-[#0f1624]">
                                  {m.appNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[#8e9db5] text-[11px] font-mono">{m.phone}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Expired ({Math.abs(daysLeft)}d ago)
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-white capitalize">{m.plan}</div>
                        <div className="text-[#8e9db5] text-[10px]">{m.type} Member</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {daysLeft === 0 ? 'Expires Today' : `Expired (${Math.abs(daysLeft)}d ago)`}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-[#8e9db5] font-mono">{m.joinDate}</td>
                      <td className="py-3.5 px-5 font-mono font-extrabold text-rose-400">{m.expiryDate}</td>

                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Expired
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleSendWhatsApp(e, m)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Send WhatsApp</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMember(m);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#0099ff] hover:bg-blue-600 text-white font-bold text-xs shadow-glow-blue flex items-center gap-1.5 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Renew</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
