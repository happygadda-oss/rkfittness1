import React from 'react';
import {
  Users,
  UserCheck,
  CreditCard,
  UserPlus,
  Receipt,
  TrendingUp,
  Bell,
  Percent,
  DollarSign
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { MetricCard } from './MetricCard';
import { MonthlyTrends } from './MonthlyTrends';
import { RecentActivity } from './RecentActivity';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { stats, members } = useGym();

  const expiringCount = members.filter((m) => m.status === 'Expired').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Expiry Banner Alert */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {expiringCount} Member memberships have expired!
              </div>
              <div className="text-[11px] text-[#8e9db5] mt-0.5">
                Send WhatsApp reminders to members to renew their membership.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('alerts')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            View Expiring ({expiringCount})
          </button>
        </div>
      )}

      {/* Primary Financial & KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${stats.allTimeRevenue.toLocaleString()}`}
          subtitle={`Today: ₹${stats.todayRevenue.toLocaleString()}`}
          icon={CreditCard}
          iconBgColor="bg-emerald-500/15"
          iconColor="text-emerald-400"
          badge={`Month: ₹${stats.thisMonthRevenue.toLocaleString()}`}
          onClick={() => setActiveTab('finance')}
        />

        <MetricCard
          title="Total Expenses"
          value={`₹${stats.allTimeExpenses.toLocaleString()}`}
          subtitle={`Today: ₹${stats.todayExpenses.toLocaleString()}`}
          icon={Receipt}
          iconBgColor="bg-orange-500/15"
          iconColor="text-orange-400"
          badge={`Month: ₹${stats.thisMonthExpenses.toLocaleString()}`}
          onClick={() => setActiveTab('expenses')}
        />

        <MetricCard
          title="Total Net Profit"
          value={`₹${stats.allTimeProfit.toLocaleString()}`}
          subtitle={`Today Profit: ₹${stats.todayProfit.toLocaleString()}`}
          icon={DollarSign}
          iconBgColor="bg-[#0099ff]/15"
          iconColor="text-[#0099ff]"
          badge={`Month: ₹${stats.thisMonthProfit.toLocaleString()}`}
          onClick={() => setActiveTab('finance')}
        />

        <MetricCard
          title="Active Members"
          value={stats.activeMembers}
          subtitle={`out of ${stats.totalMembers} total members`}
          icon={Users}
          iconBgColor="bg-purple-500/15"
          iconColor="text-purple-400"
          badge={`${stats.activeRate}% Active`}
          onClick={() => setActiveTab('members')}
        />
      </div>

      {/* Secondary Quick Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">New Members Today</div>
            <div className="text-2xl font-extrabold text-white mt-1 tracking-tight">{stats.admissionsToday}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Joined today</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Monthly Profit</div>
            <div className={`text-2xl font-extrabold mt-1 tracking-tight ${stats.thisMonthProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{stats.thisMonthProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Month Revenue - Expenses</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Staff</div>
            <div className="text-2xl font-extrabold text-white mt-1 tracking-tight">{stats.totalStaff}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Trainers & Staff</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0099ff]/15 text-[#0099ff] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Trial Members</div>
            <div className="text-2xl font-extrabold text-white mt-1 tracking-tight">{stats.trialMembers}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Members on trial</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrends />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Plan Distribution Breakdown */}
      <div className="glass-card rounded-2xl p-6 border border-[#22324b]">
        <h3 className="text-base font-extrabold text-white tracking-tight mb-4">Plans Breakdown</h3>
        {stats.planDistribution.length === 0 ? (
          <div className="text-xs text-[#8e9db5] text-center py-6">
            No member plans added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.planDistribution.map((item) => (
              <div key={item.name} className="p-4 bg-[#0f1624] border border-[#22324b] rounded-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white capitalize">{item.name}</span>
                  <span className="font-mono text-[#8e9db5]">{item.count} members</span>
                </div>
                <div className="w-full bg-[#162032] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-[#8e9db5] mt-1.5">{item.percentage}% of total</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
