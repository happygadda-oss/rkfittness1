import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Shield, Phone, Mail, DollarSign, X } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import type { StaffMember } from '../../types';

export const StaffView: React.FC = () => {
  const { staff, addStaff, deleteStaff } = useGym();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('Head Trainer');
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState(25000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addStaff({
      name,
      role,
      phone,
      email,
      salary,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Staff Roster & Trainers</h2>
            <p className="text-xs text-[#8e9db5]">Manage gym trainers, reception staff & payroll records</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1017]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md bg-[#0f1624] border border-[#22324b] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22324b]">
              <h3 className="text-base font-extrabold text-white">Add Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8e9db5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#8e9db5] mb-1">Staff Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white placeholder-[#8e9db5] focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#8e9db5] mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Head Trainer">Head Trainer</option>
                    <option value="Cardio Trainer">Cardio Trainer</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="Gym Owner">Gym Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#8e9db5] mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#8e9db5] mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-bold text-[#8e9db5] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#22324b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8e9db5] hover:text-white bg-[#162032] border border-[#22324b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white font-bold bg-purple-500 hover:bg-purple-400 shadow-glow-purple"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((st) => (
          <div key={st.id} className="glass-card rounded-2xl p-5 border border-[#22324b] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm">
                  {st.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{st.name}</h3>
                  <p className="text-xs text-purple-400 font-semibold">{st.role}</p>
                </div>
              </div>

              <button onClick={() => deleteStaff(st.id)} className="p-1.5 text-[#8e9db5] hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#0f1624] rounded-xl border border-[#22324b] space-y-1 text-xs font-mono">
              <div className="flex justify-between text-[#8e9db5]">
                <span>Phone:</span>
                <span className="text-white">{st.phone}</span>
              </div>
              <div className="flex justify-between text-[#8e9db5]">
                <span>Salary:</span>
                <span className="text-emerald-400 font-bold">₹{st.salary.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
