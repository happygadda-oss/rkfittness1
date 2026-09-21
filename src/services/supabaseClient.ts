import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GymProfile, Member, Enquiry, PaymentRecord, Expense, StaffMember, ActivityItem, User } from '../types';

export interface SupabaseConfig {
  url: string;
  key: string;
  autoSync: boolean;
  lastBackupTime?: string;
}

export interface BackupPayload {
  profile: GymProfile;
  members: Member[];
  payments: PaymentRecord[];
  expenses: Expense[];
  enquiries: Enquiry[];
  staff: StaffMember[];
  activities: ActivityItem[];
  users?: User[];
}

const STORAGE_URL_KEY = 'rk_supabase_url';
const STORAGE_ANON_KEY = 'rk_supabase_key';
const STORAGE_AUTO_SYNC_KEY = 'rk_supabase_auto_sync';
const STORAGE_LAST_BACKUP_KEY = 'rk_supabase_last_backup';

// Auto-clean & format Supabase URL (handles pasted Dashboard URLs gracefully)
export function sanitizeSupabaseUrl(inputUrl: string): string {
  let cleaned = inputUrl.trim();
  if (!cleaned) return '';

  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  return cleaned.replace(/\/+$/, '');
}

const DEFAULT_MASTER_URL = 'https://ysivilhdyryyhtprtmem.supabase.co';
const DEFAULT_MASTER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzaXZpbGhkeXJ5eWh0cHJ0bWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzYwMTEsImV4cCI6MjEwNDgxMjAxMX0.X8TaF14JkSq2H7GmKmJCVijoqbpbcQ8j0-Cg7KrXeAc';

export function getStoredSupabaseConfig(userPrefix?: string): SupabaseConfig {
  const prefix = userPrefix || '';
  const rawUrl = localStorage.getItem(prefix + STORAGE_URL_KEY) || localStorage.getItem(STORAGE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || DEFAULT_MASTER_URL;
  const url = sanitizeSupabaseUrl(rawUrl);
  const key = (localStorage.getItem(prefix + STORAGE_ANON_KEY) || localStorage.getItem(STORAGE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_MASTER_KEY).trim();
  const autoSync = true;
  const lastBackupTime = localStorage.getItem(prefix + STORAGE_LAST_BACKUP_KEY) || localStorage.getItem(STORAGE_LAST_BACKUP_KEY) || undefined;

  return { url, key, autoSync, lastBackupTime };
}

export function saveSupabaseConfig(url: string, key: string, autoSync: boolean, userPrefix?: string) {
  const prefix = userPrefix || '';
  const sanitizedUrl = sanitizeSupabaseUrl(url);
  const cleanKey = key.trim();

  // Save to account-scoped keys
  if (prefix) {
    localStorage.setItem(prefix + STORAGE_URL_KEY, sanitizedUrl);
    localStorage.setItem(prefix + STORAGE_ANON_KEY, cleanKey);
    localStorage.setItem(prefix + STORAGE_AUTO_SYNC_KEY, String(autoSync));
  }

  // Also save to global/root keys for universal fallback across logins
  localStorage.setItem(STORAGE_URL_KEY, sanitizedUrl);
  localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
  localStorage.setItem(STORAGE_AUTO_SYNC_KEY, String(autoSync));
}

export function createCustomSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const sanitizedUrl = sanitizeSupabaseUrl(url || config.url);
  const cleanKey = (key || config.key) ? (key || config.key).trim() : '';
  if (!sanitizedUrl || !cleanKey) return null;
  try {
    return createClient(sanitizedUrl, cleanKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(override?: { url: string; key: string }): Promise<{ success: boolean; error?: string }> {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) {
    return { success: false, error: 'Invalid Supabase URL or Anon API key format.' };
  }

  try {
    const { error } = await client.from('gym_backups').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'Connected to Supabase, but database tables are missing! Please copy and run the SQL Setup Script in your Supabase SQL Editor.'
        };
      }
      if (error.message?.includes('FetchError') || error.message?.includes('Failed to fetch')) {
        return { success: false, error: 'Could not connect to Supabase host. Please check URL and API Key.' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection test failed.' };
  }
}

export async function backupRelationalTablesToSupabase(payload: BackupPayload, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials configured.' };

  const gymCode = payload.profile.code || 'RK-GYM-DEFAULT';
  const nowIso = new Date().toISOString();
  const errors: string[] = [];

  // 1. Members Table
  if (payload.members && payload.members.length > 0) {
    const rows = payload.members.map(m => ({
      id: m.id,
      gym_code: gymCode,
      name: m.name,
      phone: m.phone,
      email: m.email || null,
      type: m.type,
      plan: m.plan,
      join_date: m.joinDate,
      expiry_date: m.expiryDate,
      payment_method: m.paymentMethod,
      amount_paid: m.amountPaid,
      status: m.status,
      app_number: m.appNumber || null,
      notes: m.notes || null,
      gender: m.gender || null,
      updated_at: nowIso
    }));
    const { error: errMembers } = await client.from('gym_members').upsert(rows);
    if (errMembers) {
      errors.push(
        errMembers.code === '42P01' || errMembers.message?.includes('does not exist')
          ? 'Table "gym_members" missing'
          : errMembers.message?.includes('invalid input syntax for type uuid')
          ? 'gym_members ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_members: ${errMembers.message}`
      );
    }
  }

  // 2. Payments Table
  if (payload.payments && payload.payments.length > 0) {
    const rows = payload.payments.map(p => ({
      id: p.id,
      gym_code: gymCode,
      member_id: p.memberId,
      member_name: p.memberName,
      amount: p.amount,
      plan: p.plan,
      payment_method: p.paymentMethod,
      payment_date: p.date || new Date().toISOString().split('T')[0],
      date: p.date || new Date().toISOString().split('T')[0],
      formatted_time: p.formattedTime || null,
      updated_at: nowIso
    }));
    const { error: errPayments } = await client.from('gym_payments').upsert(rows);
    if (errPayments) {
      errors.push(
        errPayments.code === '42P01' || errPayments.message?.includes('does not exist')
          ? 'Table "gym_payments" missing'
          : errPayments.message?.includes('invalid input syntax for type uuid')
          ? 'gym_payments ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_payments: ${errPayments.message}`
      );
    }
  }

  // 3. Expenses Table
  if (payload.expenses && payload.expenses.length > 0) {
    const rows = payload.expenses.map(e => ({
      id: e.id,
      gym_code: gymCode,
      title: e.title,
      category: e.category,
      amount: e.amount,
      expense_date: e.date || new Date().toISOString().split('T')[0],
      date: e.date || new Date().toISOString().split('T')[0],
      notes: e.notes || null,
      updated_at: nowIso
    }));
    const { error: errExpenses } = await client.from('gym_expenses').upsert(rows);
    if (errExpenses) {
      errors.push(
        errExpenses.code === '42P01' || errExpenses.message?.includes('does not exist')
          ? 'Table "gym_expenses" missing'
          : errExpenses.message?.includes('invalid input syntax for type uuid')
          ? 'gym_expenses ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_expenses: ${errExpenses.message}`
      );
    }
  }

  // 4. Enquiries Table
  if (payload.enquiries && payload.enquiries.length > 0) {
    const rows = payload.enquiries.map(eq => ({
      id: eq.id,
      gym_code: gymCode,
      name: eq.name,
      phone: eq.phone,
      email: eq.email || null,
      plan_interest: eq.planInterest,
      source: eq.source,
      status: eq.status,
      created_at: eq.createdAt,
      follow_up_date: eq.followUpDate || null,
      notes: eq.notes || null,
      updated_at: nowIso
    }));
    const { error: errEnquiries } = await client.from('gym_enquiries').upsert(rows);
    if (errEnquiries) {
      errors.push(
        errEnquiries.code === '42P01' || errEnquiries.message?.includes('does not exist')
          ? 'Table "gym_enquiries" missing'
          : errEnquiries.message?.includes('invalid input syntax for type uuid')
          ? 'gym_enquiries ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_enquiries: ${errEnquiries.message}`
      );
    }
  }

  // 5. Staff Table
  if (payload.staff && payload.staff.length > 0) {
    const rows = payload.staff.map(s => ({
      id: s.id,
      gym_code: gymCode,
      name: s.name,
      role: s.role,
      phone: s.phone,
      email: s.email,
      salary: s.salary,
      status: s.status,
      join_date: s.joinDate,
      updated_at: nowIso
    }));
    const { error: errStaff } = await client.from('gym_staff').upsert(rows);
    if (errStaff) {
      errors.push(
        errStaff.code === '42P01' || errStaff.message?.includes('does not exist')
          ? 'Table "gym_staff" missing'
          : errStaff.message?.includes('invalid input syntax for type uuid')
          ? 'gym_staff ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_staff: ${errStaff.message}`
      );
    }
  }

  // 6. Users Table
  if (payload.users && payload.users.length > 0) {
    const rows = payload.users.map(u => ({
      id: u.id,
      gym_code: gymCode,
      username: u.username,
      name: u.name,
      role: u.role,
      email: u.email || null,
      password_hash: u.passwordHash || '',
      updated_at: nowIso
    }));
    const { error: errUsers } = await client.from('gym_users').upsert(rows);
    if (errUsers) {
      errors.push(
        errUsers.code === '42P01' || errUsers.message?.includes('does not exist')
          ? 'Table "gym_users" missing'
          : errUsers.message?.includes('invalid input syntax for type uuid')
          ? 'gym_users ID type is UUID (needs TEXT). Run updated SQL script!'
          : `gym_users: ${errUsers.message}`
      );
    }
  }

  // 7. Master Snapshot Backup (gym_backups)
  const membersCount = payload.members?.length || 0;
  const activeMembersCount = payload.members?.filter(m => m.status === 'Active' || (m.status as string) === 'active')?.length || 0;
  const paymentsCount = payload.payments?.length || 0;
  const expensesCount = payload.expenses?.length || 0;
  const enquiriesCount = payload.enquiries?.length || 0;
  const staffCount = payload.staff?.length || 0;
  const usersCount = payload.users?.length || 0;
  const totalRevenue = payload.payments && payload.payments.length > 0
    ? payload.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : payload.members?.reduce((sum, m) => sum + (Number(m.amountPaid) || 0), 0) || 0;

  let backupRecord: Record<string, any> = {
    id: `${gymCode}_master`,
    gym_code: gymCode,
    gym_name: payload.profile.name,
    payload: payload,
    snapshot_data: payload,
    members_count: membersCount,
    member_count: membersCount,
    total_members: membersCount,
    active_members: activeMembersCount,
    payments_count: paymentsCount,
    total_payments: paymentsCount,
    expenses_count: expensesCount,
    total_expenses: expensesCount,
    enquiries_count: enquiriesCount,
    total_enquiries: enquiriesCount,
    staff_count: staffCount,
    total_staff: staffCount,
    users_count: usersCount,
    total_users: usersCount,
    total_revenue: totalRevenue,
    revenue: totalRevenue,
    created_at: nowIso,
    updated_at: nowIso
  };

  let errBackup: any = null;
  // Dynamically strip any missing column names from backupRecord if Supabase PostgREST rejects them
  for (let attempt = 0; attempt < 15; attempt++) {
    const res = await client.from('gym_backups').upsert(backupRecord);
    errBackup = res.error;
    if (!errBackup) break;

    const errMsg = errBackup.message || '';
    const match = errMsg.match(/Could not find the '([^']+)' column/i) || errMsg.match(/column "([^"]+)" of relation "gym_backups" does not exist/i);
    if (match && match[1] && backupRecord[match[1]] !== undefined) {
      delete backupRecord[match[1]];
      continue;
    }

    if (errMsg.includes("Could not find the 'payload' column") || errMsg.includes('invalid input syntax for type uuid') || errBackup.code === '42P01') {
      break;
    }

    // Fallback: strip unknown count columns keeping standard keys
    const safeKeys = ['id', 'gym_code', 'gym_name', 'payload', 'snapshot_data', 'members_count', 'total_revenue', 'updated_at'];
    let removedAny = false;
    Object.keys(backupRecord).forEach(k => {
      if (!safeKeys.includes(k)) {
        delete backupRecord[k];
        removedAny = true;
      }
    });
    if (!removedAny) break;
  }

  if (errBackup) {
    if (errBackup.message?.includes("Could not find the 'payload' column") || errBackup.code === '42P01') {
      errors.push('Table "gym_backups" missing "payload" column. Please run the SQL Setup Script in Supabase.');
    } else if (errBackup.message?.includes('invalid input syntax for type uuid')) {
      errors.push('Table "gym_backups" ID column is UUID (needs TEXT). Please copy & run the updated SQL Setup Script in Supabase!');
    } else {
      errors.push(`gym_backups: ${errBackup.message}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: `Supabase Error: ${errors.join('; ')}. Please copy & run the updated SQL Setup Script in your Supabase SQL Editor!`
    };
  }

  localStorage.setItem(STORAGE_LAST_BACKUP_KEY, nowIso);
  return { success: true, timestamp: nowIso };
}

export async function backupMembersTable(members: Member[], gymCode: string, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  const nowIso = new Date().toISOString();
  const rows = members.map(m => ({
    id: m.id,
    gym_code: gymCode,
    name: m.name,
    phone: m.phone,
    email: m.email || null,
    type: m.type,
    plan: m.plan,
    join_date: m.joinDate,
    expiry_date: m.expiryDate,
    payment_method: m.paymentMethod,
    amount_paid: m.amountPaid,
    status: m.status,
    app_number: m.appNumber || null,
    notes: m.notes || null,
    gender: m.gender || null,
    updated_at: nowIso
  }));
  const { error } = await client.from('gym_members').upsert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function backupPaymentsTable(payments: PaymentRecord[], gymCode: string, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  const nowIso = new Date().toISOString();
  const rows = payments.map(p => ({
    id: p.id,
    gym_code: gymCode,
    member_id: p.memberId,
    member_name: p.memberName,
    amount: p.amount,
    plan: p.plan,
    payment_method: p.paymentMethod,
    payment_date: p.date || new Date().toISOString().split('T')[0],
    date: p.date || new Date().toISOString().split('T')[0],
    formatted_time: p.formattedTime || null,
    updated_at: nowIso
  }));
  const { error } = await client.from('gym_payments').upsert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function backupExpensesTable(expenses: Expense[], gymCode: string, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  const nowIso = new Date().toISOString();
  const rows = expenses.map(e => ({
    id: e.id,
    gym_code: gymCode,
    title: e.title,
    category: e.category,
    amount: e.amount,
    expense_date: e.date || new Date().toISOString().split('T')[0],
    date: e.date || new Date().toISOString().split('T')[0],
    notes: e.notes || null,
    updated_at: nowIso
  }));
  const { error } = await client.from('gym_expenses').upsert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function backupEnquiriesTable(enquiries: Enquiry[], gymCode: string, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  const nowIso = new Date().toISOString();
  const rows = enquiries.map(eq => ({
    id: eq.id,
    gym_code: gymCode,
    name: eq.name,
    phone: eq.phone,
    email: eq.email || null,
    plan_interest: eq.planInterest,
    source: eq.source,
    status: eq.status,
    created_at: eq.createdAt,
    follow_up_date: eq.followUpDate || null,
    notes: eq.notes || null,
    updated_at: nowIso
  }));
  const { error } = await client.from('gym_enquiries').upsert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function backupStaffTable(staff: StaffMember[], gymCode: string, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  const nowIso = new Date().toISOString();
  const rows = staff.map(s => ({
    id: s.id,
    gym_code: gymCode,
    name: s.name,
    role: s.role,
    phone: s.phone,
    email: s.email,
    salary: s.salary,
    status: s.status,
    join_date: s.joinDate,
    updated_at: nowIso
  }));
  const { error } = await client.from('gym_staff').upsert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function backupUsersTable(users: User[], gymCode: string, override?: { url: string; key: string }) {
  const currentConfig = getStoredSupabaseConfig();
  const mainAdminConfig = getStoredSupabaseConfig('');
  const targetUrl = override?.url || currentConfig.url || mainAdminConfig.url;
  const targetKey = override?.key || currentConfig.key || mainAdminConfig.key;

  const client = createCustomSupabaseClient(targetUrl, targetKey);
  if (!client) return { success: false, error: 'Main Admin Supabase credentials not configured. Please save your Supabase URL & Key first.' };

  const nowIso = new Date().toISOString();
  const rows = users.map(u => ({
    id: u.id,
    gym_code: gymCode || 'RK-GYM-MASTER',
    username: u.username,
    name: u.name,
    role: u.role,
    email: u.email || null,
    password_hash: u.passwordHash || '',
    password: u.passwordHash || '',
    updated_at: nowIso
  }));

  let currentRows = rows;
  let errUsers: any = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await client.from('gym_users').upsert(currentRows);
    errUsers = res.error;
    if (!errUsers) break;

    const errMsg = errUsers.message || '';
    const match = errMsg.match(/Could not find the '([^']+)' column/i) || errMsg.match(/column "([^"]+)" of relation "gym_users" does not exist/i);
    if (match && match[1]) {
      const col = match[1];
      currentRows = currentRows.map(r => {
        const copy = { ...r };
        delete (copy as any)[col];
        return copy;
      });
      continue;
    }
    break;
  }

  if (errUsers) {
    let errMsg = errUsers.message || '';
    if (errMsg.includes('invalid input syntax for type uuid')) {
       errMsg = 'The gym_users ID column in Supabase is set to UUID, but needs to be TEXT. Please update your Supabase table schema.';
    }
    return { success: false, error: errMsg };
  }

  return { success: true };
}

export async function deleteRecordFromSupabase(
  tableName: 'gym_members' | 'gym_payments' | 'gym_expenses' | 'gym_enquiries' | 'gym_staff',
  recordId: string,
  override?: { url: string; key: string }
): Promise<{ success: boolean; error?: string }> {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };

  try {
    const { error } = await client.from(tableName).delete().eq('id', recordId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || `Failed to delete record from ${tableName}.` };
  }
}

export async function deleteUserAccountFromSupabase(
  userId: string,
  username: string,
  override?: { url: string; key: string }
): Promise<{ success: boolean; error?: string }> {
  const currentConfig = getStoredSupabaseConfig();
  const mainAdminConfig = getStoredSupabaseConfig('');
  const targetUrl = override?.url || currentConfig.url || mainAdminConfig.url;
  const targetKey = override?.key || currentConfig.key || mainAdminConfig.key;

  const client = createCustomSupabaseClient(targetUrl, targetKey);
  if (!client) return { success: false, error: 'No Supabase credentials.' };

  try {
    // 1. Delete user account record from gym_users
    if (userId) await client.from('gym_users').delete().eq('id', userId);
    if (username) await client.from('gym_users').delete().eq('username', username.trim().toLowerCase());

    // 2. Delete all isolated workspace data & backups for this user's gym_code from Supabase
    const gymCode = `RK-GYM-${username.toUpperCase()}`;
    await Promise.allSettled([
      client.from('gym_members').delete().eq('gym_code', gymCode),
      client.from('gym_payments').delete().eq('gym_code', gymCode),
      client.from('gym_expenses').delete().eq('gym_code', gymCode),
      client.from('gym_enquiries').delete().eq('gym_code', gymCode),
      client.from('gym_staff').delete().eq('gym_code', gymCode),
      client.from('gym_backups').delete().eq('gym_code', gymCode),
      client.from('gym_backups').delete().eq('id', gymCode)
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete user account from Supabase.' };
  }
}

export async function clearWorkspaceDataFromSupabase(
  gymCode: string,
  override?: { url: string; key: string }
): Promise<{ success: boolean; error?: string }> {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };

  try {
    await Promise.allSettled([
      client.from('gym_members').delete().eq('gym_code', gymCode),
      client.from('gym_payments').delete().eq('gym_code', gymCode),
      client.from('gym_expenses').delete().eq('gym_code', gymCode),
      client.from('gym_enquiries').delete().eq('gym_code', gymCode),
      client.from('gym_staff').delete().eq('gym_code', gymCode),
      client.from('gym_backups').delete().eq('gym_code', gymCode),
      client.from('gym_backups').delete().eq('id', gymCode)
    ]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to clear workspace data from Supabase.' };
  }
}

export async function fetchUsersFromSupabase(override?: { url: string; key: string }): Promise<{ success: boolean; users?: User[]; error?: string }> {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };
  try {
    const { data, error } = await client.from('gym_users').select('*');
    if (error) return { success: false, error: error.message };
    const users: User[] = (data || []).map((row: any) => ({
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role || 'owner',
      email: row.email || '',
      passwordHash: row.password_hash || row.password || '',
      createdAt: row.updated_at
    }));
    return { success: true, users };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch users from Supabase.' };
  }
}

export async function backupToSupabase(payload: BackupPayload, override?: { url: string; key: string }) {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (client) {
    const gymCode = payload.profile?.code || 'RK-GYM-DEFAULT';
    await client.from('gym_backups').upsert({
      id: gymCode,
      gym_code: gymCode,
      gym_name: payload.profile?.name || 'Gym',
      payload: payload,
      updated_at: new Date().toISOString()
    });
  }
  return backupRelationalTablesToSupabase(payload, override);
}

export async function fetchRelationalDataFromSupabase(gymCode?: string, override?: { url: string; key: string }): Promise<{ success: boolean; data?: Partial<BackupPayload>; error?: string }> {
  const client = createCustomSupabaseClient(override?.url, override?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };

  try {
    const resultPayload: Partial<BackupPayload> = {};

    const fetchTableRows = async (tableName: string) => {
      if (gymCode) {
        const { data: matched } = await client.from(tableName).select('*').eq('gym_code', gymCode);
        return matched || [];
      }
      return [];
    };

    // 1. Members
    const mData = await fetchTableRows('gym_members');
    if (mData && mData.length > 0) {
      resultPayload.members = mData.map((m: any) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        email: m.email || '',
        type: m.type,
        plan: m.plan,
        joinDate: m.join_date,
        expiryDate: m.expiry_date,
        paymentMethod: m.payment_method,
        amountPaid: Number(m.amount_paid) || 0,
        status: m.status,
        appNumber: m.app_number || '',
        notes: m.notes || '',
        gender: m.gender || undefined
      }));
    }

    // 2. Payments
    const pData = await fetchTableRows('gym_payments');
    if (pData && pData.length > 0) {
      resultPayload.payments = pData.map((p: any) => ({
        id: p.id,
        memberId: p.member_id,
        memberName: p.member_name,
        amount: Number(p.amount) || 0,
        plan: p.plan,
        paymentMethod: p.payment_method,
        date: p.payment_date || p.date,
        formattedTime: p.formatted_time || ''
      }));
    }

    // 3. Expenses
    const eData = await fetchTableRows('gym_expenses');
    if (eData && eData.length > 0) {
      resultPayload.expenses = eData.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        amount: Number(e.amount) || 0,
        date: e.expense_date || e.date,
        notes: e.notes || ''
      }));
    }

    // 4. Enquiries
    const eqData = await fetchTableRows('gym_enquiries');
    if (eqData && eqData.length > 0) {
      resultPayload.enquiries = eqData.map((eq: any) => ({
        id: eq.id,
        name: eq.name,
        phone: eq.phone,
        email: eq.email || '',
        planInterest: eq.plan_interest,
        source: eq.source,
        status: eq.status,
        createdAt: eq.created_at,
        followUpDate: eq.follow_up_date || '',
        notes: eq.notes || ''
      }));
    }

    // 5. Staff
    const sData = await fetchTableRows('gym_staff');
    if (sData && sData.length > 0) {
      resultPayload.staff = sData.map((s: any) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        phone: s.phone,
        email: s.email,
        salary: Number(s.salary) || 0,
        status: s.status,
        joinDate: s.join_date
      }));
    }

    return { success: true, data: resultPayload };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function restoreFromSupabase(
  gymCodeOrOverride?: string | { url: string; key: string },
  override?: { url: string; key: string }
): Promise<{ success: boolean; data?: BackupPayload; error?: string }> {
  let targetGymCode: string | undefined;
  let targetOverride = override;

  if (typeof gymCodeOrOverride === 'string') {
    targetGymCode = gymCodeOrOverride;
  } else if (gymCodeOrOverride && typeof gymCodeOrOverride === 'object') {
    targetOverride = gymCodeOrOverride;
  }

  const client = createCustomSupabaseClient(targetOverride?.url, targetOverride?.key);
  if (!client) return { success: false, error: 'No Supabase credentials.' };

  try {
    let payloadData: BackupPayload | null = null;

    // 1. Try fetching from gym_backups by targetGymCode first
    if (targetGymCode) {
      const { data: matchedData } = await client
        .from('gym_backups')
        .select('*')
        .eq('gym_code', targetGymCode)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (matchedData && (matchedData.payload || matchedData.snapshot_data)) {
        payloadData = (matchedData.payload || matchedData.snapshot_data) as BackupPayload;
      }
    }

    // Fallback: If no match by targetGymCode, grab latest backup snapshot overall
    if (!payloadData) {
      const { data: latestData } = await client
        .from('gym_backups')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestData && (latestData.payload || latestData.snapshot_data)) {
        payloadData = (latestData.payload || latestData.snapshot_data) as BackupPayload;
      }
    }

    // 2. Fetch relational tables (with fallback) and merge to ensure all members & payments are present
    const relRes = await fetchRelationalDataFromSupabase(targetGymCode, targetOverride);
    if (relRes.success && relRes.data) {
      const rel = relRes.data;
      if (!payloadData) {
        payloadData = {
          profile: {
            name: 'Rk Fitness World',
            code: targetGymCode || 'RK-GYM-DEFAULT',
            ownerName: 'RK Admin',
            email: 'owner@rkfitnessworld.com',
            phone: '+919876543210',
            currency: '₹',
            whatsappReminderTemplate: 'Hello {NAME}, your membership for {PLAN} at Rk Fitness World is expiring on {EXPIRY}. Please renew to continue your workout regime!',
            plans: []
          },
          members: rel.members || [],
          payments: rel.payments || [],
          expenses: rel.expenses || [],
          enquiries: rel.enquiries || [],
          staff: rel.staff || [],
          activities: rel.activities || []
        };
      } else {
        if (rel.members && rel.members.length > 0) payloadData.members = rel.members;
        if (rel.payments && rel.payments.length > 0) payloadData.payments = rel.payments;
        if (rel.expenses && rel.expenses.length > 0) payloadData.expenses = rel.expenses;
        if (rel.enquiries && rel.enquiries.length > 0) payloadData.enquiries = rel.enquiries;
        if (rel.staff && rel.staff.length > 0) payloadData.staff = rel.staff;
      }
    }

    if (payloadData) {
      return { success: true, data: payloadData };
    }

    return { success: false, error: 'No data found in Supabase for this account.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Restore failed.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Copy & paste this SQL script into your Supabase SQL Editor to create/update tables:

-- 1. Master Backup JSON Snapshot Table
CREATE TABLE IF NOT EXISTS public.gym_backups (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    gym_name TEXT NOT NULL,
    payload JSONB NOT NULL,
    snapshot_data JSONB,
    members_count INT DEFAULT 0,
    active_members INT DEFAULT 0,
    payments_count INT DEFAULT 0,
    expenses_count INT DEFAULT 0,
    enquiries_count INT DEFAULT 0,
    staff_count INT DEFAULT 0,
    users_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS snapshot_data JSONB;
ALTER TABLE public.gym_backups ALTER COLUMN snapshot_data DROP NOT NULL;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS gym_name TEXT;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS members_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_members INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS active_members INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS payments_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_payments INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS expenses_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_expenses INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS enquiries_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_enquiries INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS staff_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_staff INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS users_count INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_users INT DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS revenue NUMERIC DEFAULT 0;
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.gym_backups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Gym Members Table
CREATE TABLE IF NOT EXISTS public.gym_members (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    type TEXT NOT NULL,
    plan TEXT NOT NULL,
    join_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    status TEXT NOT NULL,
    app_number TEXT,
    notes TEXT,
    gender TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS join_date TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS expiry_date TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS app_number TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.gym_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Payment Records Table
CREATE TABLE IF NOT EXISTS public.gym_payments (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    plan TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date TEXT,
    date TEXT,
    formatted_time TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS member_name TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS payment_date TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS formatted_time TEXT;
ALTER TABLE public.gym_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.gym_payments ALTER COLUMN payment_date DROP NOT NULL;
ALTER TABLE public.gym_payments ALTER COLUMN date DROP NOT NULL;

-- 4. Expenses Log Table
CREATE TABLE IF NOT EXISTS public.gym_expenses (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    expense_date TEXT,
    date TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS expense_date TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.gym_expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.gym_expenses ALTER COLUMN expense_date DROP NOT NULL;
ALTER TABLE public.gym_expenses ALTER COLUMN date DROP NOT NULL;

-- 5. Enquiries CRM Table
CREATE TABLE IF NOT EXISTS public.gym_enquiries (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    plan_interest TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    follow_up_date TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS plan_interest TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS follow_up_date TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.gym_enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Staff Roster Table
CREATE TABLE IF NOT EXISTS public.gym_staff (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    salary NUMERIC DEFAULT 0,
    status TEXT NOT NULL,
    join_date TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS join_date TEXT;
ALTER TABLE public.gym_staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 7. User Accounts & Passcodes Table
CREATE TABLE IF NOT EXISTS public.gym_users (
    id TEXT PRIMARY KEY,
    gym_code TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS gym_code TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.gym_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure ID columns are TEXT (in case tables were created with UUID type)
ALTER TABLE public.gym_backups ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_members ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_payments ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_expenses ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_enquiries ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_staff ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.gym_users ALTER COLUMN id TYPE TEXT USING id::text;

-- Enable RLS & Configure Public Access Policies
ALTER TABLE public.gym_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on gym_backups" ON public.gym_backups;
DROP POLICY IF EXISTS "Allow public all on gym_members" ON public.gym_members;
DROP POLICY IF EXISTS "Allow public all on gym_payments" ON public.gym_payments;
DROP POLICY IF EXISTS "Allow public all on gym_expenses" ON public.gym_expenses;
DROP POLICY IF EXISTS "Allow public all on gym_enquiries" ON public.gym_enquiries;
DROP POLICY IF EXISTS "Allow public all on gym_staff" ON public.gym_staff;
DROP POLICY IF EXISTS "Allow public all on gym_users" ON public.gym_users;

CREATE POLICY "Allow public all on gym_backups" ON public.gym_backups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_members" ON public.gym_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_payments" ON public.gym_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_expenses" ON public.gym_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_enquiries" ON public.gym_enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_staff" ON public.gym_staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on gym_users" ON public.gym_users FOR ALL USING (true) WITH CHECK (true);

-- Grant All Privileges to public roles & reload PostgREST schema cache
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
NOTIFY pgrst, 'reload schema';
`;
