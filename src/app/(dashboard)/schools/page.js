'use client';
import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import FormPhoneInput from '@/components/FormPhoneInput';
import { 
  getSchoolsAction, 
  createSchoolAction, 
  updateSchoolAction, 
  deleteSchoolAction, 
  toggleSchoolStatusAction 
} from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { handleConfirmDelete, handleStatusToggle } from '@/lib/commonHandlers';

export default function SchoolsManagementPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const handleToggleStatus = (school) => {
    const nextStatus = school.status === 'active' ? 'inactive' : 'active';
    handleStatusToggle('school', school.id, nextStatus, () => fetchSchools());
  };

  const handleDelete = (id) => {
    handleConfirmDelete('school', id, () => fetchSchools());
  };

  const filteredSchools = schools.filter(s => 
    s.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'School Institution',
      accessor: 'school_name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            {row.logo ? (
              <img src={row.logo.startsWith('/uploads/') ? `http://localhost:5000${row.logo}` : row.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
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
        <button
          onClick={() => handleToggleStatus(row)}
          className="cursor-pointer"
        >
          <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
            {row.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition cursor-pointer"
            title="Edit School"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
            title="Delete School"
          >
            <Trash2 size={15} />
          </button>
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
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Register New School
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school by name, code, or email..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSchools}
        loading={loading}
        emptyMessage="No school institutions registered yet."
      />

      {/* Add / Edit School Drawer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <School className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-slate-100">
                  {editingSchool ? 'Edit Institution Profile' : 'Register New School'}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Input
                label="Primary Brand Color (Hex)"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              />

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={saving}>
                  {editingSchool ? 'Update School' : 'Create School Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
