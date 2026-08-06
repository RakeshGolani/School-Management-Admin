'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  School, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Building,
  ShieldCheck,
  Globe,
  Plus,
  SlidersHorizontal
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  getSchoolByIdAction, 
  updateSchoolAction, 
  deleteSchoolAction, 
  toggleSchoolStatusAction 
} from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SchoolDetailsSkeleton from '@/components/skeletons/SchoolDetailsSkeleton';

export default function SchoolDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSchool = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSchoolByIdAction(id);
      if (res.success) {
        setSchool(res.data);
      } else {
        notifyError(res.message || 'School institution not found');
        router.push('/schools');
      }
    } catch (err) {
      notifyError('Failed to load institution details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  const handleToggleStatus = async () => {
    if (!school) return;
    const newStatus = school.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await toggleSchoolStatusAction(school.id, newStatus);
      if (res.success) {
        notifySuccess(`Status changed to ${newStatus}`);
        setSchool(prev => ({ ...prev, status: newStatus }));
      } else {
        notifyError(res.message || 'Failed to update status');
      }
    } catch (err) {
      notifyError('Failed to change status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!school) return;
    setDeleting(true);
    try {
      const res = await deleteSchoolAction(school.id);
      if (res.success) {
        notifySuccess('School record deleted successfully');
        router.push('/schools');
      } else {
        notifyError(res.message || 'Failed to delete school');
      }
    } catch (err) {
      notifyError('Error occurred while deleting school');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <SchoolDetailsSkeleton />;
  }

  if (!school) return null;

  const logoUrl = school.logo 
    ? (school.logo.startsWith('http') ? school.logo : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${school.logo}`)
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/schools" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Institutions List</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl px-4 py-2 text-xs"
          >
            <Trash2 size={14} className="mr-1.5" /> Delete School
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Decorative background glow */}
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10 blur-[80px]"
          style={{ backgroundColor: school.primary_color || '#f59e0b' }}
        />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Logo box */}
            <div className="w-24 h-24 rounded-3xl bg-slate-850 border-2 border-slate-700/80 flex items-center justify-center p-1.5 shadow-xl overflow-hidden shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={school.school_name} 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              ) : (
                <School size={48} className="text-amber-500" />
              )}
            </div>

            {/* Title Info */}
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                {school.school_name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs">
                <span className="font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg text-amber-400 font-bold border border-slate-700/60">
                  CODE: {school.code}
                </span>
                <Badge variant={school.status === 'active' ? 'success' : 'danger'} className="px-3 py-1 font-bold">
                  {school.status === 'active' ? 'Active Status' : 'Suspended'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Quick Switch */}
          <div className="flex flex-col items-center md:items-end gap-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Institution Access</span>
            <button
              onClick={handleToggleStatus}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                school.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md ${
                  school.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className={`text-xs font-bold capitalize ${
                school.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {school.status || 'inactive'}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: School Profile & Custom Theme */}
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
            <Building size={18} className="text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Institution Details</h3>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-3 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium col-span-1">Full Name</span>
              <span className="text-slate-200 font-semibold col-span-2">{school.school_name}</span>
            </div>

            <div className="grid grid-cols-3 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium col-span-1">School Code</span>
              <span className="text-slate-200 font-mono font-bold col-span-2">{school.code}</span>
            </div>

            {school.website && (
              <div className="grid grid-cols-3 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium col-span-1">Website URL</span>
                <span className="col-span-2">
                  <a 
                    href={school.website.startsWith('http') ? school.website : `https://${school.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-teal-400 hover:underline font-semibold"
                  >
                    <Globe size={13} />
                    {school.website}
                  </a>
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium col-span-1">School Branding</span>
              <span className="col-span-2 flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border border-slate-700/80 shadow-md"
                  style={{ backgroundColor: school.primary_color || '#f59e0b' }}
                />
                <span className="text-slate-300 font-mono text-xs">{school.primary_color || '#f59e0b'} (Primary)</span>
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Contact Information */}
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
            <Phone size={18} className="text-teal-400" />
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Contact & Address</h3>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-3 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium col-span-1">Institution Email</span>
              <span className="col-span-2">
                <a 
                  href={`mailto:${school.email}`} 
                  className="inline-flex items-center gap-1 text-teal-400 hover:underline font-semibold"
                >
                  <Mail size={13} />
                  {school.email}
                </a>
              </span>
            </div>

            {school.phone && (
              <div className="grid grid-cols-3 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium col-span-1">Phone Contact</span>
                <span className="col-span-2">
                  <a 
                    href={`tel:${school.phone}`} 
                    className="inline-flex items-center gap-1 text-teal-400 hover:underline font-semibold"
                  >
                    <Phone size={13} />
                    {school.phone}
                  </a>
                </span>
              </div>
            )}

            {school.address && (
              <div className="grid grid-cols-3 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium col-span-1">Physical Address</span>
                <span className="text-slate-200 font-medium col-span-2 leading-relaxed">{school.address}</span>
              </div>
            )}

            <div className="grid grid-cols-3 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium col-span-1">Registered On</span>
              <span className="text-slate-300 font-semibold col-span-2 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-500" />
                {school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Institution Profile?"
        message={`Are you sure you want to permanently delete the institution profile for "${school.school_name}"? This action is irreversible and deletes all associated configurations.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
