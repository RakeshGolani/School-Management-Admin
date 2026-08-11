'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  School, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  X,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import FormPhoneInput from '@/components/FormPhoneInput';
import Tooltip from '@/components/ui/Tooltip';
import ColorInput from '@/components/ui/ColorInput';
import Select from '@/components/ui/Select';
import { 
  getSchoolsAction, 
  createSchoolAction, 
  updateSchoolAction, 
  deleteSchoolAction, 
  toggleSchoolStatusAction 
} from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { handleStatusToggle } from '@/lib/commonHandlers';
import SchoolTableSkeleton from '@/components/skeletons/SchoolTableSkeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function SchoolsManagementPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Drawer / Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    school_name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    primary_color: '#14b8a6'
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await getSchoolsAction();
      if (res.success && Array.isArray(res.data)) {
        setSchools(res.data);
      } else {
        setSchools([]);
      }
    } catch (err) {
      notifyError('Failed to fetch schools list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const openAddModal = () => {
    setEditingSchool(null);
    setFormData({
      school_name: '',
      code: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      phone: '',
      address: '',
      logo: '',
      primary_color: '#14b8a6'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (school) => {
    setEditingSchool(school);
    setFormData({
      school_name: school.school_name,
      code: school.code,
      email: school.email,
      phone: school.phone || '',
      address: school.address || '',
      logo: school.logo || '',
      primary_color: school.primary_color || '#14b8a6'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.school_name || !formData.email || !formData.code) {
      setFormErrors({
        school_name: !formData.school_name ? 'School name is required' : '',
        email: !formData.email ? 'Email is required' : '',
        code: !formData.code ? 'School code is required' : ''
      });
      return;
    }

    setSaving(true);

    try {
      let res;
      if (editingSchool) {
        res = await updateSchoolAction(editingSchool.id, formData);
      } else {
        res = await createSchoolAction(formData);
      }

      if (res.success) {
        notifySuccess(res.message || (editingSchool ? 'School updated successfully' : 'School created successfully'));
        setModalOpen(false);
        fetchSchools();
      } else {
        if (res.errors) {
          setFormErrors(res.errors);
        } else {
          notifyError(res.message || 'Operation failed');
        }
      }
    } catch (err) {
      notifyError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleToggleStatus = (school) => {
    const nextStatus = school.status === 'active' ? 'inactive' : 'active';
    handleStatusToggle('school', school.id, nextStatus, () => fetchSchools());
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteSchool = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const result = await deleteSchoolAction(deletingId);
      if (result.success) {
        notifySuccess(result.message || 'School deleted successfully');
        setDeleteModalOpen(false);
        setDeletingId(null);
        fetchSchools();
      } else {
        notifyError(result.message || 'Failed to delete school');
      }
    } catch (err) {
      notifyError('An unexpected error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch = 
      s.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const columns = [
    {
      header: 'School Institution',
      accessor: 'school_name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            {row.logo ? (
              <img src={row.logo.startsWith('/uploads/') ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${row.logo}` : row.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <School size={20} className="text-amber-500" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-100">{row.school_name}</p>
            <p className="text-xs text-amber-400 font-mono">Code: {row.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Details',
      accessor: 'email',
      render: (row) => (
        <div className="space-y-1 text-xs text-slate-300">
          <p className="flex items-center"><Mail size={12} className="mr-1 text-slate-400" /> {row.email}</p>
          {row.phone && <p className="flex items-center"><Phone size={12} className="mr-1 text-slate-400" /> {row.phone}</p>}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Tooltip content={row.status === 'active' ? 'Click to deactivate school' : 'Click to activate school'}>
          <button
            onClick={() => handleToggleStatus(row)}
            className="cursor-pointer"
          >
            <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
              {row.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </button>
        </Tooltip>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-6 min-w-[150px]',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2 pr-2">
          <Tooltip content="View Details">
            <Link
              href={`/schools/${row.id}`}
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-teal-500/20 text-teal-400 transition cursor-pointer"
            >
              <Eye size={15} />
            </Link>
          </Tooltip>
          <Tooltip content="Edit School">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Delete School">
            <button
              type="button"
              onClick={() => handleDeleteClick(row.id)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Registered Institutions</h1>
          <p className="text-xs text-slate-400">Super Admin institution portal & access control</p>
        </div>
        <Tooltip content="Register a new school in the portal" position="left">
          <Button variant="primary" icon={Plus} onClick={openAddModal}>
            Register New School
          </Button>
        </Tooltip>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Institutions Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 shadow-xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Institutions</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-amber-400 transition-colors">{schools.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5 group-hover:scale-110 transition-transform duration-300">
            <School size={22} />
          </div>
        </div>

        {/* Active Institutions Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Campus</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{schools.filter(s => s.status === 'active').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5 group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Inactive Institutions Card */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/20 p-5 shadow-xl flex items-center justify-between group hover:border-rose-500/30 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inactive / Pending</p>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-rose-400 transition-colors">{schools.filter(s => s.status === 'inactive').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/5 group-hover:scale-110 transition-transform duration-300">
            <X size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 sm:p-5 shadow-xl relative z-20">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Left Side: Search Input with Focus Effects & Icon */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school by name, code, or email..."
              className="w-full bg-slate-800/50 border border-slate-700/80 hover:border-slate-600/80 focus:border-amber-500/80 text-slate-100 placeholder-slate-400/80 rounded-xl text-sm py-2 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Side: Filters, Counter & Reset */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                triggerClassName="bg-slate-800/50 border-slate-700/80 text-slate-200 hover:border-slate-600/80 text-xs sm:text-sm py-2 px-3.5"
                dropdownClassName="border-slate-800"
              />
            </div>

            {/* Dynamic Results Counter */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-800/30 border border-slate-800/80 text-[11px] font-semibold text-slate-400 select-none flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal size={12} className="text-amber-500/80" />
              <span>{filteredSchools.length} {filteredSchools.length === 1 ? 'Institution' : 'Institutions'}</span>
            </div>

            {/* Reset Button */}
            {(searchQuery || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-3 py-2 rounded-xl border border-rose-500/20 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <X size={12} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSchools}
        loading={loading}
        loadingComponent={<SchoolTableSkeleton />}
        emptyMessage="No school institutions registered yet."
      />

      {/* Add / Edit School Drawer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative"
          >
            {/* Fixed Header */}
            <div className="p-6 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <School size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 leading-none">
                    {editingSchool ? 'Edit Institution Profile' : 'Register New School'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-none">
                    {editingSchool ? 'Update school credentials and branding' : 'Setup master portal for a new school'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Input
                label="School Institution Name"
                placeholder="Greenwood International School"
                value={formData.school_name}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                error={formErrors.school_name}
                required
              />

              <Input
                label="Registration Code"
                placeholder="SCH-1001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                error={formErrors.code}
                required
              />

              <Input
                label="Institutional Email Address"
                type="email"
                placeholder="admin@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={formErrors.email}
                required
              />

              <FormPhoneInput
                label="Contact Phone Number"
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                error={formErrors.phone}
              />

              <Input
                label="Campus Address"
                placeholder="123 Education Lane, Sector 4"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                error={formErrors.address}
              />

              <ColorInput
                label="Primary Brand Color (Hex)"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              />
            </div>

            {/* Fixed Action Footer */}
            <div className="p-6 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <Button 
                variant="primary" 
                type="submit" 
                loading={saving}
              >
                {editingSchool ? 'Update School' : 'Create School Account'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDeleteSchool}
        title="Confirm Deletion"
        message="Are you sure you want to delete this school? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
