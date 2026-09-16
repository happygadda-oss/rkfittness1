import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useGym } from '../../context/GymContext';

interface AddEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEnquiryModal: React.FC<AddEnquiryModalProps> = ({ isOpen, onClose }) => {
  const { addEnquiry } = useGym();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [planInterest, setPlanInterest] = useState('Cardio Fitness');
  const [source, setSource] = useState<'Walk-in' | 'Instagram' | 'Google' | 'Referral' | 'Phone'>('Walk-in');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('+91 ');
      setEmail('');
      setPlanInterest('Cardio Fitness');
      setSource('Walk-in');
      setFollowUpDate('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addEnquiry({
      name,
      phone,
      email,
      planInterest,
      source,
      status: 'New',
      followUpDate: followUpDate || undefined,
      notes
    });

    setName('');
    setPhone('+91');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c1017]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#0f1624] border border-[#22324b] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#22324b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Record Prospect Enquiry</h3>
              <p className="text-xs text-[#8e9db5]">Capture new walk-in or social media lead</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#8e9db5] hover:text-white hover:bg-[#162032]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#8e9db5] mb-1">Prospect Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white placeholder-[#8e9db5] focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-[#8e9db5] mb-1">Phone Number *</label>
            <input
              type="text"
              required
              placeholder="+91 98123 45678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white placeholder-[#8e9db5] focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#8e9db5] mb-1">Plan Interest</label>
              <input
                type="text"
                value={planInterest}
                onChange={(e) => setPlanInterest(e.target.value)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8e9db5] mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Phone">Phone Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#8e9db5] mb-1">Follow Up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold text-[#8e9db5] mb-1">Inquiry Notes</label>
            <textarea
              rows={2}
              placeholder="Package discount requested..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#162032] border border-[#22324b] rounded-xl p-3 text-white placeholder-[#8e9db5] focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#22324b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-[#8e9db5] hover:text-white bg-[#162032] border border-[#22324b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-glow-orange transition-all"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
