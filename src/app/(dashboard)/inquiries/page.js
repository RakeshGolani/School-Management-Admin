'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquareQuote, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle,
  Filter, 
  RefreshCw, 
  ExternalLink,
  Save,
  MessageCircle,
  Sparkles,
  Layers,
  PhoneCall,
  MailCheck,
  UserCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import Select from '@/components/ui/Select';
import Drawer from '@/components/ui/Drawer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  getInquiriesAction, 
  updateInquiryStatusAction, 
  updateInquiryNotesAction, 
  deleteInquiryAction 
} from '@/actions/inquiryActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import InquirySkeleton from '@/components/skeletons/InquirySkeleton';

export default function InquiriesManagementPage() {
  const [inquiries, setInquiries] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    scheduled: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / View Details State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await getInquiriesAction({
        search: searchQuery,
        status: statusFilter
      });

      if (res.success && Array.isArray(res.data)) {
        setInquiries(res.data);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      notifyError('Failed to load demonstration inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, moduleFilter]);

  // Filter inquiries on client-side for rapid responsiveness
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        item.representative_name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.school_name?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q)
      );

      // Module filter
      const matchesModule = moduleFilter === 'ALL' || item.module_interest === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [inquiries, searchQuery, moduleFilter]);

  // Client-side paginated data
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(start, start + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredInquiries.length / pageSize) || 1;

  // Open Details Drawer
  const handleOpenDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setDrawerOpen(true);
  };

  // Update Status
  const handleStatusChange = async (newStatus) => {
    if (!selectedInquiry || !newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await updateInquiryStatusAction(selectedInquiry.id, newStatus);
      if (res.success) {
        notifySuccess(`Status updated to ${newStatus}`);
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
        setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? { ...item, status: newStatus } : item));
        // Refresh metrics
        fetchInquiries();
      } else {
        notifyError(res.message || 'Failed to update status');
      }
    } catch (err) {
      notifyError('Failed to connect to server');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      const res = await updateInquiryNotesAction(selectedInquiry.id, adminNotes);
      if (res.success) {
        notifySuccess('Internal notes saved successfully');
        setSelectedInquiry(prev => ({ ...prev, admin_notes: adminNotes }));
        setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? { ...item, admin_notes: adminNotes } : item));
      } else {
        notifyError(res.message || 'Failed to save notes');
      }
    } catch (err) {
      notifyError('Failed to connect to server');
    } finally {
      setSavingNotes(false);
    }
  };

  // Delete Inquiry
  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteInquiryAction(inquiryToDelete.id);
      if (res.success) {
        notifySuccess('Inquiry deleted successfully');
        setInquiries(prev => prev.filter(item => item.id !== inquiryToDelete.id));
        setDeleteModalOpen(false);
        if (selectedInquiry?.id === inquiryToDelete.id) {
          setDrawerOpen(false);
        }
      } else {
        notifyError(res.message || 'Failed to delete inquiry');
      }
    } catch (err) {
      notifyError('Failed to connect to server');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'CONTACTED':
        return <Badge variant="info">CONTACTED</Badge>;
      case 'SCHEDULED':
        return <Badge variant="primary">SCHEDULED</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'CLOSED':
        return <Badge variant="neutral">CLOSED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getModuleLabel = (moduleKey) => {
    switch (moduleKey) {
      case 'full_suite':
        return { label: 'Full Institutional Suite', color: 'bg-primary-500/10 text-primary-400 border-primary-500/20' };
      case 'transport_only':
        return { label: 'Smart Bus Fleet & GPS', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'school_only':
        return { label: 'Academic ERP & Fees', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { label: moduleKey || 'General Inquiry', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Inquiries', count: metrics.total },
    { key: 'PENDING', label: 'Pending', count: metrics.pending },
    { key: 'CONTACTED', label: 'Contacted', count: metrics.contacted },
    { key: 'SCHEDULED', label: 'Demo Scheduled', count: metrics.scheduled },
    { key: 'RESOLVED', label: 'Resolved', count: metrics.resolved },
    { key: 'CLOSED', label: 'Closed', count: metrics.closed }
  ];

  const columns = [
    {
      header: 'Representative & School',
      accessor: 'representative_name',
      render: (row) => {
        const initial = (row.representative_name || 'U').charAt(0).toUpperCase();
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 font-black text-sm shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-100 text-sm truncate flex items-center gap-1.5">
                {row.representative_name}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <Building2 size={12} className="text-slate-500 shrink-0" />
                <span className="truncate">{row.school_name}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      render: (row) => (
        <div className="space-y-1">
          <a
            href={`tel:${row.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-primary-400 transition"
          >
            <Phone size={12} className="text-primary-400 shrink-0" />
            <span>{row.phone}</span>
          </a>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Mail size={12} className="text-slate-500 shrink-0" />
            <a 
              href={`mailto:${row.email}`}
              className="hover:text-primary-400 transition truncate max-w-[180px]"
            >
              {row.email}
            </a>
          </div>
        </div>
      )
    },
    {
      header: 'Interested Module',
      accessor: 'module_interest',
      render: (row) => {
        const mod = getModuleLabel(row.module_interest);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${mod.color}`}>
            <Layers size={11} className="shrink-0" />
            <span>{mod.label}</span>
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Received Date',
      accessor: 'created_at',
      render: (row) => {
        const dateStr = row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : '—';
        const timeStr = row.created_at ? new Date(row.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) : '';
        return (
          <div className="text-xs text-slate-400">
            <div className="font-medium text-slate-300">{dateStr}</div>
            <div className="text-[11px] text-slate-500">{timeStr}</div>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="View Lead Details" position="top">
            <button
              onClick={() => handleOpenDetails(row)}
              className="p-2 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-slate-800/80 transition duration-150 cursor-pointer"
            >
              <Eye size={16} />
            </button>
          </Tooltip>

          <Tooltip content="Delete Lead" position="top" variant="danger">
            <button
              onClick={() => {
                setInquiryToDelete(row);
                setDeleteModalOpen(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition duration-150 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  if (loading && inquiries.length === 0) {
    return <InquirySkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
              <MessageSquareQuote size={28} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Demonstration Requests & Leads
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Manage public landing page demonstration bookings, institution inquiries, and walkthrough schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={fetchInquiries}
              loading={loading}
              className="border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Leads
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-black text-slate-100">{metrics.total}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> Pending
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics.pending}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <PhoneCall size={12} /> Contacted
          </div>
          <div className="text-2xl font-black text-sky-400">{metrics.contacted}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} /> Scheduled
          </div>
          <div className="text-2xl font-black text-purple-400">{metrics.scheduled}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} /> Resolved
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.resolved}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle size={12} /> Closed
          </div>
          <div className="text-2xl font-black text-slate-400">{metrics.closed}</div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Institution Inquiries"
        subtitle="List of all demonstration requests and lead interactions"
        icon={MessageSquareQuote}
      >
        <div className="space-y-6">
          {/* Status Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by representative, email, school, phone, or requirements..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="sm:col-span-4">
              <Select
                value={moduleFilter}
                onChange={(val) => setModuleFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Modules' },
                  { value: 'full_suite', label: 'Full Institutional Suite' },
                  { value: 'transport_only', label: 'Smart Bus Fleet & GPS' },
                  { value: 'school_only', label: 'Academic ERP & Fees' }
                ]}
                searchable={false}
                clearable={false}
              />
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={paginatedInquiries}
            loading={loading}
            emptyMessage="No demonstration requests found matching your filter."
            pagination={{
              currentPage,
              pageSize,
              totalRecords: filteredInquiries.length,
              totalPages,
              onPageChange: (p) => setCurrentPage(p),
              onPageSizeChange: (s) => {
                setPageSize(s);
                setCurrentPage(1);
              }
            }}
          />
        </div>
      </Card>

      {/* Inquiry Details Slide-over Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Demonstration Lead Details"
        subtitle={selectedInquiry?.school_name || 'Lead Profile'}
        icon={MessageSquareQuote}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInquiryToDelete(selectedInquiry);
                setDeleteModalOpen(true);
              }}
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            >
              <Trash2 size={14} /> Delete Lead
            </Button>

            <Button
              variant="primary"
              onClick={() => setDrawerOpen(false)}
            >
              Done / Close
            </Button>
          </div>
        }
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Status Selector Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Change Lead Status</label>
                <Select
                  value={selectedInquiry.status}
                  onChange={handleStatusChange}
                  options={[
                    { value: 'PENDING', label: 'PENDING - Needs Review' },
                    { value: 'CONTACTED', label: 'CONTACTED - Called / Emailed' },
                    { value: 'SCHEDULED', label: 'SCHEDULED - Walkthrough Booked' },
                    { value: 'RESOLVED', label: 'RESOLVED - Converted / Completed' },
                    { value: 'CLOSED', label: 'CLOSED - Not Interested' }
                  ]}
                  disabled={updatingStatus}
                  searchable={false}
                  clearable={false}
                />
              </div>
            </div>

            {/* Representative & School Profile */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={14} className="text-primary-400" /> Institution & Contact Profile
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Representative Name</div>
                  <div className="text-sm font-bold text-slate-100">{selectedInquiry.representative_name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">School / Academy</div>
                  <div className="text-sm font-bold text-slate-100">{selectedInquiry.school_name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Phone Number</div>
                  <div className="text-sm font-semibold text-slate-200">{selectedInquiry.phone}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Email Address</div>
                  <div className="text-sm font-semibold text-slate-200 break-all">{selectedInquiry.email}</div>
                </div>
              </div>

              {/* Quick Communication Action Bar */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary-600/10 hover:bg-primary-600/20 border border-primary-500/30 text-primary-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <PhoneCall size={14} /> Call Representative
                </a>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Regarding your Vidyadmin Demonstration Request for ${encodeURIComponent(selectedInquiry.school_name)}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MailCheck size={14} /> Send Email
                </a>
              </div>
            </div>

            {/* Module of Interest */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-amber-400" /> Solution Requested
              </h4>
              <div>
                {(() => {
                  const mod = getModuleLabel(selectedInquiry.module_interest);
                  return (
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${mod.color}`}>
                      <Sparkles size={13} /> {mod.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Inquiry Message / Notes from Visitor */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle size={14} className="text-indigo-400" /> Additional Requirements & Notes
              </h4>
              <p className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message || 'No additional requirements specified by the visitor.'}
              </p>
            </div>

            {/* Admin Internal Notes Editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Admin Internal Notes (Private)
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNotes}
                  loading={savingNotes}
                  className="text-xs border-slate-700 hover:bg-slate-800"
                >
                  <Save size={13} /> Save Notes
                </Button>
              </div>

              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write internal notes about communication history, quote discussed, follow-up date..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition resize-none"
              />
            </div>

            {/* Submission Telemetry */}
            <div className="text-xs text-slate-500 px-1 space-y-1">
              <div>
                Received: {new Date(selectedInquiry.created_at).toLocaleString()}
              </div>
              {selectedInquiry.ip_address && (
                <div>Visitor IP: {selectedInquiry.ip_address}</div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Demonstration Lead?"
        message={`Are you sure you want to permanently delete the inquiry for "${inquiryToDelete?.school_name}" (${inquiryToDelete?.representative_name})? This action cannot be undone.`}
        type="danger"
        confirmText="Delete Inquiry"
      />
    </div>
  );
}
