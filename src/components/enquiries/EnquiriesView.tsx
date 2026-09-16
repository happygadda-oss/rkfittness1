import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, CheckCircle2, UserPlus, Search } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import type { Enquiry } from '../../types';
import { AddEnquiryModal } from './AddEnquiryModal';

interface EnquiriesViewProps {
  onOpenAddModal: () => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  onOpenAddModal,
  isAddModalOpen,
  onCloseAddModal
}) => {
  const { enquiries, deleteEnquiry, convertEnquiryToMember } = useGym();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEnquiries = enquiries.filter((e) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      e.name.toLowerCase().includes(query) ||
      e.phone.toLowerCase().includes(query) ||
      (e.email && e.email.toLowerCase().includes(query));

    const matchesStatus = filterStatus === 'all' ? true : e.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleConvert = (eq: Enquiry) => {
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);

    convertEnquiryToMember(eq.id, {
      name: eq.name,
      phone: eq.phone,
      email: eq.email,
      type: 'Paid',
      plan: eq.planInterest || 'Cardio Fitness',
      joinDate: new Date().toISOString().split('T')[0],
      expiryDate: defaultExpiry.toISOString().split('T')[0],
      paymentMethod: 'Cash',
      amountPaid: 4500,
      status: 'Active',
      notes: `Converted from lead (${eq.source})`
    });
  };

  return (
    <div className="space-y-4 pb-12">
      <AddEnquiryModal isOpen={isAddModalOpen} onClose={onCloseAddModal} />

      {/* Top Controls Header */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Inquiries & Leads</h2>
            <p className="text-xs text-[#8e9db5]">Track new gym inquiries and convert them to active members</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lead, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
          >
            <option value="all">All Inquiries</option>
            <option value="new">New Leads</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-glow-orange flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inquiry</span>
          </button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="glass-card rounded-2xl border border-[#22324b] overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-[#8e9db5] text-xs">
            No gym inquiries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1624] border-b border-[#22324b] text-[#8e9db5] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Lead Name & Phone</th>
                  <th className="py-3.5 px-5">Plan Interested</th>
                  <th className="py-3.5 px-5">Source</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Follow Up</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22324b]">
                {filteredEnquiries.map((eq) => (
                  <tr key={eq.id} className="hover:bg-[#1c2a42]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white text-sm">{eq.name}</div>
                      <div className="text-[#8e9db5] text-[11px] font-mono mt-0.5">{eq.phone}</div>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-white">{eq.planInterest}</td>
                    <td className="py-3.5 px-5 text-cyan-400 font-semibold">{eq.source}</td>
                    <td className="py-3.5 px-5 text-[#8e9db5] font-mono">{eq.createdAt}</td>
                    <td className="py-3.5 px-5 text-amber-300 font-mono">{eq.followUpDate || '-'}</td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          eq.status === 'New'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : eq.status === 'Converted'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#22324b] text-[#8e9db5]'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {eq.status !== 'Converted' ? (
                          <button
                            onClick={() => handleConvert(eq)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Make Member</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                          </span>
                        )}

                        <button
                          onClick={() => deleteEnquiry(eq.id)}
                          className="w-8 h-8 rounded-xl bg-[#0f1624] hover:bg-rose-500/20 border border-[#22324b] text-[#8e9db5] hover:text-rose-400 flex items-center justify-center transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
