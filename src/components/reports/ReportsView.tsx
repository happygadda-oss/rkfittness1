import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  Receipt,
  Users,
  MessageSquare,
  UserCheck,
  Calendar,
  Filter,
  BarChart3,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { useGym } from '../../context/GymContext';

export const ReportsView: React.FC = () => {
  const { profile, stats, members, payments, expenses, enquiries, staff, exportDataJSON } = useGym();
  const [reportPeriod, setReportPeriod] = useState<'month' | 'all'>('month');

  // --- CSV Exporter ---
  const handleExportCSV = (type: 'members' | 'payments' | 'expenses' | 'enquiries' | 'staff') => {
    let headers = '';
    let rows: string[] = [];
    let filename = `rk_fitness_${type}_report.csv`;

    if (type === 'members') {
      headers = 'ID,Name,Phone,Email,Plan,Type,JoinDate,ExpiryDate,Status,AmountPaid,PaymentMethod\n';
      rows = members.map(m => `"${m.id}","${m.name}","${m.phone}","${m.email || ''}","${m.plan}","${m.type}","${m.joinDate}","${m.expiryDate}","${m.status}",${m.amountPaid},"${m.paymentMethod}"`);
    } else if (type === 'payments') {
      headers = 'PaymentID,MemberID,MemberName,Amount,Plan,Method,Date,FormattedTime\n';
      rows = payments.map(p => `"${p.id}","${p.memberId}","${p.memberName}",${p.amount},"${p.plan}","${p.paymentMethod}","${p.date}","${p.formattedTime || ''}"`);
    } else if (type === 'expenses') {
      headers = 'ExpenseID,Title,Category,Amount,Date,Notes\n';
      rows = expenses.map(e => `"${e.id}","${e.title}","${e.category}",${e.amount},"${e.date}","${e.notes || ''}"`);
    } else if (type === 'enquiries') {
      headers = 'EnquiryID,Name,Phone,Email,PlanInterest,Source,Status,CreatedAt,FollowUpDate,Notes\n';
      rows = enquiries.map(eq => `"${eq.id}","${eq.name}","${eq.phone}","${eq.email || ''}","${eq.planInterest}","${eq.source}","${eq.status}","${eq.createdAt}","${eq.followUpDate || ''}","${eq.notes || ''}"`);
    } else if (type === 'staff') {
      headers = 'StaffID,Name,Role,Phone,Email,Salary,Status,JoinDate\n';
      rows = staff.map(s => `"${s.id}","${s.name}","${s.role}","${s.phone}","${s.email}","${s.salary}","${s.status}","${s.joinDate}"`);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Excel / TSV Exporter ---
  const handleExportExcel = (type: 'members' | 'payments' | 'expenses' | 'enquiries' | 'staff') => {
    let tsvHeader = '';
    let rows: string[] = [];
    let filename = `rk_fitness_${type}_statement.xls`;

    if (type === 'members') {
      tsvHeader = 'Member ID\tFull Name\tPhone Number\tEmail\tPlan\tType\tJoin Date\tExpiry Date\tStatus\tAmount Paid (INR)\tPayment Method\n';
      rows = members.map(m => `${m.id}\t${m.name}\t${m.phone}\t${m.email || ''}\t${m.plan}\t${m.type}\t${m.joinDate}\t${m.expiryDate}\t${m.status}\t${m.amountPaid}\t${m.paymentMethod}`);
    } else if (type === 'payments') {
      tsvHeader = 'Payment ID\tMember ID\tMember Name\tAmount (INR)\tPlan\tPayment Method\tDate\tTime\n';
      rows = payments.map(p => `${p.id}\t${p.memberId}\t${p.memberName}\t${p.amount}\t${p.plan}\t${p.paymentMethod}\t${p.date}\t${p.formattedTime || ''}`);
    } else if (type === 'expenses') {
      tsvHeader = 'Expense ID\tTitle\tCategory\tAmount (INR)\tExpense Date\tNotes\n';
      rows = expenses.map(e => `${e.id}\t${e.title}\t${e.category}\t${e.amount}\t${e.date}\t${e.notes || ''}`);
    } else if (type === 'enquiries') {
      tsvHeader = 'Inquiry ID\tFull Name\tPhone Number\tEmail\tPlan Interest\tSource\tStatus\tCreated At\tFollow Up Date\tNotes\n';
      rows = enquiries.map(eq => `${eq.id}\t${eq.name}\t${eq.phone}\t${eq.email || ''}\t${eq.planInterest}\t${eq.source}\t${eq.status}\t${eq.createdAt}\t${eq.followUpDate || ''}\t${eq.notes || ''}`);
    } else if (type === 'staff') {
      tsvHeader = 'Staff ID\tFull Name\tRole\tPhone Number\tEmail\tSalary (INR)\tStatus\tJoin Date\n';
      rows = staff.map(s => `${s.id}\t${s.name}\t${s.role}\t${s.phone}\t${s.email}\t${s.salary}\t${s.status}\t${s.joinDate}`);
    }

    const blob = new Blob([tsvHeader + rows.join('\n')], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- JSON Backup Exporter ---
  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rk_fitness_full_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // --- Printable PDF Statement Helper ---
  const handlePrintPDF = (section: 'members' | 'payments' | 'expenses' | 'enquiries' | 'staff' | 'summary') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print/download PDF statement.');
      return;
    }

    const gymName = profile.name || 'Rk Fitness World';
    const gymCode = profile.code || 'RK-GYM-DEFAULT';
    const currentDate = new Date().toLocaleString();

    let reportTitle = '';
    let tableHeaders = '';
    let tableRows = '';
    let contentHtml = '';

    if (section === 'members') {
      reportTitle = 'Gym Members Directory Report';
      tableHeaders = `
        <th>Member Name</th>
        <th>Phone</th>
        <th>Plan</th>
        <th>Type</th>
        <th>Join Date</th>
        <th>Expiry Date</th>
        <th>Status</th>
        <th>Paid (₹)</th>
      `;
      tableRows = members.length > 0 ? members.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.phone}</td>
          <td>${m.plan}</td>
          <td>${m.type}</td>
          <td>${m.joinDate}</td>
          <td>${m.expiryDate}</td>
          <td><span class="badge ${m.status === 'Active' ? 'badge-green' : 'badge-red'}">${m.status}</span></td>
          <td>₹${m.amountPaid.toLocaleString()}</td>
        </tr>
      `).join('') : `<tr><td colspan="8" style="text-align:center; padding:20px; color:#888;">No members recorded yet.</td></tr>`;

      contentHtml = `
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `;
    } else if (section === 'payments') {
      reportTitle = 'Payment Collections & Financial Ledger Statement';
      tableHeaders = `
        <th>Transaction ID</th>
        <th>Member Name</th>
        <th>Plan</th>
        <th>Method</th>
        <th>Date</th>
        <th>Amount (₹)</th>
      `;
      tableRows = payments.length > 0 ? payments.map(p => `
        <tr>
          <td><code>${p.id}</code></td>
          <td><strong>${p.memberName}</strong></td>
          <td>${p.plan}</td>
          <td>${p.paymentMethod}</td>
          <td>${p.date}</td>
          <td style="color:#008800; font-weight:bold;">₹${p.amount.toLocaleString()}</td>
        </tr>
      `).join('') : `<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">No payments logged yet.</td></tr>`;

      contentHtml = `
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `;
    } else if (section === 'expenses') {
      reportTitle = 'Operational Expenses Statement';
      tableHeaders = `
        <th>Title</th>
        <th>Category</th>
        <th>Date</th>
        <th>Notes</th>
        <th>Amount (₹)</th>
      `;
      tableRows = expenses.length > 0 ? expenses.map(e => `
        <tr>
          <td><strong>${e.title}</strong></td>
          <td>${e.category}</td>
          <td>${e.date}</td>
          <td>${e.notes || '-'}</td>
          <td style="color:#cc0000; font-weight:bold;">₹${e.amount.toLocaleString()}</td>
        </tr>
      `).join('') : `<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">No expenses logged yet.</td></tr>`;

      contentHtml = `
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `;
    } else if (section === 'enquiries') {
      reportTitle = 'Inquiries & Leads CRM Report';
      tableHeaders = `
        <th>Lead Name</th>
        <th>Phone</th>
        <th>Plan Interest</th>
        <th>Source</th>
        <th>Status</th>
        <th>Follow-up Date</th>
      `;
      tableRows = enquiries.length > 0 ? enquiries.map(eq => `
        <tr>
          <td><strong>${eq.name}</strong></td>
          <td>${eq.phone}</td>
          <td>${eq.planInterest}</td>
          <td>${eq.source}</td>
          <td><span class="badge ${eq.status === 'Converted' ? 'badge-green' : eq.status === 'Contacted' ? 'badge-orange' : 'badge-red'}">${eq.status}</span></td>
          <td>${eq.followUpDate || '-'}</td>
        </tr>
      `).join('') : `<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">No inquiries recorded yet.</td></tr>`;

      contentHtml = `
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `;
    } else if (section === 'staff') {
      reportTitle = 'Staff Roster & Payroll Statement';
      tableHeaders = `
        <th>Staff Name</th>
        <th>Role</th>
        <th>Phone</th>
        <th>Email</th>
        <th>Join Date</th>
        <th>Salary (₹)</th>
      `;
      tableRows = staff.length > 0 ? staff.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.role}</td>
          <td>${s.phone}</td>
          <td>${s.email}</td>
          <td>${s.joinDate}</td>
          <td style="font-weight:bold;">₹${s.salary.toLocaleString()}</td>
        </tr>
      `).join('') : `<tr><td colspan="6" style="text-align:center; padding:20px; color:#888;">No staff members added yet.</td></tr>`;

      contentHtml = `
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `;
    } else if (section === 'summary') {
      reportTitle = 'Full Executive Gym Business Statement';
      contentHtml = `
        <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #e2e8f0;">
          <h3 style="margin:0 0 10px 0; color:#0f172a;">Executive Financial Overview</h3>
          <div style="display:flex; justify-content:space-between; text-align:center;">
            <div><div style="font-size:12px; color:#64748b;">Total Revenue</div><div style="font-size:18px; font-weight:bold; color:#16a34a;">₹${stats.allTimeRevenue.toLocaleString()}</div></div>
            <div><div style="font-size:12px; color:#64748b;">Total Expenses</div><div style="font-size:18px; font-weight:bold; color:#ea580c;">₹${stats.allTimeExpenses.toLocaleString()}</div></div>
            <div><div style="font-size:12px; color:#64748b;">Net Profit</div><div style="font-size:18px; font-weight:bold; color:#0284c7;">₹${stats.allTimeProfit.toLocaleString()}</div></div>
            <div><div style="font-size:12px; color:#64748b;">Active Members</div><div style="font-size:18px; font-weight:bold; color:#0f172a;">${stats.activeMembers} / ${stats.totalMembers}</div></div>
          </div>
        </div>

        <h4>Recent Payment Collections</h4>
        <table>
          <thead>
            <tr><th>Member Name</th><th>Plan</th><th>Method</th><th>Date</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${payments.slice(0, 10).map(p => `<tr><td>${p.memberName}</td><td>${p.plan}</td><td>${p.paymentMethod}</td><td>${p.date}</td><td>₹${p.amount.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center; color:#888;">No payments recorded</td></tr>'}
          </tbody>
        </table>

        <h4 style="margin-top:20px;">Recent Operational Expenses</h4>
        <table>
          <thead>
            <tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${expenses.slice(0, 10).map(e => `<tr><td>${e.title}</td><td>${e.category}</td><td>${e.date}</td><td>₹${e.amount.toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center; color:#888;">No expenses recorded</td></tr>'}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - ${gymName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 22px; font-weight: bold; color: #0284c7; }
            .code { font-size: 11px; color: #64748b; margin-top: 2px; }
            .meta { text-align: right; font-size: 12px; color: #64748b; }
            h2 { margin-top: 0; font-size: 18px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #334155; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .badge-green { background: #dcfce7; color: #15803d; }
            .badge-red { background: #fee2e2; color: #b91c1c; }
            .badge-orange { background: #ffedd5; color: #c2410c; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            @media print {
              body { margin: 15px; }
              @page { size: auto; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">${gymName}</div>
              <div class="code">CODE: ${gymCode} | Official Statement</div>
            </div>
            <div class="meta">
              <div><strong>Generated Date:</strong> ${currentDate}</div>
              <div><strong>Report:</strong> ${reportTitle}</div>
            </div>
          </div>

          <h2>${reportTitle}</h2>
          ${contentHtml}

          <div class="footer">
            Generated automatically by ${gymName} Management System. Page 1 of 1
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const reportSections = [
    {
      id: 'members' as const,
      title: 'Gym Members Directory',
      description: 'Active, expired & trial member profiles, subscriptions & join dates',
      count: `${members.length} Members`,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      id: 'payments' as const,
      title: 'Payment Collections & Revenue',
      description: 'Income transactions, payment methods & billing statements',
      count: `${payments.length} Payments`,
      icon: CreditCard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'expenses' as const,
      title: 'Operational Expenses Log',
      description: 'Categorized operational expenses, rent, equipment & utility bills',
      count: `${expenses.length} Expenses`,
      icon: Receipt,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'enquiries' as const,
      title: 'Inquiries & Leads CRM',
      description: 'Walk-in leads, conversion status & scheduled follow-ups',
      count: `${enquiries.length} Inquiries`,
      icon: MessageSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'staff' as const,
      title: 'Staff Roster & Payroll',
      description: 'Gym staff list, trainer roles & monthly salary records',
      count: `${staff.length} Staff`,
      icon: UserCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Reports & Financial Statements</h2>
            <p className="text-xs text-[#8e9db5]">Export CSV, Excel/TSV spreadsheets or print PDF statements for all gym sections</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePrintPDF('summary')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-blue flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Master PDF Report</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-glow-purple flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">₹{stats.allTimeRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Month: ₹{stats.thisMonthRevenue.toLocaleString()}</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleExportCSV('payments')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handlePrintPDF('payments')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Expenses</div>
            <div className="text-2xl font-extrabold text-orange-400 mt-1">₹{stats.allTimeExpenses.toLocaleString()}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">Month: ₹{stats.thisMonthExpenses.toLocaleString()}</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleExportCSV('expenses')}
              className="px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handlePrintPDF('expenses')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#22324b] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#8e9db5] uppercase tracking-wider">Total Members</div>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.totalMembers}</div>
            <div className="text-[11px] text-[#8e9db5] mt-0.5">{stats.activeMembers} Active Members</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleExportCSV('members')}
              className="px-3 py-1.5 rounded-lg bg-[#0099ff]/15 text-[#0099ff] hover:bg-[#0099ff]/30 border border-[#0099ff]/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handlePrintPDF('members')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-1 text-[11px] font-bold"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive All-Sections Export Cards Grid */}
      <div className="glass-card rounded-2xl p-6 border border-[#22324b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0099ff]" /> Detailed Reports & Export Options (All Sections)
            </h3>
            <p className="text-xs text-[#8e9db5] mt-0.5">Download CSV, Excel/TSV sheets or trigger browser Print to Save PDF statements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {reportSections.map((sec) => {
            const Icon = sec.icon;

            return (
              <div
                key={sec.id}
                className={`p-5 rounded-2xl bg-[#0f1624] border ${sec.borderColor} flex flex-col justify-between space-y-4 transition-all hover:border-opacity-50`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${sec.bgColor} ${sec.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#8e9db5] bg-[#162032] px-2.5 py-1 rounded-md border border-[#22324b]">
                      {sec.count}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm tracking-tight">{sec.title}</h4>
                    <p className="text-xs text-[#8e9db5] mt-0.5 line-clamp-2">{sec.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#22324b]/60">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExportCSV(sec.id)}
                      className="py-2 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download CSV</span>
                    </button>

                    <button
                      onClick={() => handleExportExcel(sec.id)}
                      className="py-2 rounded-xl bg-[#162032] hover:bg-[#1c2a42] border border-[#22324b] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Excel (.xls)</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handlePrintPDF(sec.id)}
                    className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Print PDF Statement</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
