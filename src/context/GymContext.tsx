import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Member,
  Enquiry,
  PaymentRecord,
  Expense,
  StaffMember,
  ActivityItem,
  GymProfile,
  EnquiryStatus,
  User
} from '../types';
import {
  initialGymProfile,
  initialMembers,
  initialEnquiries,
  initialPayments,
  initialExpenses,
  initialStaff,
  initialActivities
} from '../utils/initialData';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  backupRelationalTablesToSupabase,
  backupMembersTable,
  backupPaymentsTable,
  backupExpensesTable,
  backupEnquiriesTable,
  backupStaffTable,
  backupUsersTable,
  backupToSupabase,
  restoreFromSupabase,
  testSupabaseConnection,
  deleteRecordFromSupabase,
  clearWorkspaceDataFromSupabase
} from '../services/supabaseClient';
import type { SupabaseConfig, BackupPayload } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

interface GymContextType {
  profile: GymProfile;
  updateProfile: (updated: Partial<GymProfile>) => void;
  members: Member[];
  addMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updated: Partial<Member>) => void;
  deleteMember: (id: string, reversePayments?: boolean) => void;
  renewMember: (id: string, months: number, paymentMethod: Member['paymentMethod'], amount: number) => void;
  
  enquiries: Enquiry[];
  addEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'createdAt'>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus, notes?: string) => void;
  deleteEnquiry: (id: string) => void;
  convertEnquiryToMember: (enquiryId: string, memberData: Omit<Member, 'id'>) => void;
  
  payments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  
  staff: StaffMember[];
  addStaff: (staffData: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  
  activities: ActivityItem[];
  logActivity: (type: ActivityItem['type'], memberName: string, detail: string, iconType?: ActivityItem['iconType']) => void;
  
  stats: {
    totalMembers: number;
    activeMembers: number;
    expiredMembers: number;
    trialMembers: number;
    activeRate: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    allTimeRevenue: number;
    admissionsToday: number;
    todayExpenses: number;
    thisMonthExpenses: number;
    allTimeExpenses: number;
    todayProfit: number;
    thisMonthProfit: number;
    allTimeProfit: number;
    totalStaff: number;
    planDistribution: { name: string; count: number; percentage: number; color: string }[];
  };

  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (url: string, key: string, autoSync: boolean) => void;
  backupToCloud: (override?: { url: string; key: string }) => Promise<{ success: boolean; error?: string }>;
  backupMembersToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupPaymentsToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupExpensesToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupEnquiriesToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupStaffToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupUsersToCloud: () => Promise<{ success: boolean; error?: string }>;
  backupMasterSnapshotToCloud: () => Promise<{ success: boolean; error?: string }>;
  restoreFromCloud: (override?: { url: string; key: string }) => Promise<{ success: boolean; error?: string }>;
  testCloudConnection: (override?: { url: string; key: string }) => Promise<{ success: boolean; error?: string }>;

  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userPrefix = user ? `${user.id}_` : '';

  const [profile, setProfile] = useState<GymProfile>(initialGymProfile);
  const [members, setMembers] = useState<Member[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getStoredSupabaseConfig(userPrefix));

  const [isLoaded, setIsLoaded] = useState(false);

  // Read stored data for the active user account or fallback to clean empty arrays
  useEffect(() => {
    if (!user) return;
    const prefix = `${user.id}_`;
    const isAdmin = user.id === 'usr_admin' || user.username === 'admin';
    const defaultProfile: GymProfile = {
      ...initialGymProfile,
      name: user.name || 'Rk Fitness World',
      code: `RK-GYM-${(user.username || 'DEFAULT').toUpperCase()}`
    };

    const loadKey = (keyName: string) => {
      const prefixed = localStorage.getItem(`${prefix}${keyName}`);
      if (prefixed) return prefixed;
      if (isAdmin) {
        const unPrefixed = localStorage.getItem(keyName);
        if (unPrefixed) return unPrefixed;
      }
      return null;
    };

    try {
      const savedProfileStr = loadKey('rk_gym_v2_profile');
      const loadedProfile = savedProfileStr ? JSON.parse(savedProfileStr) : defaultProfile;
      // Force gym code to match the isolated account username
      loadedProfile.code = `RK-GYM-${(user.username || 'DEFAULT').toUpperCase()}`;
      setProfile(loadedProfile);

      const savedMembers = loadKey('rk_gym_v2_members');
      setMembers(savedMembers ? JSON.parse(savedMembers) : []);

      const savedEnquiries = loadKey('rk_gym_v2_enquiries');
      setEnquiries(savedEnquiries ? JSON.parse(savedEnquiries) : []);

      const savedPayments = loadKey('rk_gym_v2_payments');
      setPayments(savedPayments ? JSON.parse(savedPayments) : []);

      const savedExpenses = loadKey('rk_gym_v2_expenses');
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);

      const savedStaff = loadKey('rk_gym_v2_staff');
      setStaff(savedStaff ? JSON.parse(savedStaff) : []);

      const savedActivities = loadKey('rk_gym_v2_activities');
      setActivities(savedActivities ? JSON.parse(savedActivities) : []);

      setSupabaseConfig(getStoredSupabaseConfig(prefix));
    } catch {}

    setIsLoaded(true);

    // --- AUTOMATIC CLOUD RESTORE ON LOGIN (MULTI-DEVICE & BROWSER SYNC) ---
    const autoRestoreFromCloud = async () => {
      try {
        const userGymCode = `RK-GYM-${(user.username || 'DEFAULT').toUpperCase()}`;
        const userConfig = getStoredSupabaseConfig(prefix);
        const masterConfig = getStoredSupabaseConfig('');
        const activeUrl = userConfig.url || masterConfig.url;
        const activeKey = userConfig.key || masterConfig.key;

        if (activeUrl && activeKey) {
          const res = await restoreFromSupabase(userGymCode, { url: activeUrl, key: activeKey });
          if (res.success && res.data) {
            if (res.data.profile) setProfile(res.data.profile);
            if (res.data.members && res.data.members.length > 0) setMembers(res.data.members);
            if (res.data.payments && res.data.payments.length > 0) setPayments(res.data.payments);
            if (res.data.expenses && res.data.expenses.length > 0) setExpenses(res.data.expenses);
            if (res.data.enquiries && res.data.enquiries.length > 0) setEnquiries(res.data.enquiries);
            if (res.data.staff && res.data.staff.length > 0) setStaff(res.data.staff);
            if (res.data.activities && res.data.activities.length > 0) setActivities(res.data.activities);
          }
        }
      } catch (err) {
        console.warn('Auto cloud restore on login skipped:', err);
      }
    };

    autoRestoreFromCloud();
  }, [user?.id]);

  // Persist state updates to user-isolated local storage
  useEffect(() => {
    if (!isLoaded || !user) return;
    const prefix = `${user.id}_`;
    try {
      localStorage.setItem(`${prefix}rk_gym_v2_profile`, JSON.stringify(profile));
      localStorage.setItem(`${prefix}rk_gym_v2_members`, JSON.stringify(members));
      localStorage.setItem(`${prefix}rk_gym_v2_enquiries`, JSON.stringify(enquiries));
      localStorage.setItem(`${prefix}rk_gym_v2_payments`, JSON.stringify(payments));
      localStorage.setItem(`${prefix}rk_gym_v2_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${prefix}rk_gym_v2_staff`, JSON.stringify(staff));
      localStorage.setItem(`${prefix}rk_gym_v2_activities`, JSON.stringify(activities));
    } catch {}
  }, [profile, members, enquiries, payments, expenses, staff, activities, isLoaded, user?.id]);

  // --- AUTOMATIC REAL-TIME BACKGROUND CLOUD SYNC ON CHANGES ---
  useEffect(() => {
    if (!isLoaded || !user) return;
    const timer = setTimeout(() => {
      const prefix = `${user.id}_`;
      const config = getStoredSupabaseConfig(prefix);
      const masterConfig = getStoredSupabaseConfig('');
      const targetUrl = config.url || masterConfig.url;
      const targetKey = config.key || masterConfig.key;

      if (targetUrl && targetKey) {
        const payload: BackupPayload = {
          profile,
          members,
          payments,
          expenses,
          enquiries,
          staff,
          activities
        };
        backupToSupabase(payload, { url: targetUrl, key: targetKey }).catch(err =>
          console.warn('Background auto cloud backup error:', err)
        );
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [profile, members, enquiries, payments, expenses, staff, activities, isLoaded, user?.id]);

  const updateSupabaseConfig = (url: string, key: string, autoSync: boolean) => {
    saveSupabaseConfig(url, key, autoSync, userPrefix);
    setSupabaseConfig(getStoredSupabaseConfig(userPrefix));
  };

  const backupToCloud = async (override?: { url: string; key: string }) => {
    const payload: BackupPayload = {
      profile,
      members,
      payments,
      expenses,
      enquiries,
      staff,
      activities
    };

    const targetUrl = override?.url || supabaseConfig.url;
    const targetKey = override?.key || supabaseConfig.key;

    return backupRelationalTablesToSupabase(payload, { url: targetUrl, key: targetKey });
  };

  const backupMembersToCloud = async () => {
    return backupMembersTable(members, profile.code, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupPaymentsToCloud = async () => {
    return backupPaymentsTable(payments, profile.code, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupExpensesToCloud = async () => {
    return backupExpensesTable(expenses, profile.code, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupEnquiriesToCloud = async () => {
    return backupEnquiriesTable(enquiries, profile.code, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupStaffToCloud = async () => {
    return backupStaffTable(staff, profile.code, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupUsersToCloud = async () => {
    let storedUsers: User[] = [];
    try {
      const raw = localStorage.getItem('rk_fitness_users_v6');
      if (raw) storedUsers = JSON.parse(raw);
    } catch {}
    return backupUsersTable(storedUsers, 'RK-GYM-MASTER', { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const backupMasterSnapshotToCloud = async () => {
    const payload: BackupPayload = { profile, members, payments, expenses, enquiries, staff, activities };
    return backupToSupabase(payload, { url: supabaseConfig.url, key: supabaseConfig.key });
  };

  const restoreFromCloud = async (override?: { url: string; key: string }) => {
    const result = await restoreFromSupabase(override || { url: supabaseConfig.url, key: supabaseConfig.key });
    if (result.success && result.data) {
      if (result.data.profile) setProfile(result.data.profile);
      if (result.data.members) setMembers(result.data.members);
      if (result.data.payments) setPayments(result.data.payments);
      if (result.data.expenses) setExpenses(result.data.expenses);
      if (result.data.enquiries) setEnquiries(result.data.enquiries);
      if (result.data.staff) setStaff(result.data.staff);
      if (result.data.activities) setActivities(result.data.activities);
      return { success: true };
    }
    return { success: false, error: result.error || 'Failed to restore dataset.' };
  };

  const testCloudConnection = async (override?: { url: string; key: string }) => {
    return testSupabaseConnection(override);
  };

  const updateProfile = (updated: Partial<GymProfile>) => {
    // Force gym code to match the isolated account username
    const safeUpdated = { ...updated, code: `RK-GYM-${(user?.username || 'DEFAULT').toUpperCase()}` };
    setProfile((prev) => ({ ...prev, ...safeUpdated }));
  };

  const logActivity = (type: ActivityItem['type'], memberName: string, detail: string, iconType?: ActivityItem['iconType']) => {
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      memberName,
      detail,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      iconType
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 49)]);
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newId = `mem_${Date.now()}`;
    const appNum = memberData.appNumber || `APP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newMember: Member = { ...memberData, id: newId, appNumber: appNum };
    setMembers((prev) => [newMember, ...prev]);

    if (newMember.amountPaid > 0) {
      addPayment({
        memberId: newId,
        memberName: newMember.name,
        amount: newMember.amountPaid,
        plan: newMember.plan,
        paymentMethod: newMember.paymentMethod,
        date: newMember.joinDate,
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    logActivity('joined', newMember.name, `joined — ${newMember.plan}`, 'join');
  };

  const updateMember = (id: string, updated: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updatedMem = { ...m, ...updated };
          logActivity('renewed', updatedMem.name, `updated details (${updatedMem.plan})`, 'join');
          return updatedMem;
        }
        return m;
      })
    );
  };

  const deleteMember = (id: string, reversePayments: boolean = false) => {
    const mem = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    deleteRecordFromSupabase('gym_members', id).catch(err => console.warn('Supabase member delete:', err));
    
    if (reversePayments) {
      const associated = payments.filter((p) => p.memberId === id);
      setPayments((prev) => prev.filter((p) => p.memberId !== id));
      associated.forEach((p) => {
        deleteRecordFromSupabase('gym_payments', p.id).catch(err => console.warn('Supabase payment delete:', err));
      });
    }
    
    if (mem) {
      logActivity('expense', mem.name, `removed from directory`, 'expense');
    }
  };

  const renewMember = (id: string, months: number, paymentMethod: Member['paymentMethod'], amount: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const currentExp = new Date(m.expiryDate);
          const baseDate = currentExp > new Date() ? currentExp : new Date();
          baseDate.setMonth(baseDate.getMonth() + months);
          const newExpiryStr = baseDate.toISOString().split('T')[0];

          const renewed: Member = {
            ...m,
            expiryDate: newExpiryStr,
            status: 'Active',
            amountPaid: m.amountPaid + amount,
            paymentMethod
          };

          addPayment({
            memberId: m.id,
            memberName: m.name,
            amount: amount,
            plan: `${m.plan} (+${months}M renewal)`,
            paymentMethod: paymentMethod,
            date: new Date().toISOString().split('T')[0],
            formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

          logActivity('renewed', m.name, `renewed for ${months} months (₹${amount.toLocaleString()})`, 'payment');
          return renewed;
        }
        return m;
      })
    );
  };

  const addEnquiry = (enquiryData: Omit<Enquiry, 'id' | 'createdAt'>) => {
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
    logActivity('enquiry', newEnquiry.name, `new enquiry via ${newEnquiry.source}`, 'enquiry');
  };

  const updateEnquiryStatus = (id: string, status: EnquiryStatus, notes?: string) => {
    setEnquiries((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, status, notes: notes || eq.notes } : eq))
    );
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((eq) => eq.id !== id));
    deleteRecordFromSupabase('gym_enquiries', id).catch(err => console.warn('Supabase enquiry delete:', err));
  };

  const convertEnquiryToMember = (enquiryId: string, memberData: Omit<Member, 'id'>) => {
    addMember(memberData);
    updateEnquiryStatus(enquiryId, 'Converted', 'Converted to Active Paid Member');
  };

  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      formattedTime: paymentData.formattedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPayments((prev) => [newPayment, ...prev]);
    logActivity('paid', newPayment.memberName, `paid ₹${newPayment.amount.toLocaleString()} (${newPayment.paymentMethod})`, 'payment');
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`
    };
    setExpenses((prev) => [newExpense, ...prev]);
    logActivity('expense', 'Expense Recorded', `${newExpense.title} — ₹${newExpense.amount.toLocaleString()}`, 'expense');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteRecordFromSupabase('gym_expenses', id).catch(err => console.warn('Supabase expense delete:', err));
  };

  const addStaff = (staffData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: `stf_${Date.now()}`
    };
    setStaff((prev) => [...prev, newStaff]);
    logActivity('joined', newStaff.name, `joined staff team as ${newStaff.role}`, 'join');
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    deleteRecordFromSupabase('gym_staff', id).catch(err => console.warn('Supabase staff delete:', err));
  };

  // User-isolated permanent wipe function
  const clearAllData = () => {
    setMembers([]);
    setEnquiries([]);
    setPayments([]);
    setExpenses([]);
    setStaff([]);
    setActivities([]);
    if (user) {
      const prefix = `${user.id}_`;
      try {
        localStorage.removeItem(`${prefix}rk_gym_v2_members`);
        localStorage.removeItem(`${prefix}rk_gym_v2_enquiries`);
        localStorage.removeItem(`${prefix}rk_gym_v2_payments`);
        localStorage.removeItem(`${prefix}rk_gym_v2_expenses`);
        localStorage.removeItem(`${prefix}rk_gym_v2_staff`);
        localStorage.removeItem(`${prefix}rk_gym_v2_activities`);
      } catch {}

      const gymCode = `RK-GYM-${(user.username || 'DEFAULT').toUpperCase()}`;
      clearWorkspaceDataFromSupabase(gymCode).catch(err => console.warn('Supabase workspace wipe:', err));
    }
  };

  const exportDataJSON = () => {
    const data = {
      profile,
      members,
      enquiries,
      payments,
      expenses,
      staff,
      activities,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.members) setMembers(parsed.members);
      if (parsed.enquiries) setEnquiries(parsed.enquiries);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.staff) setStaff(parsed.staff);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.activities) setActivities(parsed.activities);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Calculated Stats for Dashboard & Financials
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'Active').length;
    const expiredMembers = members.filter((m) => m.status === 'Expired').length;
    const trialMembers = members.filter((m) => m.type === 'Trial').length;
    const activeRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7);

    // Revenue
    const todayRevenue = payments
      .filter((p) => p.date === todayStr)
      .reduce((sum, p) => sum + p.amount, 0);

    const thisMonthRevenue = payments
      .filter((p) => p.date && p.date.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + p.amount, 0);

    const allTimeRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Admissions
    const admissionsToday = members.filter((m) => m.joinDate === todayStr).length;

    // Expenses
    const todayExpenses = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);

    const thisMonthExpenses = expenses
      .filter((e) => e.date && e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);

    const allTimeExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Profits
    const todayProfit = todayRevenue - todayExpenses;
    const thisMonthProfit = thisMonthRevenue - thisMonthExpenses;
    const allTimeProfit = allTimeRevenue - allTimeExpenses;

    const totalStaff = staff.length;

    const planCounts: { [key: string]: number } = {};
    members.forEach((m) => {
      const planName = m.plan || 'Other';
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const colors = ['#00d284', '#0099ff', '#ff6b35', '#8b5cf6', '#ec4899', '#f59e0b'];
    let colorIdx = 0;

    const planDistribution = Object.keys(planCounts).map((name) => ({
      name,
      count: planCounts[name],
      percentage: totalMembers > 0 ? Math.round((planCounts[name] / totalMembers) * 100) : 0,
      color: colors[colorIdx++ % colors.length]
    }));

    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      trialMembers,
      activeRate,
      todayRevenue,
      thisMonthRevenue,
      allTimeRevenue,
      admissionsToday,
      todayExpenses,
      thisMonthExpenses,
      allTimeExpenses,
      todayProfit,
      thisMonthProfit,
      allTimeProfit,
      totalStaff,
      planDistribution
    };
  }, [members, payments, expenses, staff]);

  return (
    <GymContext.Provider
      value={{
        profile,
        updateProfile,
        members,
        addMember,
        updateMember,
        deleteMember,
        renewMember,
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        convertEnquiryToMember,
        payments,
        addPayment,
        expenses,
        addExpense,
        deleteExpense,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        activities,
        logActivity,
        stats,
        supabaseConfig,
        updateSupabaseConfig,
        backupToCloud,
        backupMembersToCloud,
        backupPaymentsToCloud,
        backupExpensesToCloud,
        backupEnquiriesToCloud,
        backupStaffToCloud,
        backupUsersToCloud,
        backupMasterSnapshotToCloud,
        restoreFromCloud,
        testCloudConnection,
        clearAllData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
