import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  RefreshCw,
  Trash2,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  Clock,
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Member, PaymentMethod } from '../../types';
import { useGym } from '../../context/GymContext';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onEdit
}) => {
  const { renewMember, deleteMember, profile } = useGym();
  const [renewMonths, setRenewMonths] = useState(3);
  const [renewMethod, setRenewMethod] = useState<PaymentMethod>('Cash');
  const [renewAmount, setRenewAmount] = useState(4200);
  const [showRenewBox, setShowRenewBox] = useState(false);
  const [showDeleteBox, setShowDeleteBox] = useState(false);

  if (!member) return null;

  const isExpired = member.status === 'Expired';

  // Calculate days remaining / days expired
  const now = new Date();
  const expDate = new Date(member.expiryDate);
  const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewMember(member.id, renewMonths, renewMethod, renewAmount);
    setShowRenewBox(false);
    onClose();
  };

  // Delete handling moved inline into options

  const handleWhatsAppClick = () => {
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    let template = profile.whatsappReminderTemplate || 'Hello {NAME}, your membership for {PLAN} at Rk Fitness World expires on {EXPIRY}.';
    template = template
      .replace('{NAME}', member.name)
      .replace('{PLAN}', member.plan)
      .replace('{EXPIRY}', member.expiryDate);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1017]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#0f1624] border border-[#22324b] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#22324b]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-glow-blue">
              {member.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{member.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                    member.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {member.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8e9db5]">
                {member.appNumber && (
                  <span className="font-mono text-cyan-400 font-bold bg-[#162032] px-2 py-0.5 rounded border border-[#22324b]">
                    {member.appNumber}
                  </span>
                )}
                {member.gender && <span>• {member.gender}</span>}
                <span>• {member.type} Member</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-[#8e9db5] hover:text-white hover:bg-[#162032]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Days Health Pill Banner */}
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
            diffDays > 0
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <Clock className="w-4 h-4" />
            <span>
              {diffDays > 0
                ? `Active Subscription — ${diffDays} day${diffDays > 1 ? 's' : ''} remaining`
                : `Membership Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`}
            </span>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-glow-green"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send WhatsApp</span>
          </button>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Subscription Plan</div>
            <div className="text-white font-bold text-sm mt-0.5 capitalize">{member.plan}</div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Amount Paid</div>
            <div className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">₹{member.amountPaid.toLocaleString()}</div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Payment Method</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5">{member.paymentMethod}</div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Joining Date</div>
            <div className="text-white font-mono mt-0.5">{member.joinDate}</div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Expiry Date</div>
            <div className={`font-mono font-bold mt-0.5 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
              {member.expiryDate}
            </div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Days Remaining</div>
            <div className={`font-mono font-extrabold mt-0.5 ${diffDays > 5 ? 'text-emerald-400' : diffDays > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {diffDays > 0 ? `${diffDays} Days Left` : diffDays === 0 ? 'Expires Today' : `Expired (${Math.abs(diffDays)}d ago)`}
            </div>
          </div>

          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b]">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px]">Phone Number</div>
            <div className="text-white font-mono mt-0.5">{member.phone}</div>
          </div>
        </div>

        {/* Notes & Slot */}
        {member.notes && (
          <div className="p-3.5 bg-[#162032] rounded-2xl border border-[#22324b] text-xs">
            <div className="text-[#8e9db5] font-bold uppercase text-[10px] mb-1">Workout Slot / Special Notes</div>
            <div className="text-white font-medium">{member.notes}</div>
          </div>
        )}

        {/* Actions Bar */}
        {!showRenewBox && !showDeleteBox ? (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#22324b]">
            <button
              onClick={() => onEdit(member)}
              className="px-4 py-2.5 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-[#8e9db5] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-4 h-4 text-[#0099ff]" />
              <span>Edit Details</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRenewBox(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0099ff] hover:bg-blue-600 text-white font-bold text-xs shadow-glow-blue flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Renew Membership</span>
              </button>

              <button
                onClick={() => setShowDeleteBox(true)}
                className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 transition-all"
                title="Delete Options"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : showRenewBox ? (
          <form onSubmit={handleRenewSubmit} className="p-4 bg-[#162032] rounded-2xl border border-[#0099ff]/50 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0099ff]" />
              <span>Renew Membership</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setRenewMonths(m);
                    setRenewAmount(m * 1400);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    renewMonths === m
                      ? 'bg-[#0099ff] text-white shadow-glow-blue'
                      : 'bg-[#0f1624] border border-[#22324b] text-[#8e9db5]'
                  }`}
                >
                  +{m} Month{m > 1 ? 's' : ''}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] text-[#8e9db5] mb-1 font-bold">Renewal Amount (₹)</label>
                <input
                  type="number"
                  value={renewAmount}
                  onChange={(e) => setRenewAmount(Number(e.target.value))}
                  className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 font-mono text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8e9db5] mb-1 font-bold">Payment Method</label>
                <select
                  value={renewMethod}
                  onChange={(e) => setRenewMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / GPay / UPI</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRenewBox(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#8e9db5] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
              >
                Confirm Renewal
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-[#162032] rounded-2xl border border-rose-500/50 space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Delete Member Options</span>
            </div>
            
            <p className="text-[11px] text-[#8e9db5]">
              Choose how you want to remove this member:
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  deleteMember(member.id, true);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold text-xs text-left"
              >
                1. Created by mistake (Reverses their payment)
              </button>
              
              <button
                onClick={() => {
                  deleteMember(member.id, false);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold text-xs text-left"
              >
                2. Delete old/expired (Keeps past revenue)
              </button>
            </div>

            <div className="flex justify-end pt-1 border-t border-[#22324b]">
              <button
                type="button"
                onClick={() => setShowDeleteBox(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#8e9db5] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
