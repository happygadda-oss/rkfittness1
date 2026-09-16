import React, { useState } from 'react';
import { Receipt, Plus, Trash2, Calendar, DollarSign, X } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import type { ExpenseCategory } from '../../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, stats } = useGym();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    addExpense({
      title,
      category,
      amount,
      date,
      notes
    });

    setTitle('');
    setAmount(1000);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Expense KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Today's Expenses</div>
            <div className="text-2xl font-extrabold text-orange-400 mt-1 tracking-tight">
              ₹{stats.todayExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Daily operating costs</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">This Month's Expenses</div>
            <div className="text-2xl font-extrabold text-purple-400 mt-1 tracking-tight">
              ₹{stats.thisMonthExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Monthly rent, bills & maintenance</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Gym Expense Log</h2>
            <p className="text-xs text-[#8e9db5]">Track bills, salaries, rent & maintenance expenses</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glow-orange flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c1017]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md bg-[#0f1624] border border-[#22324b] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22324b]">
              <h3 className="text-base font-extrabold text-white">Record New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8e9db5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#8e9db5] mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym Equipment Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white placeholder-[#8e9db5] focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#8e9db5] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-400"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#8e9db5] mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#8e9db5] mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22324b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-400"
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
                  className="px-6 py-2 rounded-xl text-slate-950 font-bold bg-orange-500 hover:bg-orange-400 shadow-glow-orange"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="glass-card rounded-2xl border border-[#22324b] overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-[#8e9db5] text-xs">No expenses recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1624] border-b border-[#22324b] text-[#8e9db5] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22324b]">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1c2a42]/50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">{exp.title}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#8e9db5] font-mono">{exp.date}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-orange-400 text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 text-[#8e9db5] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
