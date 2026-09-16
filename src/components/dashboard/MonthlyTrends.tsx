import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useGym } from '../../context/GymContext';

export const MonthlyTrends: React.FC = () => {
  const { payments, members } = useGym();

  const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  // Calculate actual monthly trends (or 0 if no records exist)
  const trendData = monthNames.map((month) => {
    const rev = payments
      .filter((p) => p.date && new Date(p.date).toLocaleDateString('en-US', { month: 'short' }) === month)
      .reduce((sum, p) => sum + p.amount, 0);

    const adm = members.filter(
      (m) => m.joinDate && new Date(m.joinDate).toLocaleDateString('en-US', { month: 'short' }) === month
    ).length;

    return {
      month,
      admissions: adm,
      revenue: rev
    };
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-[#22324b]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-white tracking-tight">Revenue & Growth Trends</h3>
          <p className="text-xs text-[#8e9db5] mt-0.5">Monthly admissions & revenue performance</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d284]" />
            <span className="text-white font-semibold">Revenue (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0099ff]" />
            <span className="text-[#8e9db5]">Admissions</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d284" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00d284" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0099ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0099ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#22324b" vertical={false} />
            <XAxis dataKey="month" stroke="#8e9db5" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8e9db5" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#162032',
                borderColor: '#22324b',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#00d284" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="admissions" stroke="#0099ff" strokeWidth={2} fillOpacity={1} fill="url(#colorAdmissions)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
