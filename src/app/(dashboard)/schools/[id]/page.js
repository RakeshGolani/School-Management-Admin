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
  Trash2, 
  Globe, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  Receipt,
  Search,
  ExternalLink,
  UserCheck,
  Eye
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import { 
  getSchoolByIdAction, 
  deleteSchoolAction, 
  toggleSchoolStatusAction 
} from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SchoolDetailsSkeleton from '@/components/skeletons/SchoolDetailsSkeleton';
import Tooltip from '@/components/ui/Tooltip';
import CustomPricingForm from '@/components/schools/CustomPricingForm';

function SchoolAcademicYearsList({ schoolId }) {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadYears() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/school/academic-years?school_id=${schoolId}`);
        const data = await res.json();
        if (data.success) {
          setYears(data.data);
        }
      } catch (e) {
        console.error('Failed to load school academic years', e);
      } finally {
        setLoading(false);
      }
    }
    if (schoolId) loadYears();
  }, [schoolId]);

  if (loading) {
    return <div className="text-xs text-slate-500 py-4 animate-pulse">Loading academic sessions...</div>;
  }

  if (years.length === 0) {
    return (
      <div className="text-xs text-slate-400 py-3 italic">
        No academic years configured for this institution yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2">
            <th className="py-2.5 px-3">Session Name</th>
            <th className="py-2.5 px-3">Start Date</th>
            <th className="py-2.5 px-3">End Date</th>
            <th className="py-2.5 px-3">Active Status</th>
            <th className="py-2.5 px-3">Phase</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {years.map((y) => (
            <tr key={y.id} className="hover:bg-slate-800/40 transition">
              <td className="py-3 px-3 font-bold text-slate-200">{y.year_name}</td>
              <td className="py-3 px-3 text-slate-400">{y.start_date}</td>
              <td className="py-3 px-3 text-slate-400">{y.end_date}</td>
              <td className="py-3 px-3">
                {y.is_active ? (
                  <Badge variant="success" className="px-2 py-0.5 text-[10px] font-extrabold">ACTIVE</Badge>
                ) : (
                  <span className="text-slate-500 font-semibold">Inactive</span>
                )}
              </td>
              <td className="py-3 px-3">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {y.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchoolDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, teachers, students, classes, billing

  // Filter states for sub-tabs
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSchool = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSchoolByIdAction(id);
      if (res.success && res.data) {
        if (res.data.school) {
          setDetailData(res.data);
        } else {
          setDetailData({
            school: res.data,
            stats: { totalTeachers: 0, totalStudents: 0, totalClasses: 0, activeStudents: 0 },
            teachers: [],
            students: [],
            classes: [],
            subscription: null,
            transactions: []
          });
        }
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
    if (!detailData?.school) return;
    const currentSchool = detailData.school;
    const newStatus = currentSchool.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await toggleSchoolStatusAction(currentSchool.id, newStatus);
      if (res.success) {
        notifySuccess(`Status changed to ${newStatus}`);
        setDetailData(prev => ({
          ...prev,
          school: { ...prev.school, status: newStatus }
        }));
      } else {
        notifyError(res.message || 'Failed to update status');
      }
    } catch (err) {
      notifyError('Failed to change status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!detailData?.school) return;
    setDeleting(true);
    try {
      const res = await deleteSchoolAction(detailData.school.id);
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

  if (!detailData || !detailData.school) return null;

  const { school, stats = {}, teachers = [], students = [], classes = [], subscription, transactions = [] } = detailData;

  const logoUrl = school.logo_url || school.logo || null;

  // Filtered lists
  const filteredTeachers = teachers.filter(t => 
    (t.name ? t.name : `${t.first_name || ''} ${t.last_name || ''}`).toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.email && t.email.toLowerCase().includes(teacherSearch.toLowerCase())) ||
    (t.subject && t.subject.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  const filteredStudents = students.filter(s => 
    `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.admission_no && s.admission_no.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.schoolClass?.class_name && s.schoolClass.class_name.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const filteredClasses = classes.filter(c => 
    c.class_name?.toLowerCase().includes(classSearch.toLowerCase()) ||
    c.section?.toLowerCase().includes(classSearch.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview & Info', icon: School, count: null },
    { id: 'teachers', label: 'Teachers Faculty', icon: Users, count: teachers.length },
    { id: 'students', label: 'Students Directory', icon: GraduationCap, count: students.length },
    { id: 'classes', label: 'Classes & Sections', icon: BookOpen, count: classes.length },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard, count: subscription ? (subscription.status || 'Active') : 'Free' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumbs & Top Actions */}
      <div className="flex items-center justify-between">
        <Link 
          href="/schools" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Institutions Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <Tooltip content="Delete this institution permanently" position="left">
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-xl px-4 py-2 text-xs font-semibold shadow-lg shadow-rose-950/20"
            >
              <Trash2 size={14} className="mr-1.5" /> Delete Institution
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Hero Profile Banner Header */}
      <Card className="border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-15 blur-[100px] pointer-events-none"
          style={{ backgroundColor: school.primary_color || '#3b82f6' }}
        />
        <div 
          className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full opacity-10 blur-[80px] pointer-events-none"
          style={{ backgroundColor: school.primary_color || '#3b82f6' }}
        />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-slate-850 border-2 border-slate-700/80 flex items-center justify-center p-2 shadow-2xl overflow-hidden shrink-0 group hover:scale-105 transition-transform duration-300">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={school.school_name} 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              ) : (
                <School size={52} style={{ color: school.primary_color || '#3b82f6' }} />
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                  {school.school_name}
                </h1>
                <Badge 
                  variant={school.status === 'active' ? 'success' : 'danger'} 
                  className="px-3 py-1 font-extrabold text-xs shadow-sm uppercase tracking-wider"
                >
                  {school.status === 'active' ? '● Active' : '● Suspended'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                <span className="font-mono bg-slate-800/90 px-3 py-1 rounded-xl text-slate-200 font-bold border border-slate-700/60 shadow-inner">
                  CODE: <span className="text-amber-400">{school.code}</span>
                </span>

                {school.email && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Mail size={13} className="text-slate-500" />
                    {school.email}
                  </span>
                )}

                {school.phone && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Phone size={13} className="text-slate-500" />
                    {school.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md shrink-0 shadow-lg">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">Portal Access Status</span>
            <Tooltip content={school.status === 'active' ? 'Click to deactivate school access' : 'Click to activate school access'} position="left">
              <button
                onClick={handleToggleStatus}
                className="flex items-center gap-3 group cursor-pointer focus:outline-none bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition"
              >
                <div className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                  school.status === 'active' ? 'bg-emerald-500' : 'bg-slate-700'
                }`}>
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-md ${
                    school.status === 'active' ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </div>
                <span className={`text-xs font-black capitalize ${
                  school.status === 'active' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {school.status || 'inactive'}
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:border-slate-700/80 transition">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
            <p className="text-xl font-black text-slate-100">{stats.totalTeachers || teachers.length || 0}</p>
          </div>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:border-slate-700/80 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
            <p className="text-xl font-black text-slate-100">{stats.totalStudents || students.length || 0}</p>
          </div>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:border-slate-700/80 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Classes</p>
            <p className="text-xl font-black text-slate-100">{stats.totalClasses || classes.length || 0}</p>
          </div>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 hover:border-slate-700/80 transition">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Status</p>
            <p className="text-sm font-black text-purple-400 uppercase">
              {subscription ? (subscription.plan_type ? `${subscription.plan_type} Tier` : subscription.status || 'Active') : 'Free Tier'}
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 border border-transparent'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* TAB 1: OVERVIEW & INSTITUTION DETAILS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <School size={18} className="text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Institution Profile</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  ID: #{school.id}
                </span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-medium col-span-1">Full Name</span>
                  <span className="text-slate-200 font-semibold col-span-2">{school.school_name}</span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-medium col-span-1">School Code</span>
                  <span className="text-amber-400 font-mono font-bold col-span-2">{school.code}</span>
                </div>

                {school.website && (
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400 font-medium col-span-1">Website</span>
                    <span className="col-span-2">
                      <a 
                        href={school.website.startsWith('http') ? school.website : `https://${school.website}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-teal-400 hover:underline font-semibold"
                      >
                        <Globe size={13} />
                        {school.website}
                        <ExternalLink size={11} className="text-teal-500" />
                      </a>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-medium col-span-1">Primary Color</span>
                  <span className="col-span-2 flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full border border-slate-700 shadow-md shrink-0"
                      style={{ backgroundColor: school.primary_color || '#3b82f6' }}
                    />
                    <span className="text-slate-300 font-mono text-xs">{school.primary_color || '#3b82f6'}</span>
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
                <Phone size={18} className="text-teal-400" />
                <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Contact & Address</h3>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-medium col-span-1">Email Address</span>
                  <span className="col-span-2">
                    <a 
                      href={`mailto:${school.email}`} 
                      className="inline-flex items-center gap-1.5 text-teal-400 hover:underline font-semibold"
                    >
                      <Mail size={13} />
                      {school.email}
                    </a>
                  </span>
                </div>

                {school.phone && (
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400 font-medium col-span-1">Phone Number</span>
                    <span className="col-span-2">
                      <a 
                        href={`tel:${school.phone}`} 
                        className="inline-flex items-center gap-1.5 text-teal-400 hover:underline font-semibold"
                      >
                        <Phone size={13} />
                        {school.phone}
                      </a>
                    </span>
                  </div>
                )}

                {school.address && (
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400 font-medium col-span-1">Address</span>
                    <span className="text-slate-200 font-medium col-span-2 leading-relaxed">{school.address}</span>
                  </div>
                )}

                <div className="grid grid-cols-3">
                  <span className="text-slate-400 font-medium col-span-1">Created Date</span>
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

          <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-amber-400" />
                <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Academic Sessions Config</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-lg">
                Multi-Session Scoped
              </span>
            </div>

            <SchoolAcademicYearsList schoolId={school.id} />
          </Card>
        </div>
      )}

      {/* TAB 2: TEACHERS LIST */}
      {activeTab === 'teachers' && (
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Users size={18} className="text-blue-400" />
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                Teachers Directory ({teachers.length})
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search teacher..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <DataTable
            data={filteredTeachers}
            emptyMessage="No teachers registered under this school institution."
            pageSizeOptions={[5, 10, 25]}
            columns={[
              {
                header: 'Teacher Name',
                accessor: 'name',
                cell: (t) => (
                  <span className="font-bold text-slate-200">
                    {t.name || `${t.first_name || ''} ${t.last_name || ''}`}
                  </span>
                )
              },
              {
                header: 'Email',
                accessor: 'email',
                cell: (t) => <span className="text-teal-400 font-semibold">{t.email}</span>
              },
              {
                header: 'Phone',
                accessor: 'phone',
                cell: (t) => <span className="text-slate-400">{t.phone || 'N/A'}</span>
              },
              {
                header: 'Subject Specialty',
                accessor: 'subject',
                cell: (t) => (
                  <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                    {t.subject || 'General'}
                  </span>
                )
              },
              {
                header: 'Assigned Class',
                accessor: 'classAssigned',
                cell: (t) => (
                  <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    {t.classAssigned || t.class_assigned || 'Unassigned'}
                  </span>
                )
              },
              {
                header: 'Joined Date',
                accessor: 'createdAt',
                cell: (t) => (
                  <span className="text-slate-400 font-medium">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                )
              },
              {
                header: 'Action',
                cell: (t) => (
                  <Tooltip content="View Teacher Profile" position="top">
                    <Link
                      href={`/schools/${id}/teacher/${t.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-extrabold text-xs border border-blue-500/20 transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Profile</span>
                    </Link>
                  </Tooltip>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* TAB 3: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap size={18} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                Enrolled Students ({students.length})
              </h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search student or class..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <DataTable
            data={filteredStudents}
            emptyMessage="No active student records found for this school."
            pageSizeOptions={[5, 10, 25]}
            columns={[
              {
                header: 'Roll No',
                accessor: 'roll_no',
                cell: (s) => (
                  <span className="font-mono font-bold text-amber-400">
                    {s.roll_no || s.roll_number || `#${s.id}`}
                  </span>
                )
              },
              {
                header: 'Student Name',
                accessor: 'first_name',
                cell: (s) => (
                  <span className="font-bold text-slate-200">
                    {s.first_name} {s.last_name}
                  </span>
                )
              },
              {
                header: 'Class & Section',
                cell: (s) => (
                  <span className="text-slate-300 font-semibold">
                    {s.schoolClass ? `${s.schoolClass.class_name} (${s.schoolClass.section || 'A'})` : 'Unassigned'}
                  </span>
                )
              },
              {
                header: 'Gender',
                accessor: 'gender',
                cell: (s) => <span className="text-slate-400 capitalize">{s.gender || 'N/A'}</span>
              },
              {
                header: 'Status',
                accessor: 'status',
                cell: (s) => (
                  <Badge variant={s.status === 'active' ? 'success' : 'danger'} className="px-2.5 py-0.5 text-[10px]">
                    {s.status || 'Active'}
                  </Badge>
                )
              },
              {
                header: 'Action',
                cell: (s) => (
                  <Tooltip content="View Student Profile" position="top">
                    <Link
                      href={`/schools/${id}/student/${s.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/20 transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Profile</span>
                    </Link>
                  </Tooltip>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* TAB 4: CLASSES & SECTIONS */}
      {activeTab === 'classes' && (
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <BookOpen size={20} className="text-amber-400" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">
                  Classes & Enrolled Student Breakdown ({classes.length})
                </h3>
                <p className="text-xs text-slate-400">Classwise distribution of enrolled students and assigned class faculty.</p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-800/40 space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-600 mb-2" />
              <p>No classes configured yet for this school institution.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClasses.map((c) => {
                // Calculate student count for this specific class
                const classStudents = students.filter(s => 
                  s.class_id === c.id || (s.schoolClass && s.schoolClass.id === c.id)
                );
                const count = classStudents.length;
                const maleCount = classStudents.filter(s => (s.gender || '').toLowerCase() === 'male').length;
                const femaleCount = classStudents.filter(s => (s.gender || '').toLowerCase() === 'female').length;

                return (
                  <div 
                    key={c.id} 
                    className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 p-5 space-y-4 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {/* Header: Class Name + Section Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm group-hover:scale-110 transition-transform">
                          {c.class_name ? c.class_name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-base group-hover:text-amber-400 transition-colors">
                            {c.class_name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Section {c.section || 'A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                          <GraduationCap size={13} />
                          {count} {count === 1 ? 'Student' : 'Students'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar / Student Count Visual Strip */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>Total Enrolled</span>
                        <span className="text-slate-200 font-bold">{count} Enrolled</span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-500" 
                          style={{ width: count > 0 ? `${(maleCount / count) * 100}%` : '50%' }}
                          title={`Boys: ${maleCount}`}
                        />
                        <div 
                          className="bg-pink-500 h-full transition-all duration-500" 
                          style={{ width: count > 0 ? `${(femaleCount / count) * 100}%` : '50%' }}
                          title={`Girls: ${femaleCount}`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          ● Male: {maleCount}
                        </span>
                        <span className="flex items-center gap-1 text-pink-400 font-medium">
                          ● Female: {femaleCount}
                        </span>
                      </div>
                    </div>

                    {/* Class Teacher Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <UserCheck size={14} className="text-slate-500" />
                        Class Faculty:
                      </span>
                      <span className="font-bold text-slate-200 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                        {c.classTeacher ? (c.classTeacher.name || `${c.classTeacher.first_name || ''} ${c.classTeacher.last_name || ''}`) : 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 5: BILLING & SUBSCRIPTION PLAN */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <CreditCard size={18} className="text-purple-400" />
                <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Subscription & Plan Details</h3>
              </div>
              {subscription && (
                <Badge variant={subscription.status === 'active' ? 'success' : 'danger'} className="px-3 py-1 font-bold">
                  {subscription.status ? subscription.status.toUpperCase() : 'ACTIVE'}
                </Badge>
              )}
            </div>

            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Plan Tier</span>
                  <p className="text-lg font-black text-purple-400 uppercase">{subscription.plan_type || 'Monthly Tier'}</p>
                  <p className="text-xs text-slate-500">Billing Cycle: {subscription.plan_type === 'yearly' ? 'Yearly' : 'Monthly'}</p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max Quota Limits</span>
                  <p className="text-lg font-black text-slate-100">
                    {subscription.max_students_limit !== undefined ? `${subscription.max_students_limit} Students` : 'Unlimited'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Buses Quota: {subscription.max_buses_limit !== undefined ? `${subscription.max_buses_limit} Buses` : 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Validity Period</span>
                  <p className="text-xs font-mono font-bold text-slate-200 mt-1">
                    {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    {' - '}
                    {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">Status: <span className="text-emerald-400 font-semibold capitalize">{subscription.status || 'Active'}</span></p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/40 text-slate-400 text-xs italic">
                No active paid subscription found. Defaulting to free tier level.
              </div>
            )}
          </Card>

          {/* Custom Pricing Form */}
          <CustomPricingForm schoolId={school.id} subscription={subscription} />

          {/* Transaction & Invoices Table */}
          <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
              <Receipt size={18} className="text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Billing History & Invoices</h3>
            </div>

            <DataTable
              data={transactions}
              emptyMessage="No transaction records available."
              pageSizeOptions={[5, 10, 25]}
              columns={[
                {
                  header: 'Txn Ref',
                  accessor: 'transaction_ref',
                  cell: (txn) => (
                    <span className="font-mono text-amber-400 font-bold">
                      {txn.transaction_ref || `#TXN-${txn.id}`}
                    </span>
                  )
                },
                {
                  header: 'Amount',
                  accessor: 'amount',
                  cell: (txn) => <span className="font-bold text-slate-100">${txn.amount}</span>
                },
                {
                  header: 'Payment Method',
                  accessor: 'payment_method',
                  cell: (txn) => <span className="text-slate-400 uppercase">{txn.payment_method || 'Card'}</span>
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  cell: (txn) => (
                    <Badge variant={txn.status === 'success' ? 'success' : 'danger'} className="px-2.5 py-0.5 text-[10px]">
                      {txn.status || 'Completed'}
                    </Badge>
                  )
                },
                {
                  header: 'Date',
                  accessor: 'createdAt',
                  cell: (txn) => (
                    <span className="text-slate-400 font-medium">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  )
                }
              ]}
            />
          </Card>
        </div>
      )}

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
