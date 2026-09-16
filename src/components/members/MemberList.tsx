import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Eye,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer
} from 'lucide-react';
import type { Member } from '../../types';
import { useGym } from '../../context/GymContext';

interface MemberListProps {
  onOpenAddModal: () => void;
  onSelectMember: (member: Member) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  onOpenAddModal,
  onSelectMember
}) => {
  const { members, profile } = useGym();

  const handlePrintMemberList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const gymName = profile.name || 'Rk Fitness World';
    printWindow.document.write(`
      <html>
        <head>
          <title>Members List - ${gymName}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            h2 { color: #0284c7; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>${gymName} - Members Directory</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Plan</th><th>Days Left</th><th>Join Date</th><th>Expiry Date</th><th>Status</th><th>Paid</th></tr>
            </thead>
            <tbody>
              ${filteredMembers.map(m => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const exp = new Date(m.expiryDate);
                exp.setHours(0, 0, 0, 0);
                const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const daysText = diff > 0 ? `${diff} days left` : diff === 0 ? 'Expires today' : `Expired (${Math.abs(diff)}d ago)`;
                return `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.phone}</td>
                  <td>${m.plan}</td>
                  <td><strong>${daysText}</strong></td>
                  <td>${m.joinDate}</td>
                  <td>${m.expiryDate}</td>
                  <td>${m.status}</td>
                  <td>₹${m.amountPaid}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query) ||
        (m.email && m.email.toLowerCase().includes(query)) ||
        (m.appNumber && m.appNumber.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'trial'
          ? m.type === 'Trial'
          : m.status.toLowerCase() === statusFilter.toLowerCase();

      // Duration calculation filter (1M, 3M, 6M, 12M)
      let matchesDuration = true;
      if (durationFilter !== 'all') {
        const targetMonths = parseInt(durationFilter, 10);
        if (m.joinDate && m.expiryDate) {
          const d1 = new Date(m.joinDate);
          const d2 = new Date(m.expiryDate);
          const monthDiff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
          matchesDuration = Math.abs(monthDiff - targetMonths) <= 1 || m.plan.toLowerCase().includes(`${targetMonths}m`);
        }
      }

      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [members, searchTerm, statusFilter, durationFilter]);

  const handleWhatsAppClick = (e: React.MouseEvent, m: Member) => {
    e.stopPropagation();
    const cleanPhone = m.phone.replace(/[^0-9]/g, '');
    let template = profile.whatsappReminderTemplate || 'Hello {NAME}, your gym membership for {PLAN} expires on {EXPIRY}.';
    template = template
      .replace('{NAME}', m.name)
      .replace('{PLAN}', m.plan)
      .replace('{EXPIRY}', m.expiryDate);

    const encodedText = encodeURIComponent(template);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Search Bar */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0099ff]/15 text-[#0099ff] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Members Directory</h2>
            <p className="text-xs text-[#8e9db5]">Manage active subscriptions, renewals & contact info</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member, phone, APP ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="expired">Expired Members</option>
            <option value="trial">Trial Members</option>
          </select>

          {/* Plan Duration Filter (3M, 6M, 12M presets) */}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Plan Durations</option>
            <option value="1">1 Month Plan</option>
            <option value="3">3 Months Plan</option>
            <option value="6">6 Months Plan</option>
            <option value="12">12 Months Plan</option>
          </select>

          {/* Print PDF Button */}
          <button
            onClick={handlePrintMemberList}
            className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-cyan-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>

          {/* Add Member Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-glow-green flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card rounded-2xl border border-[#22324b] overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-[#8e9db5] text-xs">
            No members found matching your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1624] border-b border-[#22324b] text-[#8e9db5] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Member Name & Details</th>
                  <th className="py-3.5 px-5">Type / Plan</th>
                  <th className="py-3.5 px-5">Days Left</th>
                  <th className="py-3.5 px-5">Join Date</th>
                  <th className="py-3.5 px-5">Expiry Date</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22324b]">
                {filteredMembers.map((m) => {
                  const isExpired = m.status === 'Expired';
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
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-[#22324b] text-[#0099ff] font-bold flex items-center justify-center text-xs">
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

                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[#8e9db5] text-[11px] font-mono">{m.phone}</span>

                              {/* Days Left badge under member details */}
                              {daysLeft > 5 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {daysLeft} Days Left
                                </span>
                              ) : daysLeft > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-glow-amber">
                                  <Clock className="w-3 h-3" />
                                  {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
                                </span>
                              ) : daysLeft === 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Expires Today
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Expired ({Math.abs(daysLeft)}d ago)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-bold text-white capitalize">{m.plan}</div>
                        <div className="text-[#8e9db5] text-[10px]">{m.type} Member</div>
                      </td>

                      {/* Dedicated Days Left Column */}
                      <td className="py-3.5 px-5">
                        {daysLeft > 5 ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft} Days Left
                          </span>
                        ) : daysLeft > 0 ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1 shadow-glow-amber">
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Expires Today
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {Math.abs(daysLeft)}d ago
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-[#8e9db5] font-mono">{m.joinDate}</td>
                      <td className={`py-3.5 px-5 font-mono font-bold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {m.expiryDate}
                      </td>

                      <td className="py-3.5 px-5 text-white font-medium">{m.paymentMethod}</td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            m.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleWhatsAppClick(e, m)}
                            className="w-8 h-8 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMember(m);
                            }}
                            className="w-8 h-8 rounded-xl bg-[#0f1624] hover:bg-[#162032] border border-[#22324b] text-[#8e9db5] hover:text-white flex items-center justify-center transition-colors"
                            title="View / Edit Details"
                          >
                            <Eye className="w-4 h-4" />
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
