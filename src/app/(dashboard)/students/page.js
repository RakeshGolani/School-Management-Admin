'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Bus, 
  CreditCard, 
  UserCheck, 
  X,
  SlidersHorizontal,
  School as SchoolIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import FormPhoneInput from '@/components/FormPhoneInput';
import Tooltip from '@/components/ui/Tooltip';
import Select from '@/components/ui/Select';
import { 
  getStudentsAction, 
  createStudentAction, 
  updateStudentAction, 
  deleteStudentAction, 
  toggleStudentStatusAction 
} from '@/actions/studentActions';
import { getSchoolsAction } from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import StudentTableSkeleton from '@/components/skeletons/StudentTableSkeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function StudentsManagementPage() {
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [page, setPage] = useState(1);

  // Modal / Drawer State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    school_id: '',
    first_name: '',
    last_name: '',
    admission_number: '',
    grade: 'Grade 10',
    section: 'A',
    gender: 'male',
    dob: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    alternate_phone: '',
    nfc_card_uid: '',
    is_bus_service_enabled: false,
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSchools = async () => {
    try {
      const res = await getSchoolsAction();
      if (res.success && Array.isArray(res.data)) {
        setSchools(res.data);
      }
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentsAction({
        search: searchQuery,
        grade: gradeFilter,
        is_bus: busFilter,
        status: statusFilter,
        schoolId: selectedSchoolId,
        page,
        limit: 10
      });

      if (res.status === 'success' || res.success) {
        setStudents(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } else {
        setStudents([]);
      }
    } catch (err) {
      notifyError('Failed to fetch students list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, gradeFilter, busFilter, statusFilter, selectedSchoolId, page]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      school_id: schools.length > 0 ? schools[0].id : '',
      first_name: '',
      last_name: '',
      admission_number: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      grade: 'Grade 10',
      section: 'A',
      gender: 'male',
      dob: '',
      guardian_name: '',
      guardian_email: '',
      guardian_phone: '',
      alternate_phone: '',
      nfc_card_uid: '',
      is_bus_service_enabled: false,
      photo: null
    });
    setPhotoPreview(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      school_id: student.school_id || (schools.length > 0 ? schools[0].id : ''),
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      grade: student.grade || 'Grade 10',
      section: student.section || 'A',
      gender: student.gender || 'male',
      dob: student.dob || '',
      guardian_name: student.guardian_name || '',
      guardian_email: student.parent?.email || '',
      guardian_phone: student.guardian_phone || '',
      alternate_phone: student.alternate_phone || '',
      nfc_card_uid: student.nfc_card_uid || '',
      is_bus_service_enabled: Boolean(student.is_bus_service_enabled),
      photo: null
    });
    setPhotoPreview(student.image_url || student.photo || null);
    setFormErrors({});
    setModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.first_name || !formData.last_name) {
      setFormErrors({
        first_name: !formData.first_name ? 'First name is required' : '',
        last_name: !formData.last_name ? 'Last name is required' : ''
      });
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photo') {
          if (formData.photo) submitData.append('photo', formData.photo);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      let res;
      if (editingStudent) {
        res = await updateStudentAction(editingStudent.id, submitData);
      } else {
        res = await createStudentAction(submitData);
      }

      if (res.status === 'success' || res.success) {
        notifySuccess(res.message || (editingStudent ? 'Student updated successfully' : 'Student admitted successfully'));
        setModalOpen(false);
        fetchStudents();
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

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await toggleStudentStatusAction(student.id, newStatus);
      if (res.status === 'success' || res.success) {
        notifySuccess(`Status changed to ${newStatus}`);
        fetchStudents();
      } else {
        notifyError(res.message || 'Failed to update status');
      }
    } catch (err) {
      notifyError('Failed to change status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteStudentAction(studentToDelete.id);
      if (res.status === 'success' || res.success) {
        notifySuccess('Student record deleted successfully');
        setDeleteModalOpen(false);
        setStudentToDelete(null);
        fetchStudents();
      } else {
        notifyError(res.message || 'Failed to delete student');
      }
    } catch (err) {
      notifyError('Error occurred while deleting student');
    } finally {
      setDeleting(false);
    }
  };

  // Dynamic calculated stats
  const totalCount = meta.total || students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const busCount = students.filter(s => s.is_bus_service_enabled).length;

  // Options arrays for Select components
  const schoolOptions = [
    { value: '', label: 'All Schools' },
    ...schools.map(sch => ({ value: String(sch.id), label: sch.school_name }))
  ];

  const gradeFilterOptions = [
    { value: 'all', label: 'All Grades' },
    ...Array.from({ length: 12 }).map((_, i) => ({ value: String(i + 1), label: `Grade ${i + 1}` }))
  ];

  const busFilterOptions = [
    { value: 'all', label: 'Transport (All)' },
    { value: 'true', label: 'Bus Enabled' },
    { value: 'false', label: 'No Transport' }
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'Status (All)' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const formSchoolOptions = schools.map(sch => ({ value: String(sch.id), label: sch.school_name }));
  const formGradeOptions = Array.from({ length: 12 }).map((_, i) => ({ value: `Grade ${i + 1}`, label: `Grade ${i + 1}` }));
  const formSectionOptions = [
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' }
  ];
  const formGenderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const columns = [
    {
      header: 'Student Info',
      accessor: 'first_name',
      render: (student) => {
        const rawPhoto = student.image_url || student.photo;
        const photoUrl = rawPhoto && !rawPhoto.includes('ui-avatars.com') ? rawPhoto : null;

        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center font-bold text-teal-400 text-sm border border-slate-700 shrink-0 overflow-hidden relative">
              {photoUrl && (
                <img 
                  src={photoUrl} 
                  alt={student.first_name || 'Student'} 
                  className="w-full h-full object-cover relative z-10" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <span className="text-teal-400 font-bold">{student.first_name ? student.first_name[0].toUpperCase() : 'S'}</span>
            </div>
            <div className="min-w-0">
              <Link 
                href={`/students/${student.id}`} 
                className="font-semibold text-slate-100 hover:text-teal-400 transition-colors block truncate"
              >
                {student.first_name} {student.last_name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                  {student.admission_number || `ADM-${student.id}`}
                </span>
                <span className="capitalize text-slate-500">• {student.gender || 'male'}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Class / Grade',
      accessor: 'grade',
      render: (student) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="teal" className="rounded-lg text-xs font-semibold px-2.5 py-1">
            {student.grade || 'N/A'}
          </Badge>
          {student.section && (
            <span className="bg-slate-800 text-slate-300 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-700/60">
              Sec {student.section}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Guardian Contact',
      accessor: 'guardian_name',
      render: (student) => (
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-slate-200">
            {student.guardian_name || 'N/A'}
          </div>
          {student.guardian_phone && (
            <a 
              href={`tel:${student.guardian_phone}`} 
              className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline"
            >
              <Phone className="w-3 h-3" />
              {student.guardian_phone}
            </a>
          )}
        </div>
      )
    },
    {
      header: 'Services',
      accessor: 'is_bus_service_enabled',
      render: (student) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {student.is_bus_service_enabled ? (
            <Badge variant="warning" className="rounded-full text-[11px] px-2 py-0.5 flex items-center gap-1">
              <Bus className="w-3 h-3" /> Bus Active
            </Badge>
          ) : (
            <span className="text-xs text-slate-500">No Bus</span>
          )}

          {student.nfc_card_uid && (
            <Badge variant="info" className="rounded-full text-[11px] px-2 py-0.5 flex items-center gap-1 font-mono">
              <CreditCard className="w-3 h-3" /> NFC Set
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (student) => (
        <Tooltip content={student.status === 'active' ? 'Click to deactivate student' : 'Click to activate student'}>
          <button
            onClick={() => handleToggleStatus(student)}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md ${
                student.status === 'active' ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
            <span className={`text-xs font-semibold capitalize ${
              student.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {student.status || 'inactive'}
            </span>
          </button>
        </Tooltip>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-6 min-w-[150px]',
      render: (student) => (
        <div className="flex items-center justify-end space-x-2 pr-2">
          <Tooltip content="View Profile">
            <Link
              href={`/students/${student.id}`}
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-teal-500/20 text-teal-400 transition cursor-pointer"
            >
              <Eye size={15} />
            </Link>
          </Tooltip>

          <Tooltip content="Edit Student">
            <button
              type="button"
              onClick={() => openEditModal(student)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
          </Tooltip>

          <Tooltip content="Delete Student">
            <button
              type="button"
              onClick={() => {
                setStudentToDelete(student);
                setDeleteModalOpen(true);
              }}
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
    <div className="space-y-6 pb-12">
      {/* Header & Title */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Students Directory</h1>
            <p className="text-xs text-slate-400 mt-1">Manage student admissions, profiles, NFC cards & transport access</p>
          </div>
        </div>

        <Tooltip content="Add a new student admission" position="left">
          <Button 
            onClick={openAddModal} 
            icon={UserPlus}
            variant="primary" 
          >
            New Admission
          </Button>
        </Tooltip>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalCount}</h3>
            </div>
            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Students</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bus Passengers</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{busCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Bus className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">NFC Enabled</p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1">{students.filter(s => s.nfc_card_uid).length}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-lg relative z-30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, admission #, NFC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <Select
              value={selectedSchoolId}
              onChange={(val) => setSelectedSchoolId(val)}
              options={schoolOptions}
              triggerClassName="min-w-[150px]"
            />

            <Select
              value={gradeFilter}
              onChange={(val) => setGradeFilter(val)}
              options={gradeFilterOptions}
              triggerClassName="min-w-[130px]"
            />

            <Select
              value={busFilter}
              onChange={(val) => setBusFilter(val)}
              options={busFilterOptions}
              triggerClassName="min-w-[140px]"
            />

            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={statusFilterOptions}
              triggerClassName="min-w-[130px]"
            />
          </div>
        </div>
      </div>

      {/* Main Standard Data Table Component */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        loadingComponent={<StudentTableSkeleton />}
        emptyMessage="No student records match your current filters."
      />

      {/* Add / Edit Student Drawer (Off-Canvas) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    {editingStudent ? 'Edit Student Profile' : 'New Student Admission'}
                  </h2>
                  <p className="text-xs text-slate-400">Fill in mandatory details for official school records</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Upload & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-slate-500" />
                    )}
                    <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white cursor-pointer transition-opacity">
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">JPG, PNG (Max 5MB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      error={formErrors.first_name}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      error={formErrors.last_name}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admission Number</label>
                    <Input
                      type="text"
                      placeholder="ADM-1001"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                    />
                  </div>

                  {/* Target School with Custom Select */}
                  {formSchoolOptions.length > 0 && (
                    <Select
                      label="School"
                      value={String(formData.school_id)}
                      onChange={(val) => setFormData({ ...formData, school_id: val })}
                      options={formSchoolOptions}
                    />
                  )}
                </div>
              </div>

              {/* Class & Academic Info with Custom Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
                <Select
                  label="Grade / Class"
                  value={formData.grade}
                  onChange={(val) => setFormData({ ...formData, grade: val })}
                  options={formGradeOptions}
                />

                <Select
                  label="Section"
                  value={formData.section}
                  onChange={(val) => setFormData({ ...formData, section: val })}
                  options={formSectionOptions}
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(val) => setFormData({ ...formData, gender: val })}
                  options={formGenderOptions}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NFC Card UID</label>
                  <Input
                    type="text"
                    placeholder="e.g. NFC-883921"
                    value={formData.nfc_card_uid}
                    onChange={(e) => setFormData({ ...formData, nfc_card_uid: e.target.value })}
                    error={formErrors.nfc_card_uid ? formErrors.nfc_card_uid[0] : ''}
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={formData.is_bus_service_enabled}
                      onChange={(e) => setFormData({ ...formData, is_bus_service_enabled: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500/20"
                    />
                    Enable Bus Transport
                  </label>
                </div>
              </div>

              {/* Guardian Contact Details */}
              <div className="space-y-4 pt-2 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent / Guardian Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Name</label>
                    <Input
                      type="text"
                      placeholder="Father / Mother Name"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Email</label>
                    <Input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.guardian_email}
                      onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Phone</label>
                    <FormPhoneInput
                      value={formData.guardian_phone}
                      onChange={(val) => setFormData({ ...formData, guardian_phone: val })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Alternate Phone</label>
                    <FormPhoneInput
                      value={formData.alternate_phone}
                      onChange={(val) => setFormData({ ...formData, alternate_phone: val })}
                    />
                  </div>
                </div>
              </div>
              </div>

              {/* Form Buttons (Fixed Footer) */}
              <div className="p-6 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                >
                  {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Admission'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${studentToDelete?.first_name} ${studentToDelete?.last_name}'s admission record? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
}
