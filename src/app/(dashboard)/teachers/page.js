'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  CreditCard, 
  UserCheck, 
  X,
  SlidersHorizontal,
  Building2,
  BookOpen,
  Award,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import FormPhoneInput from '@/components/FormPhoneInput';
import Tooltip from '@/components/ui/Tooltip';
import Select from '@/components/ui/Select';
import Drawer from '@/components/ui/Drawer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import * as yup from 'yup';
import { 
  getTeachersAction, 
  createTeacherAction, 
  updateTeacherAction, 
  deleteTeacherAction, 
  toggleTeacherStatusAction 
} from '@/actions/teacherActions';
import { getSchoolsAction } from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { TeacherTableSkeleton } from '@/components/skeletons';

// Yup Validation Schema for Teacher Form
const teacherSchema = yup.object().shape({
  school_id: yup
    .string()
    .trim()
    .required('Please select an assigned school institution'),
  name: yup
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .required('Full name is required'),
  employee_id: yup
    .string()
    .trim()
    .min(2, 'Employee ID must be at least 2 characters')
    .max(50, 'Employee ID cannot exceed 50 characters')
    .required('Employee ID is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid official email address')
    .required('Official email address is required'),
  phone: yup
    .string()
    .trim()
    .nullable(),
  subject: yup
    .string()
    .trim()
    .min(2, 'Subject must be at least 2 characters')
    .required('Primary subject is required'),
  qualification: yup
    .string()
    .trim()
    .nullable(),
  nfc_card_uid: yup
    .string()
    .trim()
    .nullable(),
  status: yup
    .string()
    .oneOf(['active', 'inactive'])
    .default('active')
});

export default function TeachersManagementPage() {
  const [teachers, setTeachers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal / Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    subject: '',
    qualification: '',
    school_id: '',
    nfc_card_uid: '',
    status: 'active'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch Schools for Dropdown filter and drawer
  const fetchSchools = useCallback(async () => {
    try {
      const res = await getSchoolsAction();
      if ((res?.success || res?.status === 'success') && Array.isArray(res.data)) {
        setSchools(res.data);
      } else if (Array.isArray(res)) {
        setSchools(res);
      } else if (Array.isArray(res?.data?.schools)) {
        setSchools(res.data.schools);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  }, []);

  // Fetch Teachers
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTeachersAction({
        search: searchQuery,
        schoolId: selectedSchool === 'all' ? '' : selectedSchool,
        subject: subjectFilter === 'all' ? '' : subjectFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        limit: 1000 // Fetch for responsive client-side DataTable
      });

      if ((res?.success || res?.status === 'success') && Array.isArray(res.data)) {
        setTeachers(res.data);
      } else if (Array.isArray(res?.data?.teachers)) {
        setTeachers(res.data.teachers);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      notifyError('Failed to load teachers directory');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSchool, subjectFilter, statusFilter]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSchool, subjectFilter, statusFilter]);

  // Real-time Field Validation Handler
  const validateField = async (field, value) => {
    try {
      await yup.reach(teacherSchema, field).validate(value);
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, [field]: err.message }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Handlers for Drawer Modal
  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      phone: '',
      employee_id: '',
      subject: '',
      qualification: '',
      school_id: schools.length > 0 ? String(schools[0].id) : '',
      nfc_card_uid: '',
      status: 'active'
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setErrors({});
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      employee_id: teacher.employee_id || teacher.employeeId || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      school_id: String(teacher.school_id || teacher.schoolId || (teacher.school ? teacher.school.id : '')),
      nfc_card_uid: teacher.nfc_card_uid || teacher.nfcCardUid || '',
      status: teacher.status || 'active'
    });
    setPhotoFile(null);
    setPhotoPreview(teacher.image_url || teacher.photo || null);
    setIsDrawerOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Run Yup Validation across all fields
    try {
      await teacherSchema.validate(formData, { abortEarly: false });
      setErrors({});
    } catch (err) {
      if (err.inner) {
        const validationErrors = {};
        err.inner.forEach(error => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      let res;
      if (editingTeacher) {
        res = await updateTeacherAction(editingTeacher.uuid || editingTeacher.id, submitData);
      } else {
        res = await createTeacherAction(submitData);
      }

      if (res.success || res.status === 'success') {
        notifySuccess(res.message || (editingTeacher ? 'Teacher updated successfully' : 'Teacher added successfully'));
        setIsDrawerOpen(false);
        fetchTeachers();
      } else {
        notifyError(res.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to save teacher record');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Handler
  const handleToggleStatus = async (teacher) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await toggleTeacherStatusAction(teacher.uuid || teacher.id, newStatus);
      if (res.success || res.status === 'success') {
        notifySuccess(`Teacher status updated to ${newStatus}`);
        setTeachers(prev => prev.map(t => (t.id === teacher.id ? { ...t, status: newStatus } : t)));
      } else {
        notifyError(res.message || 'Failed to update status');
      }
    } catch (err) {
      notifyError('Failed to update teacher status');
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteTeacherAction(teacherToDelete.uuid || teacherToDelete.id);
      if (res.success || res.status === 'success') {
        notifySuccess('Teacher record deleted successfully');
        setDeleteModalOpen(false);
        setTeacherToDelete(null);
        fetchTeachers();
      } else {
        notifyError(res.message || 'Failed to delete teacher');
      }
    } catch (err) {
      notifyError('Failed to delete teacher');
    } finally {
      setDeleting(false);
    }
  };

  // Compute Statistics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const assignedTeachers = teachers.filter(t => t.class_assigned || t.class_teacher_id || (t.assignedClasses && t.assignedClasses.length > 0)).length;
  const nfcTeachers = teachers.filter(t => t.nfc_card_uid || t.nfcCardUid).length;

  // Filtered Subject Options
  const subjectOptions = useMemo(() => {
    const subjects = new Set(['Mathematics', 'Science & Physics', 'English Language', 'Social Studies', 'Computer Science', 'Physical Education']);
    teachers.forEach(t => {
      if (t.subject) subjects.add(t.subject.trim());
    });
    return [
      { value: 'all', label: 'All Subjects / Specializations' },
      ...Array.from(subjects).map(s => ({ value: s, label: s }))
    ];
  }, [teachers]);

  // School Options for Filter & Drawer
  const schoolFilterOptions = useMemo(() => [
    { value: 'all', label: 'All Schools & Campuses' },
    ...schools.map(s => ({ value: String(s.id), label: `${s.school_name} (${s.code || 'SCH'})` }))
  ], [schools]);

  const schoolFormOptions = useMemo(() => schools.map(s => ({
    value: String(s.id),
    label: `${s.school_name} (${s.code || 'SCH'})`
  })), [schools]);

  // Client-side pagination
  const totalRecords = teachers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedTeachers = teachers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Table Columns Configuration
  const columns = [
    {
      header: 'Teacher / Faculty',
      accessor: 'name',
      render: (teacher) => {
        const rawPhoto = teacher.image_url || teacher.photo;
        const photoUrl = rawPhoto && !rawPhoto.includes('ui-avatars.com') ? rawPhoto : null;

        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm border border-primary-500/30 shadow-md shadow-primary-500/20 shrink-0 overflow-hidden relative">
              {photoUrl && (
                <img 
                  src={photoUrl} 
                  alt={teacher.name || 'Teacher'} 
                  className="w-full h-full object-cover relative z-10" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <span className="text-white font-black relative z-0">{teacher.name ? teacher.name[0].toUpperCase() : 'T'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Tooltip content={teacher.name}>
                  <Link 
                    href={`/teachers/${teacher.uuid || teacher.id}`} 
                    className="font-semibold text-slate-100 hover:text-primary-400 transition-colors truncate max-w-[150px]"
                  >
                    {teacher.name}
                  </Link>
                </Tooltip>
                <span className="font-mono text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50 shrink-0">
                  {teacher.employee_id || teacher.employeeId || `EMP-${teacher.id}`}
                </span>
              </div>
              {teacher.qualification && (
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                  {teacher.qualification}
                </p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'School / Institution',
      accessor: 'school_name',
      render: (teacher) => {
        const schoolObj = teacher.school || schools.find(s => String(s.id) === String(teacher.school_id) || String(s.uuid) === String(teacher.school_id));
        const schoolName = schoolObj?.school_name || teacher.school_name || 'N/A';
        const schoolCode = schoolObj?.code || teacher.school_code || null;
        const schoolUuid = schoolObj?.uuid || schoolObj?.id || teacher.school_id;
        
        const rawLogo = schoolObj?.logo_url || schoolObj?.logo;
        const schoolLogo = rawLogo ? (rawLogo.startsWith('http') || rawLogo.startsWith('data:') ? rawLogo : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${rawLogo.startsWith('/') ? rawLogo : `/${rawLogo}`}`) : null;

        return (
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden relative shadow-inner">
              {schoolLogo && (
                <img 
                  src={schoolLogo} 
                  alt={schoolName} 
                  className="w-full h-full object-cover rounded-lg relative z-10" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <span className="text-primary-400 font-black text-xs relative z-0">{schoolName ? schoolName[0].toUpperCase() : 'S'}</span>
            </div>
            <div className="min-w-0">
              <Tooltip content={schoolName}>
                <Link 
                  href={`/schools/${schoolUuid}`}
                  className="text-xs font-bold text-slate-100 hover:text-primary-400 transition-colors block truncate max-w-[170px]"
                >
                  {schoolName}
                </Link>
              </Tooltip>
              {schoolCode && (
                <span className="inline-block font-mono text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50 mt-0.5">
                  {schoolCode}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Subject / Department',
      accessor: 'subject',
      render: (teacher) => (
        <div className="space-y-1">
          <Badge variant="primary" className="rounded-lg text-xs font-semibold px-2.5 py-1 inline-flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{teacher.subject || 'General Faculty'}</span>
          </Badge>
        </div>
      )
    },
    {
      header: 'Contact Details',
      accessor: 'email',
      render: (teacher) => (
        <div className="space-y-0.5">
          {teacher.email && (
            <a 
              href={`mailto:${teacher.email}`}
              className="text-xs text-slate-300 hover:text-primary-400 flex items-center gap-1 truncate max-w-[170px]"
            >
              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{teacher.email}</span>
            </a>
          )}
          {teacher.phone && (
            <a 
              href={`tel:${teacher.phone}`} 
              className="inline-flex items-center gap-1 text-xs text-primary-400 hover:underline font-mono"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span>{teacher.phone}</span>
            </a>
          )}
        </div>
      )
    },
    {
      header: 'Services & NFC',
      accessor: 'nfc_card_uid',
      render: (teacher) => (
        <div className="flex items-center gap-1.5">
          {teacher.nfc_card_uid || teacher.nfcCardUid ? (
            <Badge variant="info" className="rounded-full text-[11px] px-2.5 py-0.5 flex items-center gap-1 font-mono">
              <CreditCard className="w-3 h-3" /> NFC Set
            </Badge>
          ) : (
            <span className="text-xs text-slate-500">No NFC</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (teacher) => (
        <Tooltip content={teacher.status === 'active' ? 'Click to deactivate faculty' : 'Click to activate faculty'}>
          <button
            type="button"
            onClick={() => handleToggleStatus(teacher)}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              teacher.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md ${
                teacher.status === 'active' ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
            <span className={`text-xs font-semibold capitalize ${
              teacher.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {teacher.status || 'inactive'}
            </span>
          </button>
        </Tooltip>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-4',
      render: (teacher) => (
        <div className="flex items-center justify-end space-x-2">
          <Tooltip content="View Profile">
            <Link
              href={`/teachers/${teacher.uuid || teacher.id}`}
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-primary-500/20 text-primary-400 transition cursor-pointer"
            >
              <Eye size={15} />
            </Link>
          </Tooltip>

          <Tooltip content="Edit Teacher">
            <button
              type="button"
              onClick={() => handleOpenEditModal(teacher)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
          </Tooltip>

          <Tooltip content="Delete Teacher" variant="danger">
            <button
              type="button"
              onClick={() => {
                setTeacherToDelete(teacher);
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
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">Teachers & Faculty Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Cross-institutional educator records, credentials, and Smart NFC assignments</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 rounded-xl shadow-lg shadow-primary-600/25"
          >
            <Plus size={16} />
            <span>Add New Teacher</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Faculty</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalTeachers}</h3>
            </div>
            <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Educators</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activeTeachers}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Classes Assigned</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{assignedTeachers}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">NFC Enabled</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">{nfcTeachers}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-lg relative z-30">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="relative w-full xl:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, emp ID, NFC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto justify-end">
            <div className="w-full sm:w-56 shrink-0">
              <Select
                options={schoolFilterOptions}
                value={selectedSchool}
                onChange={setSelectedSchool}
                searchable={true}
              />
            </div>

            <div className="w-full sm:w-52 shrink-0">
              <Select
                options={subjectOptions}
                value={subjectFilter}
                onChange={setSubjectFilter}
                searchable={true}
              />
            </div>

            <div className="w-full sm:w-40 shrink-0">
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active Faculty' },
                  { value: 'inactive', label: 'Inactive / Suspended' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Standard Data Table Component */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        loadingComponent={<TeacherTableSkeleton />}
        emptyMessage="No faculty records match your current filters."
      />

      {/* Add / Edit Teacher Drawer (Off-Canvas) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingTeacher ? 'Edit Teacher Details' : 'Register New Faculty Member'}
        subtitle={editingTeacher ? `Updating credentials for ${editingTeacher.name}` : 'Fill in profile, school assignment, and NFC details'}
        icon={Users}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDrawerOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="teacher-drawer-form"
              variant="primary"
              loading={submitting}
              className="rounded-xl shadow-lg shadow-primary-600/25"
            >
              {editingTeacher ? 'Update Teacher' : 'Save Teacher Record'}
            </Button>
          </div>
        }
      >
        <form id="teacher-drawer-form" onSubmit={handleFormSubmit} className="space-y-5">
          {/* Top Photo Upload Box */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Users size={26} className="text-slate-500" />
              )}
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-xs font-bold text-slate-200">Teacher Profile Photo</p>
              <p className="text-[11px] text-slate-400">JPG, PNG or WEBP up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
              />
            </div>
          </div>

          {/* School Assignment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Assigned School Institution <span className="text-rose-500">*</span>
            </label>
            <Select
              options={schoolFormOptions}
              value={formData.school_id}
              onChange={(val) => handleInputChange('school_id', val)}
              searchable={true}
              placeholder="Select School..."
              error={errors.school_id}
              required
            />
          </div>

          {/* Teacher Full Name & Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />
            <Input
              label="Employee ID / Code"
              placeholder="e.g. EMP-2026-001"
              value={formData.employee_id}
              onChange={(e) => handleInputChange('employee_id', e.target.value)}
              error={errors.employee_id}
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Email Address"
              type="email"
              placeholder="teacher@school.edu"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <FormPhoneInput
                value={formData.phone}
                onChange={(val) => handleInputChange('phone', val)}
                error={errors.phone}
              />
            </div>
          </div>

          {/* Academic Subject & Qualification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Subject / Department"
              placeholder="e.g. Mathematics, Science"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              error={errors.subject}
              required
            />
            <Input
              label="Highest Qualification"
              placeholder="e.g. M.Sc, B.Ed, Ph.D"
              value={formData.qualification}
              onChange={(e) => handleInputChange('qualification', e.target.value)}
              error={errors.qualification}
            />
          </div>

          {/* Smart NFC Card Assignment */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-primary-400">
              <CreditCard size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Smart Campus NFC Card Access</h4>
            </div>
            <Input
              placeholder="Tap or Enter NFC Card UID (e.g. 04:A2:3B:5C)"
              value={formData.nfc_card_uid}
              onChange={(e) => handleInputChange('nfc_card_uid', e.target.value)}
              error={errors.nfc_card_uid}
            />
            <p className="text-[11px] text-slate-500">
              Used for instant faculty biometric punch-in, smart attendance, and school gate verification.
            </p>
          </div>

          {/* Account Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Portal Status
            </label>
            <Select
              options={[
                { value: 'active', label: 'Active (Allowed to access Teacher Desk)' },
                { value: 'inactive', label: 'Inactive / Suspended' }
              ]}
              value={formData.status}
              onChange={(val) => handleInputChange('status', val)}
            />
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTeacherToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher Record"
        message={teacherToDelete ? `Are you sure you want to permanently remove "${teacherToDelete.name}"? This action will unlink all assigned classes.` : ''}
        confirmText="Yes, Delete Teacher"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
