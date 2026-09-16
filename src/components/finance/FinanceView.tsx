import React, { useState } from 'react';
import { CreditCard, TrendingUp, Search, Receipt, DollarSign } from 'lucide-react';
import { useGym } from '../../context/GymContext';

export const FinanceView: React.FC = () => {
  const { payments, stats } = useGym();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' ? true : p.paymentMethod.toLowerCase() === methodFilter.toLowerCase();
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 tracking-tight">
              ₹{stats.allTimeRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Today: ₹{stats.todayRevenue.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Expenses</div>
            <div className="text-2xl font-extrabold text-orange-400 mt-1 tracking-tight">
              ₹{stats.allTimeExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Today: ₹{stats.todayExpenses.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Net Profit</div>
            <div className={`text-2xl font-extrabold mt-1 tracking-tight ${stats.allTimeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{stats.allTimeProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">All-time Revenue minus Expenses</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0099ff]/15 text-[#0099ff] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">This Month Profit</div>
            <div className={`text-2xl font-extrabold mt-1 tracking-tight ${stats.thisMonthProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{stats.thisMonthProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Month Revenue - Expenses</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Payment Records Header & Controls */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0099ff]/15 text-[#0099ff] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Payments & Income</h2>
            <p className="text-xs text-[#8e9db5]">Detailed log of member subscription collections</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8e9db5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8e9db5] focus:outline-none focus:border-[#0099ff]"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099ff]"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="online">Online / UPI</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>

      {/* Payment Table */}
      <div className="glass-card rounded-2xl border border-[#22324b] overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-[#8e9db5] text-xs">No payment records logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f1624] border-b border-[#22324b] text-[#8e9db5] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Member Name</th>
                  <th className="py-3.5 px-5">Plan</th>
                  <th className="py-3.5 px-5">Method</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22324b]">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1c2a42]/50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">{p.memberName}</td>
                    <td className="py-3.5 px-5 text-[#8e9db5] capitalize">{p.plan}</td>
                    <td className="py-3.5 px-5 font-medium text-cyan-400">{p.paymentMethod}</td>
                    <td className="py-3.5 px-5 text-[#8e9db5] font-mono">
                      {p.date} {p.formattedTime ? `• ${p.formattedTime}` : ''}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      ₹{p.amount.toLocaleString()}
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
