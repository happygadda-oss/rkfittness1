import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardView } from './components/dashboard/DashboardView';
import { MemberList } from './components/members/MemberList';
import { AddMemberModal } from './components/members/AddMemberModal';
import { MemberDetailModal } from './components/members/MemberDetailModal';
import { EnquiriesView } from './components/enquiries/EnquiriesView';
import { MemberAlerts } from './components/alerts/MemberAlerts';
import { FinanceView } from './components/finance/FinanceView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { StaffView } from './components/staff/StaffView';
import { DatabaseView } from './components/database/DatabaseView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { useAuth } from './context/AuthContext';
import { SignInView } from './components/auth/SignInView';

import type { Member } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  if (!isAuthenticated) {
    return <SignInView />;
  }

  return (
    <div className="flex min-h-screen bg-[#0c1017] text-slate-100 font-sans select-none">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenAddMember={() => setIsAddMemberOpen(true)}
          onOpenAddEnquiry={() => setIsAddEnquiryOpen(true)}
          onOpenAddPayment={() => setActiveTab('finance')}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'members' && (
            <MemberList
              onOpenAddModal={() => setIsAddMemberOpen(true)}
              onSelectMember={(mem) => setSelectedMember(mem)}
            />
          )}
          {activeTab === 'enquiries' && (
            <EnquiriesView
              onOpenAddModal={() => setIsAddEnquiryOpen(true)}
              isAddModalOpen={isAddEnquiryOpen}
              onCloseAddModal={() => setIsAddEnquiryOpen(false)}
            />
          )}
          {activeTab === 'alerts' && (
            <MemberAlerts onSelectMember={(mem) => setSelectedMember(mem)} />
          )}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'database' && <DatabaseView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null);
        }}
        initialData={editingMember}
      />

      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(mem) => {
          setSelectedMember(null);
          setEditingMember(mem);
          setIsAddMemberOpen(true);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <MainAppContent />
      </GymProvider>
    </AuthProvider>
  );
}

export default App;
