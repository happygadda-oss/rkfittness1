import React, { useState, useEffect } from 'react';
import { X, User, Phone, Dumbbell, Calendar, Check } from 'lucide-react';
import type { Member, MemberType, PaymentMethod } from '../../types';
import { useGym } from '../../context/GymContext';
import { defaultGymPlans } from '../../utils/initialData';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Member | null;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { addMember, updateMember, profile } = useGym();

  const availablePlans = profile.plans && profile.plans.length > 0 ? profile.plans : defaultGymPlans;

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
  const defaultExpiryStr = defaultExpiry.toISOString().split('T')[0];

  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '+91');
  const [email, setEmail] = useState(initialData?.email || '');
  const [type, setType] = useState<MemberType>(initialData?.type || 'Paid');
  const [selectedPlanId, setSelectedPlanId] = useState(availablePlans[0]?.id || 'plan_cardio');
  const [planName, setPlanName] = useState(initialData?.plan || availablePlans[0]?.name || 'Cardio Fitness');
  const [joinDate, setJoinDate] = useState(initialData?.joinDate || todayStr);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || defaultExpiryStr);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'Cash');
  const [amountPaid, setAmountPaid] = useState<number>(initialData?.amountPaid || 4200);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialData?.gender || 'Male');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setType(initialData.type);
      setPlanName(initialData.plan);
      setJoinDate(initialData.joinDate);
      setExpiryDate(initialData.expiryDate);
      setPaymentMethod(initialData.paymentMethod);
      setAmountPaid(initialData.amountPaid);
      setNotes(initialData.notes || '');
      setGender(initialData.gender || 'Male');
    } else if (isOpen) {
      setName('');
      setPhone('+91 ');
      setEmail('');
      setType('Paid');
      const defaultPlan = availablePlans[0] || { id: 'plan_cardio', name: 'Cardio Fitness', monthlyPrice: 1400 };
      setSelectedPlanId(defaultPlan.id);
      setPlanName(defaultPlan.name);
      setJoinDate(todayStr);
      setDurationMonths(3);
      setExpiryDate(defaultExpiryStr);
      setPaymentMethod('Cash');
      setAmountPaid(defaultPlan.pricesByDuration?.[3] || (defaultPlan.monthlyPrice * 3));
      setNotes('');
      setGender('Male');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  // Recalculate expiry & price when duration or plan changes
  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    const start = new Date(joinDate);
    start.setMonth(start.getMonth() + months);
    setExpiryDate(start.toISOString().split('T')[0]);

    // Calculate preset price
    const foundPlan = availablePlans.find(p => p.id === selectedPlanId || p.name === planName);
    if (foundPlan && foundPlan.pricesByDuration && foundPlan.pricesByDuration[months]) {
      setAmountPaid(foundPlan.pricesByDuration[months]);
    } else if (foundPlan) {
      setAmountPaid(foundPlan.monthlyPrice * months);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const found = availablePlans.find(p => p.id === planId);
    if (found) {
      setPlanName(found.name);
      if (found.pricesByDuration && found.pricesByDuration[durationMonths]) {
        setAmountPaid(found.pricesByDuration[durationMonths]);
      } else {
        setAmountPaid(found.monthlyPrice * durationMonths);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (initialData) {
      updateMember(initialData.id, {
        name,
        phone,
        email,
        type,
        plan: planName,
        joinDate,
        expiryDate,
        paymentMethod,
        amountPaid,
        notes,
        gender
      });
    } else {
      addMember({
        name,
        phone,
        email,
        type,
        plan: `${planName} (${durationMonths}M)`,
        joinDate,
        expiryDate,
        paymentMethod,
        amountPaid: type === 'Trial' ? 0 : amountPaid,
        status: new Date(expiryDate) >= new Date() ? 'Active' : 'Expired',
        notes,
        gender
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1017]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#0f1624] border border-[#22324b] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#22324b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {initialData ? 'Edit Member Subscription' : 'Add New Gym Member'}
              </h3>
              <p className="text-xs text-[#8e9db5]">Configure plan, duration & payment details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#8e9db5] hover:text-white hover:bg-[#162032]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Member Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Veeresh S"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 97310 12710"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Member Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MemberType)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
              >
                <option value="Paid">Paid Subscription</option>
                <option value="Trial">1-Week Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-xs font-bold text-[#8e9db5] mb-1.5">Select Membership Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {availablePlans.map((p) => {
                const isSel = selectedPlanId === p.id || planName === p.name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlanSelect(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSel
                        ? 'bg-[#0099ff]/15 border-[#0099ff] text-white shadow-glow-blue font-bold'
                        : 'bg-[#162032] border-[#22324b] text-[#8e9db5] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">₹{p.monthlyPrice}/mo</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Duration Presets (1M, 3M, 6M, 12M) */}
          <div>
            <label className="block text-xs font-bold text-[#8e9db5] mb-1.5">Quick Duration Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleDurationChange(m)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    durationMonths === m
                      ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                      : 'bg-[#162032] border border-[#22324b] text-[#8e9db5] hover:text-white'
                  }`}
                >
                  {m} Month{m > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Dates & Payment Details */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Joining Date</label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8e9db5] mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
              />
            </div>
          </div>

          {type === 'Paid' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#0099ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8e9db5] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / GPay / UPI</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card / POS</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#8e9db5] mb-1">Notes / Preferences</label>
            <textarea
              rows={2}
              placeholder="Cardio slot 6am to 7am, trainer notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#162032] border border-[#22324b] rounded-xl p-3 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#22324b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8e9db5] hover:text-white bg-[#162032] border border-[#22324b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-glow-blue transition-all"
            >
              {initialData ? 'Save Changes' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
