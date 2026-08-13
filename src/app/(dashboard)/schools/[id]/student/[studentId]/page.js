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

export default function AdminSchoolStudentDetailsPage() {
  const { id: schoolId, studentId } = useParams();
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
      const res = await getStudentByIdAction(studentId);
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
  }, [studentId]);

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
      school_id: student.school_id || schoolId || '',
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
    setPhotoPreview(student.image_url || student.photo || null);
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
        router.push(`/schools/${schoolId}`);
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
        <Link href={`/schools/${schoolId}`}>
          <Button variant="primary" className="mt-2 rounded-xl">Back to School Institution</Button>
        </Link>
      </div>
    );
  }

  const photoUrl = student.image_url || student.photo || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/schools/${schoolId}`} 
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to School Institution
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 text-xs py-1.5"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Profile
          </Button>

          <Button
            variant="outline"
            onClick={openEditModal}
            className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 text-xs py-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Record
          </Button>

          <Button
            variant="ghost"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs py-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Student Banner */}
      <Card className="p-6 md:p-8 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border-2 border-slate-700 flex items-center justify-center text-3xl font-black text-amber-400 overflow-hidden shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={`${student.first_name} ${student.last_name}`} className="w-full h-full object-cover" />
            ) : (
              `${student.first_name?.charAt(0) || ''}${student.last_name?.charAt(0) || ''}`
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-100">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-xs font-mono font-bold text-amber-400 mt-1">
                  Roll No: {student.roll_no || student.roll_number || `#${student.id}`}
                </p>
              </div>

              <div className="flex items-center justify-center md:justify-end gap-2">
                <Badge variant={student.status === 'active' ? 'success' : 'danger'} className="px-3 py-1 text-xs">
                  ● {student.status || 'Active'}
                </Badge>
                <button
                  onClick={handleToggleStatus}
                  className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
                >
                  Change Status
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Class & Section</span>
                <span className="font-bold text-slate-200">
                  {student.schoolClass ? `${student.schoolClass.class_name} (${student.schoolClass.section || 'A'})` : student.grade || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Gender</span>
                <span className="font-bold text-slate-200 capitalize">{student.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Date of Birth</span>
                <span className="font-bold text-slate-200">{student.dob || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block">Institution</span>
                <span className="font-bold text-slate-200">{student.school?.school_name || 'School Campus'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guardian & Emergency Info */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-base text-slate-100">Parent & Guardian Information</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 font-medium">Guardian Name</span>
              <span className="font-bold text-slate-200">{student.guardian_name || student.parent?.father_name || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 font-medium">Contact Phone</span>
              <span className="font-bold text-slate-200">{student.guardian_phone || student.parent?.phone || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 font-medium">Guardian Email</span>
              <span className="font-bold text-teal-400">{student.guardian_email || student.parent?.email || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Smart Card & Transport */}
        <Card className="p-6 border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-base text-slate-100">Smart Cards & Facilities</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" /> NFC Identification Card
              </span>
              <span className="font-mono font-bold text-amber-400">{student.nfc_card_uid || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 font-medium flex items-center gap-2">
                <Bus className="w-4 h-4 text-indigo-400" /> Bus Transport Service
              </span>
              <Badge variant={student.is_bus_service_enabled ? 'success' : 'neutral'}>
                {student.is_bus_service_enabled ? 'Subscribed' : 'Not Subscribed'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record?"
        message={`Are you sure you want to permanently delete student profile "${student.first_name} ${student.last_name}"?`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
