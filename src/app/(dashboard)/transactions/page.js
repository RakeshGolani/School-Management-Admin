'use client';
import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Printer, 
  Eye,
  Plus
} from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import DataTable from '@/components/ui/DataTable';
import Drawer from '@/components/ui/Drawer';
import Link from 'next/link';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: '0.00',
    totalSuccess: 0,
    totalPending: 0,
    totalFailed: 0
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Offline Payment Modal State
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [schoolsList, setSchoolsList] = useState([]);
  const [offlineForm, setOfflineForm] = useState({
    school_id: '',
    amount: '',
    payment_method: 'Bank Transfer (NEFT/RTGS)',
    reference_number: '',
    plan_type: 'monthly',
    max_students_limit: 50,
    max_buses_limit: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Schools for Dropdown
  const fetchSchoolsList = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';
      const res = await fetch(`${apiUrl}/schools?limit=1000`);
      const data = await res.json();
      if (data.success && data.data) {
        setSchoolsList(data.data.map(s => ({ value: s.id, label: `${s.school_name} (${s.code})` })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchoolsList();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 100, // Fetch all items for dynamic client-side sorting & pagination via DataTable
        status: statusFilter,
        search: searchQuery
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';
      const response = await fetch(`${apiUrl}/transactions?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleOfflineSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';
      const res = await fetch(`${apiUrl}/transactions/offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offlineForm)
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess(data.message || 'Offline payment recorded successfully');
        setIsOfflineModalOpen(false);
        fetchTransactions(); // refresh table
        // Reset form
        setOfflineForm({
          school_id: '', amount: '', payment_method: 'Bank Transfer (NEFT/RTGS)',
          reference_number: '', plan_type: 'monthly', max_students_limit: 50, max_buses_limit: 5
        });
      } else {
        notifyError(data.message || 'Failed to record offline payment');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={13} /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={13} /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle size={13} /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'success', label: 'Paid / Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const columns = [
    {
      header: 'Transaction Ref',
      accessor: 'gateway_transaction_id',
      render: (row) => (
        <span className="font-mono font-semibold text-amber-400">
          {row.gateway_transaction_id}
        </span>
      )
    },
    {
      header: 'School Institution',
      accessor: 'school_name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-100">{row.school?.school_name || 'N/A'}</div>
          <div className="text-[11px] text-slate-500">{row.school?.code}</div>
        </div>
      )
    },
    {
      header: 'Plan Type',
      accessor: 'plan_type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
          {row.subscription?.plan_type || 'Monthly'}
        </span>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-mono font-bold text-slate-100">
          ₹{parseFloat(row.amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method',
      render: (row) => (
        <span className="text-slate-400">
          {row.payment_method || 'Online Gateway'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-slate-400">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-6',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Tooltip content="View Invoice" position="top">
            <Link
              href={`/transactions/invoices/${row.id}`}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition cursor-pointer shrink-0"
            >
              <Eye size={15} />
            </Link>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-wide">Transactions & Invoices</h1>
            <p className="text-xs text-slate-400 mt-1">Manage SaaS platform revenue, subscription payments & tax invoices</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Tooltip content="Record manual offline payment" position="left">
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold transition cursor-pointer shadow-lg active:scale-95"
            >
              <Plus size={14} />
              <span>Record Offline Payment</span>
            </button>
          </Tooltip>

          <Tooltip content="Refresh transaction logs" position="left">
            <button
              onClick={fetchTransactions}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 text-slate-200 hover:text-amber-400 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-amber-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SaaS Revenue</p>
            <h3 className="text-2xl font-black text-slate-100 font-mono">₹{stats.totalRevenue}</h3>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Live Paid Collections
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-emerald-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Successful Payments</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">{stats.totalSuccess}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Completed Transactions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-amber-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono">{stats.totalPending}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Awaiting Settlement</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-rose-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Attempts</p>
            <h3 className="text-2xl font-black text-rose-400 font-mono">{stats.totalFailed}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Declined Gateway Payments</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
            <XCircle size={24} />
          </div>
        </div>

      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school name, code or Txn ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </form>

        {/* Custom UI Select Component */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter size={14} className="text-amber-400" />
            <span>Status Filter:</span>
          </div>
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={statusOptions}
            className="w-48"
          />
        </div>

      </div>

      {/* Dynamic Reusable DataTable Container */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transaction history found."
        pageSizeOptions={[10, 25, 50]}
        defaultSortColumn="createdAt"
        defaultSortDirection="desc"
      />

      {/* Offline Payment Slide-Over Drawer */}
      <Drawer
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        title="Record Offline Payment"
        subtitle="Manually credit subscription fee & update school limits"
        icon={DollarSign}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOfflineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              loading={isSubmitting}
              disabled={isSubmitting || !offlineForm.school_id}
              onClick={handleOfflineSubmit}
            >
              Record Payment & Upgrade
            </Button>
          </div>
        }
      >
        <form onSubmit={handleOfflineSubmit} className="space-y-5">
          <Select 
            label="Select School"
            required
            options={schoolsList} 
            value={offlineForm.school_id} 
            onChange={(v) => setOfflineForm({...offlineForm, school_id: v})}
            searchable
            placeholder="Select a school"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Amount (₹)"
              type="number" 
              required
              value={offlineForm.amount} 
              onChange={(e) => setOfflineForm({...offlineForm, amount: e.target.value})} 
              placeholder="e.g. 15000"
            />
            <Select 
              label="Payment Method"
              required
              options={[
                { value: 'Bank Transfer (NEFT/RTGS)', label: 'Bank Transfer (NEFT/RTGS)' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'Cash', label: 'Cash' },
                { value: 'UPI / QR', label: 'UPI / QR' }
              ]}
              value={offlineForm.payment_method} 
              onChange={(v) => setOfflineForm({...offlineForm, payment_method: v})} 
            />
          </div>

          <Input 
            label="Reference Number / UTR"
            type="text" 
            value={offlineForm.reference_number} 
            onChange={(e) => setOfflineForm({...offlineForm, reference_number: e.target.value})} 
            placeholder="e.g. HDFC12345678"
          />

          {/* Plan & Resource Capacity */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Subscription & Capacity Allocation
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Applied instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select 
                label="Plan"
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' }
                ]}
                value={offlineForm.plan_type} 
                onChange={(v) => setOfflineForm({...offlineForm, plan_type: v})} 
              />
              <Input 
                label="Students"
                type="number" 
                required
                value={offlineForm.max_students_limit} 
                onChange={(e) => setOfflineForm({...offlineForm, max_students_limit: e.target.value})} 
              />
              <Input 
                label="Buses"
                type="number" 
                required
                value={offlineForm.max_buses_limit} 
                onChange={(e) => setOfflineForm({...offlineForm, max_buses_limit: e.target.value})} 
              />
            </div>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
