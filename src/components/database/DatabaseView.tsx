import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CloudUpload,
  CloudDownload,
  Code,
  Copy,
  CheckCircle2,
  AlertCircle,
  Users,
  CreditCard,
  Receipt,
  MessageSquare,
  UserCheck,
  Shield,
  Layers,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import { SUPABASE_SQL_SCHEMA, sanitizeSupabaseUrl } from '../../services/supabaseClient';

export const DatabaseView: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.id === 'usr_admin' || user?.username === 'admin';

  const {
    members,
    payments,
    expenses,
    enquiries,
    staff,
    supabaseConfig,
    updateSupabaseConfig,
    backupToCloud,
    backupMembersToCloud,
    backupPaymentsToCloud,
    backupExpensesToCloud,
    backupEnquiriesToCloud,
    backupStaffToCloud,
    backupUsersToCloud,
    restoreFromCloud,
    testCloudConnection
  } = useGym();

  const [urlInput, setUrlInput] = useState(supabaseConfig.url);
  const [keyInput, setKeyInput] = useState(supabaseConfig.key);
  const [autoSync, setAutoSync] = useState(supabaseConfig.autoSync);

  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean; isSuccess?: boolean } | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [activeSyncingTable, setActiveSyncingTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Auto-check connection status when component mounts or config updates
  useEffect(() => {
    if (supabaseConfig.url && supabaseConfig.key) {
      testCloudConnection({ url: supabaseConfig.url, key: supabaseConfig.key }).then(res => {
        setIsConnected(res.success);
      });
    } else {
      setIsConnected(false);
    }
  }, [supabaseConfig.url, supabaseConfig.key]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUrl = sanitizeSupabaseUrl(urlInput);
    if (!cleanedUrl || !keyInput.trim()) {
      setStatusMsg({ text: 'Please provide a valid Supabase Project URL and Anon Key.', isError: true });
      setIsConnected(false);
      return;
    }

    updateSupabaseConfig(cleanedUrl, keyInput, autoSync);
    
    // Test connection after saving credentials
    setIsTestingConn(true);
    const res = await testCloudConnection({ url: cleanedUrl, key: keyInput });
    setIsTestingConn(false);

    if (res.success) {
      setIsConnected(true);
      setStatusMsg({ text: 'Connected Successfully to Supabase Relational Database!', isSuccess: true });
    } else {
      setIsConnected(false);
      setStatusMsg({ text: res.error || 'Credentials saved, but connection failed.', isError: true });
    }
  };

  const handleTestConn = async () => {
    setIsTestingConn(true);
    setStatusMsg(null);
    const cleanedUrl = sanitizeSupabaseUrl(urlInput);
    if (!cleanedUrl || !keyInput.trim()) {
      setIsTestingConn(false);
      setStatusMsg({ text: 'Please enter both Supabase URL and Anon API Key.', isError: true });
      setIsConnected(false);
      return;
    }
    const res = await testCloudConnection({ url: cleanedUrl, key: keyInput });
    setIsTestingConn(false);
    if (res.success) {
      setIsConnected(true);
      setStatusMsg({ text: 'Connected Successfully to Supabase Relational Database!', isSuccess: true });
    } else {
      setIsConnected(false);
      setStatusMsg({ text: res.error || 'Connection test failed.', isError: true });
    }
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect current Supabase cloud connection and reset API keys?')) {
      updateSupabaseConfig('', '', false);
      setUrlInput('');
      setKeyInput('');
      setIsConnected(false);
      setStatusMsg({ text: 'Disconnected from Supabase. Enter new credentials anytime to connect a different cloud database.', isSuccess: true });
    }
  };

  const handleBackupAllData = async () => {
    setIsLoading(true);
    setActiveSyncingTable('all');
    setStatusMsg(null);
    const res = await backupToCloud();
    setIsLoading(false);
    setActiveSyncingTable(null);
    if (res.success) {
      setStatusMsg({ text: `Master Snapshot Backup (All Data) completed successfully at ${new Date().toLocaleTimeString()}!`, isSuccess: true });
    } else {
      setStatusMsg({ text: res.error || 'Master sync failed.', isError: true });
    }
  };

  const handleSyncTable = async (tableName: string, syncFn: () => Promise<{ success: boolean; error?: string }>) => {
    setIsLoading(true);
    setActiveSyncingTable(tableName);
    setStatusMsg(null);
    const res = await syncFn();
    setIsLoading(false);
    setActiveSyncingTable(null);
    if (res.success) {
      setStatusMsg({ text: `${tableName} Database synced successfully to Supabase!`, isSuccess: true });
    } else {
      setStatusMsg({ text: res.error || `Failed to sync ${tableName}.`, isError: true });
    }
  };

  const handleRestoreNow = async () => {
    if (!window.confirm('Warning: Restoring will overwrite local dataset with cloud snapshot. Proceed?')) return;
    setIsLoading(true);
    setStatusMsg(null);
    const res = await restoreFromCloud();
    setIsLoading(false);
    if (res.success) {
      setStatusMsg({ text: 'Dataset restored successfully from Supabase!', isSuccess: true });
    } else {
      setStatusMsg({ text: res.error || 'Restore failed.', isError: true });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const databaseTables = [
    {
      id: 'gym_members',
      name: 'Gym Members Database',
      description: 'Active and expired member profiles, plans & dates',
      count: `${members.length} Members`,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
      syncFn: backupMembersToCloud
    },
    {
      id: 'gym_payments',
      name: 'Payments & Revenue Database',
      description: 'Transaction ledger, payment methods & dates',
      count: `${payments.length} Payments`,
      icon: CreditCard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      syncFn: backupPaymentsToCloud
    },
    {
      id: 'gym_expenses',
      name: 'Operational Expenses Database',
      description: 'Gym maintenance, rent, utilities & bill costs',
      count: `${expenses.length} Expenses`,
      icon: Receipt,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      btnColor: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
      syncFn: backupExpensesToCloud
    },
    {
      id: 'gym_enquiries',
      name: 'Inquiries & Leads Database',
      description: 'CRM leads, follow-up dates & inquiry status',
      count: `${enquiries.length} Inquiries`,
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      btnColor: 'bg-purple-500 hover:bg-purple-400 text-white',
      syncFn: backupEnquiriesToCloud
    },
    {
      id: 'gym_staff',
      name: 'Staff & Trainers Database',
      description: 'Trainer roster, staff roles & salaries',
      count: `${staff.length} Staff`,
      icon: UserCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      btnColor: 'bg-blue-500 hover:bg-blue-400 text-white',
      syncFn: backupStaffToCloud
    },
    {
      id: 'gym_users',
      name: 'System Users Database',
      description: 'User access levels & passcodes',
      count: 'System Users',
      icon: Shield,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      btnColor: 'bg-pink-500 hover:bg-pink-400 text-white',
      syncFn: backupUsersToCloud
    }
  ];

  const availableTables = databaseTables.filter(db => isAdmin ? true : db.id !== 'gym_users');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Database Backup & Cloud Synchronization</h2>
            <p className="text-xs text-[#8e9db5]">Sync individual database tables separately or perform a complete master snapshot sync</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected === true && (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 font-extrabold text-xs shadow-glow-green animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Connected Successfully</span>
            </div>
          )}

          {isConnected === false && supabaseConfig.url && (
            <div className="px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-2 font-extrabold text-xs">
              <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Disconnected</span>
            </div>
          )}

          <button
            onClick={handleBackupAllData}
            disabled={isLoading || isTestingConn || !supabaseConfig.url}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-glow-green flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            <span>{activeSyncingTable === 'all' ? 'Syncing All Data...' : 'Sync All Data (Master Snapshot)'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
            statusMsg.isSuccess
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-green'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {statusMsg.isSuccess ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  {statusMsg.isSuccess ? 'Connected Successfully!' : 'Database Notice'}
                </span>
                {statusMsg.isSuccess && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 mt-0.5">{statusMsg.text}</p>
            </div>
          </div>

          {statusMsg.isError && (
            <button
              onClick={handleCopySql}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-glow-blue transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Setup Script'}</span>
            </button>
          )}
        </div>
      )}

      {/* Individual Database Tables Sync Section */}
      <div className="glass-card rounded-2xl p-6 border border-[#22324b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-cyan-400" /> Individual Database Tables Sync
            </h3>
            <p className="text-xs text-[#8e9db5] mt-0.5">Select and sync specific database tables to your cloud database</p>
          </div>

          <div className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
            {availableTables.length} Tables Available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {availableTables.map((db) => {
            const Icon = db.icon;
            const isSyncing = activeSyncingTable === db.id;

            return (
              <div
                key={db.id}
                className={`p-5 rounded-2xl bg-[#0f1624] border ${db.borderColor} flex flex-col justify-between space-y-4 transition-all hover:border-opacity-50`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${db.bgColor} ${db.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#8e9db5] bg-[#162032] px-2.5 py-1 rounded-md border border-[#22324b]">
                      {db.count}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm tracking-tight">{db.name}</h4>
                    <p className="text-xs text-[#8e9db5] mt-0.5 line-clamp-2">{db.description}</p>
                  </div>

                  <div className="text-[10px] font-mono text-cyan-400/70 pt-1">
                    Table: <code className="text-cyan-300 font-bold">{db.id}</code>
                  </div>
                </div>

                <button
                  onClick={() => handleSyncTable(db.name, db.syncFn)}
                  disabled={isLoading || isTestingConn || !supabaseConfig.url}
                  className={`w-full py-2.5 rounded-xl ${db.btnColor} font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md`}
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isSyncing ? 'Syncing...' : `Sync ${db.name.split(' ')[0]} Data`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credentials & Restore Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credentials Form */}
        <form onSubmit={handleSaveConfig} className="glass-card rounded-2xl p-6 border border-[#22324b] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" /> Supabase Connection Credentials
            </h3>
            {isConnected === true && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] flex items-center gap-1.5 shadow-glow-green">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected Successfully
              </span>
            )}
          </div>

          {isConnected === true && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-xs text-emerald-300 block">Connected Successfully to Supabase</span>
                <span className="text-[11px] font-mono text-emerald-400/80 truncate block">
                  {supabaseConfig.url || urlInput}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#8e9db5] mb-1">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-[#8e9db5] focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8e9db5] mb-1">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJh..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-[#0f1624] border border-[#22324b] rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder-[#8e9db5] focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoSyncCheck"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded bg-[#0f1624] border-[#22324b]"
            />
            <label htmlFor="autoSyncCheck" className="text-xs font-bold text-white cursor-pointer">
              Enable Real-time Cloud Auto-Sync
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <button
              type="button"
              onClick={handleTestConn}
              disabled={isLoading || isTestingConn}
              className="px-4 py-2.5 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-[#8e9db5] hover:text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isTestingConn && <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>}
              <span>{isTestingConn ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || isTestingConn}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-blue flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isTestingConn && <span className="w-3 h-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>}
              <span>Save & Connect Credentials</span>
            </button>

            {supabaseConfig.url && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isLoading || isTestingConn}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 ml-auto"
              >
                <WifiOff className="w-4 h-4" />
                <span>Disconnect Account</span>
              </button>
            )}
          </div>
        </form>

        {/* Master Snapshot Sync & Restore Panel */}
        <div className="glass-card rounded-2xl p-6 border border-[#22324b] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Master Cloud Backup & Restore
            </h3>

            <p className="text-xs text-[#8e9db5]">
              Perform a complete master snapshot of all 6 gym tables simultaneously, or restore your entire gym dataset from the latest cloud backup.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleBackupAllData}
              disabled={isLoading || !supabaseConfig.url}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-glow-green flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Sync All Data (Master Snapshot)</span>
            </button>

            <button
              onClick={handleRestoreNow}
              disabled={isLoading || !supabaseConfig.url}
              className="w-full py-3 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <CloudDownload className="w-4 h-4" />
              <span>Restore Dataset from Cloud Snapshot</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL Setup Script */}
      <div className="glass-card rounded-2xl p-6 border border-[#22324b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" /> Supabase SQL DDL Setup Script
            </h3>
            <p className="text-xs text-[#8e9db5] mt-0.5">Run this SQL in your Supabase SQL Editor to create required relational tables</p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-blue"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedSql ? 'SQL Script Copied!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <pre className="p-4 bg-[#080b11] rounded-xl text-xs font-mono text-cyan-300 border border-[#22324b] overflow-x-auto max-h-72">
          {SUPABASE_SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
