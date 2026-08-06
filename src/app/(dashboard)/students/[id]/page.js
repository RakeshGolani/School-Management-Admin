'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Bus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  School as SchoolIcon,
  ShieldCheck,
  Building,
  UserCheck,
  Clock,
  Printer,
  X
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { 
  getStudentByIdAction, 
  updateStudentAction, 
  deleteStudentAction, 
  toggleStudentStatusAction 
} from '@/actions/studentActions';
import { getSchoolsAction } from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormPhoneInput from '@/components/FormPhoneInput';
import Input from '@/components/ui/Input';
import StudentDetailsSkeleton from '@/components/skeletons/StudentDetailsSkeleton';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Edit Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    admission_number: '',
    school_id: '',
    grade: '',
    section: '',
    gender: '',
    dob: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    alternate_phone: '',
    nfc_card_uid: '',
    is_bus_service_enabled: false
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentByIdAction(id);
      if (res.status === 'success' || res.success) {
        setStudent(res.data);
      } else {
        notifyError(res.message || 'Student profile not found');
      }
    } catch (err) {
      notifyError('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSchools = useCallback(async () => {
    try {
      const res = await getSchoolsAction();
      if (res.success && Array.isArray(res.data)) {
        setSchools(res.data);
      }
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  }, []);

  useEffect(() => {
    fetchStudent();
    fetchSchools();
  }, [fetchStudent, fetchSchools]);

  const openEditModal = () => {
    if (!student) return;
    setFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      school_id: student.school_id || '',
      grade: student.grade || 'Grade 10',
      section: student.section || 'A',
      gender: student.gender || 'male',
      dob: student.dob || '',
      guardian_name: student.guardian_name || '',
      guardian_email: student.guardian_email || student.parent?.email || '',
      guardian_phone: student.guardian_phone || '',
      alternate_phone: student.alternate_phone || '',
      nfc_card_uid: student.nfc_card_uid || '',
      is_bus_service_enabled: Boolean(student.is_bus_service_enabled),
      photo: null
    });
    setPhotoPreview(student.photo ? (student.photo.startsWith('http') ? student.photo : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${student.photo}`) : null);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
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

      const res = await updateStudentAction(student.id, submitData);
      if (res.status === 'success' || res.success) {
        notifySuccess('Student profile updated successfully');
        setModalOpen(false);
        fetchStudent();
      } else {
        notifyError(res.message || 'Failed to update student');
      }
    } catch (err) {
      notifyError('Failed to update student profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!student) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await toggleStudentStatusAction(student.id, newStatus);
      if (res.status === 'success' || res.success) {
        notifySuccess(`Status changed to ${newStatus}`);
        fetchStudent();
      } else {
        notifyError(res.message || 'Failed to toggle status');
      }
    } catch (err) {
      notifyError('Error toggling status');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await deleteStudentAction(student.id);
      if (res.status === 'success' || res.success) {
        notifySuccess('Student record deleted successfully');
        router.push('/students');
      } else {
        notifyError(res.message || 'Failed to delete student');
      }
    } catch (err) {
      notifyError('Failed to delete student record');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <StudentDetailsSkeleton />;
  }

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <GraduationCap className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Student Profile Not Found</h2>
        <Link href="/students">
          <Button variant="primary" className="mt-2 rounded-xl">Back to Students List</Button>
        </Link>
      </div>
    );
  }

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

  const photoUrl = student.photo 
    ? (student.photo.startsWith('http') ? student.photo : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${student.photo}`)
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/students" 
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl text-slate-300 border-slate-700 text-xs px-3.5 py-2"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Profile
          </Button>

          <Button
            variant="outline"
            onClick={openEditModal}
            className="rounded-xl text-slate-200 border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs px-3.5 py-2"
          >
            <Edit3 className="w-4 h-4 mr-1.5 text-indigo-400" /> Edit Profile
          </Button>

          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl text-rose-400 border-slate-700 hover:bg-rose-500/10 text-xs px-3.5 py-2"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Record
          </Button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-6 md:p-8 border-slate-800/80 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar */}
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={student.first_name} 
              className="w-28 h-28 rounded-3xl object-cover border-2 border-slate-700 shadow-xl" 
            />
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-teal-400 text-3xl border-2 border-slate-700 shadow-xl">
              {student.first_name ? student.first_name[0].toUpperCase() : 'S'}
            </div>
          )}

          {/* Core Bio */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
                {student.first_name} {student.last_name}
              </h1>
              <Badge 
                variant={student.status === 'active' ? 'emerald' : 'secondary'}
                className="text-xs uppercase font-semibold tracking-wider rounded-full px-3 py-1"
              >
                {student.status || 'inactive'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-400">
              <span className="font-mono bg-slate-800 px-2.5 py-1 rounded-lg text-slate-200 border border-slate-700/80">
                {student.admission_number || `ADM-${student.id}`}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-300">{student.grade || 'Grade 10'}</span>
              {student.section && (
                <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-md text-xs font-semibold">
                  Section {student.section}
                </span>
              )}
              <span>•</span>
              <span className="capitalize">{student.gender || 'male'}</span>
            </div>

            {/* Status Switch bar */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <span className="text-xs text-slate-400">Account Status:</span>
              <button
                onClick={handleToggleStatus}
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
                  Toggle to {student.status === 'active' ? 'Inactive' : 'Active'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Identification Details */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Personal Information</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">First Name</span>
              <span className="font-semibold text-slate-200">{student.first_name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Last Name</span>
              <span className="font-semibold text-slate-200">{student.last_name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Gender</span>
              <span className="font-semibold text-slate-200 capitalize">{student.gender || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Date of Birth</span>
              <span className="font-semibold text-slate-200">{student.dob || 'Not specified'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">NFC Smart Card</span>
              {student.nfc_card_uid ? (
                <span className="font-mono text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-semibold">
                  {student.nfc_card_uid}
                </span>
              ) : (
                <span className="text-slate-500 italic">Not assigned</span>
              )}
            </div>
          </div>
        </Card>

        {/* Academic Details */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Academic Overview</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Current Grade</span>
              <span className="font-semibold text-slate-200">{student.grade || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Section</span>
              <span className="font-semibold text-slate-200">{student.section || 'A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Admission Number</span>
              <span className="font-mono text-slate-200 font-semibold">{student.admission_number || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Admission Date</span>
              <span className="font-semibold text-slate-300">
                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        {/* Parent & Guardian Info */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Guardian Contact</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Guardian Name</span>
              <span className="font-semibold text-slate-200">{student.guardian_name || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Guardian Email</span>
              <span className="font-semibold text-slate-200">{student.parent?.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Primary Phone</span>
              {student.guardian_phone ? (
                <a href={`tel:${student.guardian_phone}`} className="text-teal-400 hover:underline font-medium">
                  {student.guardian_phone}
                </a>
              ) : (
                <span className="text-slate-500">N/A</span>
              )}
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Alternate Phone</span>
              <span className="text-slate-300">{student.alternate_phone || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Transportation & Bus Service */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Transport & Bus Subscription</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Bus Transport Service</span>
              {student.is_bus_service_enabled ? (
                <Badge variant="warning" className="rounded-full text-xs font-semibold px-2.5 py-0.5">
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-2.5 py-0.5">
                  Disabled
                </Badge>
              )}
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Assigned Bus Route</span>
              <span className="font-semibold text-slate-300">
                {student.busRoute?.route_name || 'Not assigned'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Designated Stop</span>
              <span className="font-semibold text-slate-300">
                {student.busStop?.stop_name || 'Not assigned'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Student Drawer (Off-Canvas) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Edit Student Details</h2>
                <p className="text-xs text-slate-400">Fill in mandatory details for official school records</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-hidden">
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
              <div className="p-6 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md flex justify-end space-x-3 shrink-0">
                <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${student.first_name} ${student.last_name}'s admission record?`}
        confirmText="Delete Record"
        cancelText="Cancel"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
}
