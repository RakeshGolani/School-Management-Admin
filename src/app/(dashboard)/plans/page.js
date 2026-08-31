'use client';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Edit3, 
  CheckCircle2, 
  SlidersHorizontal, 
  Plus, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Star, 
  Zap, 
  ArrowRight, 
  IndianRupee, 
  CreditCard, 
  Tag, 
  Gem, 
  School, 
  Boxes,
  BookOpen,
  Bus,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Landmark,
  CalendarDays,
  XCircle,
  X,
  Info,
  ChevronRight,
  TrendingUp,
  CheckCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import Drawer from '@/components/ui/Drawer';
import Checkbox from '@/components/ui/Checkbox';
import { getPlansAction, updatePlanAction } from '@/actions/planActions';
import { SYSTEM_MODULES } from '@/config/modules';
import { notifySuccess, notifyError } from '@/lib/notify';
import PlanSkeleton from '@/components/skeletons/PlanSkeleton';

const MODULE_ICONS = {
  Users,
  Bus,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Landmark,
  CalendarDays,
  Layers,
  Boxes,
  School,
  Sparkles
};

export default function PlansManagementPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState('pricing');
  const [saving, setSaving] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'matrix'
  const [newFeatureText, setNewFeatureText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    badge_text: '',
    badge_color: 'indigo',
    icon: 'Layers',
    monthly_price: 0,
    annual_price: 0,
    currency: 'INR',
    currency_symbol: '₹',
    is_popular: false,
    base_students_limit: 50,
    base_buses_limit: 5,
    description: '',
    modules: [],
    features: [],
    is_active: true,
    sort_order: 1
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlansAction();
      if (res.success && Array.isArray(res.data?.plans || res.data?.packages || res.data)) {
        setPlans(res.data.plans || res.data.packages || res.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return <PlanSkeleton />;
  }

  const openEditDrawer = (plan, initialTab = 'pricing') => {
    setEditingPlan(plan);
    setActiveDrawerTab(initialTab);

    let initialFeatures = [];
    if (Array.isArray(plan.features)) {
      initialFeatures = plan.features.map(f => typeof f === 'string' ? f : f.feature_text).filter(Boolean);
    }

    setFormData({
      name: plan.name || '',
      tagline: plan.tagline || '',
      badge_text: plan.badge_text || '',
      badge_color: plan.badge_color || 'indigo',
      icon: plan.icon || 'Layers',
      monthly_price: plan.monthly_price !== undefined ? plan.monthly_price : 0,
      annual_price: plan.annual_price !== undefined ? plan.annual_price : 0,
      currency: plan.currency || 'INR',
      currency_symbol: plan.currency_symbol || '₹',
      is_popular: Boolean(plan.is_popular),
      base_students_limit: plan.base_students_limit !== undefined ? plan.base_students_limit : 50,
      base_buses_limit: (!plan.modules || !plan.modules.includes('transport') || plan.code === 'SCHOOL_ONLY') 
        ? 0 
        : (plan.base_buses_limit !== undefined ? plan.base_buses_limit : 5),
      description: plan.description || '',
      modules: Array.isArray(plan.modules) ? [...plan.modules] : [],
      features: initialFeatures,
      is_active: Boolean(plan.is_active),
      sort_order: plan.sort_order || 1
    });
    setNewFeatureText('');
    setDrawerOpen(true);
  };

  const handleToggleModule = (moduleKey) => {
    setFormData(prev => {
      const current = prev.modules || [];
      const exists = current.includes(moduleKey);
      if (exists) {
        return { ...prev, modules: current.filter(m => m !== moduleKey) };
      } else {
        return { ...prev, modules: [...current, moduleKey] };
      }
    });
  };

  const handleSelectAllModules = () => {
    setFormData(prev => ({
      ...prev,
      modules: SYSTEM_MODULES.map(m => m.key)
    }));
  };

  const handleClearAllModules = () => {
    setFormData(prev => ({
      ...prev,
      modules: []
    }));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateFeature = (index, value) => {
    setFormData(prev => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const handleSavePlan = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim()) {
      notifyError('Plan name is required');
      return;
    }
    if (!formData.modules || formData.modules.length === 0) {
      notifyError('Please enable at least one system module for this plan');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        tagline: formData.tagline?.trim() || null,
        badge_text: formData.badge_text?.trim() || null,
        badge_color: formData.badge_color || 'indigo',
        icon: formData.icon || 'Layers',
        monthly_price: parseFloat(formData.monthly_price) || 0,
        annual_price: parseFloat(formData.annual_price) || 0,
        currency: formData.currency || 'INR',
        currency_symbol: formData.currency_symbol || '₹',
        is_popular: Boolean(formData.is_popular),
        base_students_limit: parseInt(formData.base_students_limit, 10) >= 0 ? parseInt(formData.base_students_limit, 10) : 50,
        base_buses_limit: formData.modules?.includes('transport') 
          ? (parseInt(formData.base_buses_limit, 10) >= 0 ? parseInt(formData.base_buses_limit, 10) : 5) 
          : 0,
        description: formData.description?.trim() || null,
        modules: formData.modules,
        features: formData.features.filter(f => typeof f === 'string' && f.trim().length > 0),
        is_active: Boolean(formData.is_active),
        sort_order: parseInt(formData.sort_order, 10) || 1
      };

      const res = await updatePlanAction(editingPlan.uuid || editingPlan.id, payload);
      if (res.success) {
        notifySuccess(res.message || 'Subscription plan updated successfully');
        setDrawerOpen(false);
        fetchPlans();
      } else {
        notifyError(res.message || 'Failed to update plan');
      }
    } catch (err) {
      notifyError('Network error while updating plan');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlanStatus = async (plan) => {
    try {
      const newStatus = !plan.is_active;
      const res = await updatePlanAction(plan.uuid || plan.id, {
        ...plan,
        is_active: newStatus
      });
      if (res.success) {
        notifySuccess(`Plan ${newStatus ? 'activated' : 'deactivated'} successfully`);
        fetchPlans();
      } else {
        notifyError(res.message || 'Failed to update plan status');
      }
    } catch (err) {
      notifyError('Error toggling plan status');
    }
  };

  const totalPlans = plans.length;
  const activePlansCount = plans.filter(p => p.is_active).length;
  const totalSubscriptions = plans.reduce((acc, p) => acc + (parseInt(p.schools_count, 10) || 0), 0);
  const avgMonthlyPrice = totalPlans > 0 
    ? Math.round(plans.reduce((acc, p) => acc + (parseFloat(p.monthly_price) || 0), 0) / totalPlans) 
    : 0;

  const totalRecords = plans.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = plans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPlanTheme = (plan) => {
    if (plan.is_popular || plan.code === 'FULL_SUITE') {
      return {
        cardBorder: 'border-amber-500/40 hover:border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/20',
        bgGradient: 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30',
        badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black',
        iconBox: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        accentColor: 'text-amber-400',
        pillBg: 'bg-primary-500/15 text-primary-300 border-primary-500/30'
      };
    }
    if (plan.code === 'TRANSPORT_ONLY') {
      return {
        cardBorder: 'border-sky-500/30 hover:border-sky-500/60 shadow-lg shadow-sky-500/5',
        bgGradient: 'bg-gradient-to-b from-slate-900 via-slate-900 to-sky-950/30',
        badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
        iconBox: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
        accentColor: 'text-sky-400',
        pillBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
      };
    }
    return {
      cardBorder: 'border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/5',
      bgGradient: 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      iconBox: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      accentColor: 'text-emerald-400',
      pillBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };
  };

  const tableColumns = [
    {
      header: 'Plan Edition & Architecture',
      render: (row) => {
        const isFull = row.code === 'FULL_SUITE' || row.is_popular;
        const isTransport = row.code === 'TRANSPORT_ONLY';

        return (
          <div className="flex items-center space-x-4 py-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform group-hover:scale-105 ${
              isFull
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/10 ring-1 ring-amber-500/20'
                : isTransport
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-sky-500/10 ring-1 ring-sky-500/20'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
            }`}>
              {isFull ? <Star size={22} className="fill-amber-400/20" /> : isTransport ? <Bus size={22} /> : <School size={22} />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-slate-100 text-sm tracking-tight">{row.name}</span>
                {row.code && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 text-slate-300">
                    {row.code}
                  </span>
                )}
                {row.badge_text && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 shadow-xs">
                    {row.badge_text}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                {row.tagline || row.description || 'Enterprise institutional software edition.'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Commercial Pricing',
      render: (row) => (
        <div className="space-y-1.5 py-2">
          <div className="flex items-baseline gap-1 font-black text-slate-100 text-base tracking-tight">
            <span className="text-slate-400 text-xs font-semibold">₹</span>
            <span>{Number(row.monthly_price || 0).toLocaleString()}</span>
            <span className="text-[11px] font-normal text-slate-400">/mo</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold shadow-2xs">
            <span>₹{Number(row.annual_price || 0).toLocaleString()}/yr</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">• Save 20%</span>
          </div>
        </div>
      )
    },
    {
      header: 'Included Base Quota (Free Baseline)',
      render: (row) => {
        const hasTransport = Array.isArray(row.modules) && row.modules.includes('transport');
        const buses = hasTransport ? (row.base_buses_limit !== undefined ? row.base_buses_limit : 5) : 0;
        return (
          <div className="flex flex-wrap items-center gap-2 py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold shadow-xs">
              <Users size={14} className="text-emerald-400 shrink-0" />
              <span>{row.base_students_limit !== undefined ? row.base_students_limit : 50} Included Seats</span>
            </div>
            {hasTransport && buses > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-extrabold shadow-xs">
                <Bus size={14} className="text-sky-400 shrink-0" />
                <span>{buses} Included Buses</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-400 text-xs font-medium">
                <ShieldCheck size={14} className="text-slate-500 shrink-0" />
                <span>ERP Only (No Fleet Quota)</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Software Permissions Stack',
      render: (row) => {
        const modulesList = Array.isArray(row.modules) ? row.modules : [];
        return (
          <div className="space-y-2 py-2 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-black shadow-xs">
                <Boxes size={13} className="text-indigo-400 shrink-0" />
                <span>{modulesList.length} / {SYSTEM_MODULES.length} Modules</span>
              </span>
            </div>
            {/* Micro Icon Capsule Stack */}
            <div className="flex flex-wrap items-center gap-1">
              {modulesList.slice(0, 5).map(modKey => {
                const modInfo = SYSTEM_MODULES.find(m => m.key === modKey);
                const ModIcon = MODULE_ICONS[modInfo?.icon] || Boxes;
                return (
                  <Tooltip key={modKey} content={modInfo?.label || modKey} position="top">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-primary-400 hover:border-primary-500/40 transition-colors shadow-2xs">
                      <ModIcon size={12} />
                    </div>
                  </Tooltip>
                );
              })}
              {modulesList.length > 5 && (
                <Tooltip content={modulesList.slice(5).map(k => SYSTEM_MODULES.find(m => m.key === k)?.label || k).join(', ')} position="top">
                  <div className="px-1.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 cursor-default">
                    +{modulesList.length - 5}
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Enrolled Schools',
      render: (row) => (
        <div className="flex items-center gap-2.5 py-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-inner">
            <School size={16} />
          </div>
          <div>
            <span className="text-base font-black text-slate-100">{row.schools_count || 0}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Institutions</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <button onClick={() => handleTogglePlanStatus(row)}>
          <Badge variant={row.is_active ? 'success' : 'slate'} size="sm" dot>
            {row.is_active ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </button>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDrawer(row, 'pricing')}
            icon={SlidersHorizontal}
            className="text-xs font-bold hover:border-primary-500 hover:text-primary-400 shadow-xs"
          >
            Configure
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with SaaS Control */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-violet-600 border border-primary-500/30 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <Sparkles size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Subscription Plans & Packages
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300">
                SaaS Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Configure commercial price rates, customer feature bullet points, and granular system module permissions all in one place.
            </p>
          </div>
        </div>

        {/* Billing Period Selector */}
        <div className="flex items-center bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/90 shrink-0 relative z-10 shadow-inner">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              billingPeriod === 'monthly'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              billingPeriod === 'annual'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 font-black border border-emerald-500/30">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-primary-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Plans</span>
            <p className="text-2xl font-black text-slate-100 mt-1">{plans.length}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Configured tiers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Layers size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Suites</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activePlansCount}</p>
            <span className="text-[11px] text-emerald-500/80 mt-0.5 block">100% operational</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg. Monthly</span>
            <p className="text-2xl font-black text-slate-100 mt-1">₹{avgMonthlyPrice.toLocaleString()}</p>
            <span className="text-[11px] text-amber-400/80 mt-0.5 block">Catalog average</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <IndianRupee size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-sky-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Enrolled Schools</span>
            <p className="text-2xl font-black text-slate-100 mt-1">{totalSubscriptions}</p>
            <span className="text-[11px] text-sky-400/80 mt-0.5 block">Subscribed institutions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <School size={22} />
          </div>
        </div>
      </div>

      {/* Live Visual Pricing Tier Cards Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Live Pricing & Module Capability Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live visualization of customer-facing cards on the public landing page and school upgrade modals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {plans.map((plan) => {
            const isAnnual = billingPeriod === 'annual';
            const price = isAnnual ? plan.annual_price : plan.monthly_price;
            const features = Array.isArray(plan.features) ? plan.features : [];
            const planModules = Array.isArray(plan.modules) ? plan.modules : [];
            const isPopular = plan.is_popular || plan.code === 'FULL_SUITE';
            const isTransport = plan.code === 'TRANSPORT_ONLY';
            const theme = getPlanTheme(plan);

            // Compute savings if annual
            const monthlyEquivalent = isAnnual && plan.annual_price > 0 ? Math.round(plan.annual_price / 12) : null;
            const standardAnnualCost = plan.monthly_price * 12;
            const savingsAmount = isAnnual && standardAnnualCost > plan.annual_price ? standardAnnualCost - plan.annual_price : 0;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between relative group ${theme.bgGradient} ${theme.cardBorder}`}
              >
                {/* Popular / Ribbon Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-10">
                    <Sparkles size={12} className="fill-slate-950" />
                    {plan.badge_text || 'MOST POPULAR • ALL-IN-ONE'}
                  </div>
                )}

                <div>
                  {/* Tier Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-100 group-hover:text-primary-400 transition-colors">
                          {plan.name}
                        </h4>
                      </div>
                      {plan.code && (
                        <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-slate-300">
                          {plan.code}
                        </span>
                      )}
                    </div>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${theme.iconBox}`}>
                      {isPopular ? <Star size={20} className="fill-current/20" /> : isTransport ? <Bus size={20} /> : <School size={20} />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed min-h-[36px]">
                    {plan.tagline || plan.description || 'Enterprise school management bundle for institutions.'}
                  </p>

                  {/* Price Section */}
                  <div className="mt-5 pb-5 border-b border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-100">₹</span>
                      <span className="text-4xl font-black text-slate-100 tracking-tight">
                        {Number(price || 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    </div>

                    {isAnnual ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {monthlyEquivalent && (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ₹{monthlyEquivalent.toLocaleString()}/mo equivalent
                          </span>
                        )}
                        {savingsAmount > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            Save ₹{savingsAmount.toLocaleString()}/yr
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1.5">Billed monthly, cancel anytime</p>
                    )}

                    {/* Included Base Quotas Pill */}
                    <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-inner w-full justify-between">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Boxes size={13} />
                        Base Quota:
                      </span>
                      <span className="text-slate-200">
                        <strong>{plan.base_students_limit !== undefined ? plan.base_students_limit : 50}</strong> Students
                        {planModules.includes('transport') && (plan.base_buses_limit > 0 || plan.code !== 'SCHOOL_ONLY') ? (
                          <> • <strong>{plan.base_buses_limit !== undefined ? plan.base_buses_limit : 5}</strong> Buses</>
                        ) : (
                          <span className="text-slate-400 text-[10px] ml-1.5 font-normal">(ERP Only • No Buses)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Included Software Modules */}
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Software Access ({planModules.length})
                      </span>
                      <span className="text-[10px] text-primary-400 font-semibold">
                        {planModules.length}/{SYSTEM_MODULES.length} Modules
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {planModules.map(modKey => {
                        const modInfo = SYSTEM_MODULES.find(m => m.key === modKey);
                        const ModIcon = MODULE_ICONS[modInfo?.icon] || Boxes;
                        return (
                          <span 
                            key={modKey} 
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border shadow-xs ${theme.pillBg}`}
                          >
                            <ModIcon size={12} className={theme.accentColor} />
                            {modInfo ? modInfo.label : modKey}
                          </span>
                        );
                      })}
                      {planModules.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No modules assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Feature Bullets Checklist */}
                  <div className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Marketing Inclusions ({features.length})
                    </span>
                    {features.map((feat, idx) => {
                      const text = typeof feat === 'string' ? feat : feat.feature_text;
                      return (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 group/feat">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span className="leading-snug">{text}</span>
                        </div>
                      );
                    })}
                    {features.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No feature points added yet</p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-100 text-sm">{plan.schools_count || 0}</span> Schools Enrolled
                  </div>
                  <Button
                    variant={isPopular ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => openEditDrawer(plan, 'pricing')}
                    icon={SlidersHorizontal}
                  >
                    Configure Plan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Plans Directory Table & Comparison Matrix */}
      <Card
        title="Subscription Plans & Commercial Matrix"
        subtitle="Manage software bundles, commercial rates, access control, and enrolled schools"
        icon={Sparkles}
        action={
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={13} />
              Catalog Table
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes size={13} />
              Module Matrix
            </button>
          </div>
        }
      >
        {viewMode === 'table' ? (
          <DataTable
            columns={tableColumns}
            data={paginatedData}
            loading={loading}
            emptyMessage="No subscription plans found"
            pagination={{
              currentPage,
              pageSize,
              totalRecords,
              totalPages,
              onPageChange: setCurrentPage,
              onPageSizeChange: (newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }
            }}
          />
        ) : (
          /* 🌟 Luxury Side-by-Side Module Capability Matrix */
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 text-slate-400 font-bold uppercase tracking-wider text-xs w-1/4">
                    Capability / Feature
                  </th>
                  {plans.map((p) => {
                    const isFull = p.code === 'FULL_SUITE' || p.is_popular;
                    const isTransport = p.code === 'TRANSPORT_ONLY';
                    return (
                      <th key={p.id} className="p-4 sm:p-5 text-center w-1/4">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                            isFull
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : isTransport
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {isFull ? <Star size={18} className="fill-amber-400/20" /> : isTransport ? <Bus size={18} /> : <School size={18} />}
                          </div>
                          <span className="font-extrabold text-slate-100 text-sm">{p.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                            {p.code}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {/* Monthly Base Price */}
                <tr className="bg-slate-900/20 hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-300">
                    Monthly Base Price
                  </td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 text-center font-black text-slate-100 text-sm">
                      ₹{Number(p.monthly_price || 0).toLocaleString()} <span className="text-[11px] font-normal text-slate-400">/mo</span>
                    </td>
                  ))}
                </tr>

                {/* Annual Base Price */}
                <tr className="bg-slate-900/10 hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-300">
                    Annual Base Price (20% Off)
                  </td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 text-center font-bold text-emerald-400">
                      ₹{Number(p.annual_price || 0).toLocaleString()} <span className="text-[11px] font-normal text-slate-400">/yr</span>
                    </td>
                  ))}
                </tr>

                {/* Included Base Student Seats */}
                <tr className="bg-slate-900/20 hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-300">
                    Free Included Student Seats
                  </td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 text-center font-extrabold text-emerald-300">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        {p.base_students_limit !== undefined ? p.base_students_limit : 50} Seats
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Included Base Buses */}
                <tr className="bg-slate-900/10 hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-300">
                    Free Included Smart Buses
                  </td>
                  {plans.map(p => {
                    const hasTransport = Array.isArray(p.modules) && p.modules.includes('transport');
                    const buses = hasTransport ? (p.base_buses_limit !== undefined ? p.base_buses_limit : 5) : 0;
                    return (
                      <td key={p.id} className="p-4 sm:p-5 text-center font-extrabold">
                        {hasTransport && buses > 0 ? (
                          <span className="px-3 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300">
                            {buses} Buses
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 font-semibold text-[11px]">
                            Not Applicable (0 Buses)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Section Header: Modules */}
                <tr className="bg-slate-950">
                  <td colSpan={plans.length + 1} className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-primary-400 bg-primary-500/5 border-y border-primary-500/20">
                    System Software Module Entitlements
                  </td>
                </tr>

                {SYSTEM_MODULES.map(mod => {
                  const ModIcon = MODULE_ICONS[mod.icon] || Boxes;
                  return (
                    <tr key={mod.key} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-slate-300 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-400 shrink-0">
                          <ModIcon size={14} />
                        </div>
                        <div>
                          <span className="block text-slate-200">{mod.label}</span>
                          <span className="block text-[11px] text-slate-500 font-normal">{mod.description}</span>
                        </div>
                      </td>
                      {plans.map(p => {
                        const hasModule = Array.isArray(p.modules) && p.modules.includes(mod.key);
                        return (
                          <td key={p.id} className="p-4 sm:p-5 text-center">
                            {hasModule ? (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700 text-slate-600">
                                <X size={14} strokeWidth={2} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Action Row */}
                <tr className="bg-slate-900/60">
                  <td className="p-4 sm:p-5 font-bold text-slate-400">
                    Plan Actions
                  </td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4 sm:p-5 text-center">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openEditDrawer(p, 'pricing')}
                        icon={SlidersHorizontal}
                        className="text-xs font-bold shadow-md shadow-primary-600/20"
                      >
                        Configure
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Plan Edit Off-Canvas Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Configure: ${editingPlan?.name || ''}`}
        subtitle="Manage commercial rates, software module permissions, and marketing feature bullets"
        icon={Sparkles}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePlan}
              loading={saving}
              icon={Check}
            >
              Save All Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Plan Identifier Status Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <Info size={16} className="text-primary-400 shrink-0" />
              <div className="text-xs text-slate-300">
                Package Code: <strong className="font-mono text-primary-300">{editingPlan?.code}</strong>
              </div>
            </div>
            <Badge variant={formData.is_active ? 'success' : 'slate'} size="sm">
              {formData.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>

          {/* Drawer Tab Switcher */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveDrawerTab('pricing')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDrawerTab === 'pricing'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard size={14} />
              <span>Pricing & Info</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawerTab('modules')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDrawerTab === 'modules'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes size={14} />
              <span>Module Access ({formData.modules.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawerTab('features')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeDrawerTab === 'features'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Marketing Bullets ({formData.features.length})</span>
            </button>
          </div>

          {/* Tab 1: Pricing & Info */}
          {activeDrawerTab === 'pricing' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <Input
                label="Plan Display Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Full Institutional Suite"
                required
              />
              <Input
                label="Short Tagline / Subtitle"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Complete ERP & Real-Time Smart Bus Tracking"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of this tier..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none shadow-inner"
                />
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} className="text-primary-400" />
                  Commercial Pricing Rates
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Monthly Price (₹)"
                    type="number"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                    min="0"
                  />
                  <Input
                    label="Annual Price (₹)"
                    type="number"
                    value={formData.annual_price}
                    onChange={(e) => setFormData({ ...formData, annual_price: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              {/* Included Base Quota (Free Baseline) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes size={14} className="text-emerald-400" />
                    Included Base Quota (Free Baseline)
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Included in Base Price
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Number of student seats and bus fleet licenses included free in the base price before extra seat add-ons are charged.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <Input
                    label="Included Student Seats"
                    type="number"
                    value={formData.base_students_limit}
                    onChange={(e) => setFormData({ ...formData, base_students_limit: e.target.value })}
                    min="0"
                    placeholder="e.g. 50"
                  />
                  {formData.modules?.includes('transport') ? (
                    <Input
                      label="Included Smart Buses"
                      type="number"
                      value={formData.base_buses_limit}
                      onChange={(e) => setFormData({ ...formData, base_buses_limit: e.target.value })}
                      min="0"
                      placeholder="e.g. 5"
                    />
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Included Smart Buses
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs flex items-center justify-between shadow-inner">
                        <span>0 Buses (No Transport)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-bold border border-slate-700/60">
                          ERP Only
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-amber-400" />
                  Badges & Plan Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ribbon Badge Text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    placeholder="e.g. Most Popular"
                  />
                  <div className="flex flex-col justify-end">
                    <Checkbox
                      label="Highlight as Popular"
                      description="Emphasize card with glowing border and ribbon"
                      checked={formData.is_popular}
                      onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <Input
                    label="Sort Order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    min="0"
                  />
                  <div className="flex flex-col justify-end">
                    <Checkbox
                      label="Plan Active Status"
                      description="Allow schools to subscribe to this plan"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Modules Matrix */}
          {activeDrawerTab === 'modules' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Granular Module Access Matrix</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select which software features are unlocked for schools on this plan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllModules}
                    className="text-[11px] font-bold text-primary-400 hover:text-primary-300 underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={handleClearAllModules}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-300 underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {SYSTEM_MODULES.map((mod) => {
                  const isChecked = formData.modules.includes(mod.key);
                  const IconComp = MODULE_ICONS[mod.icon] || Boxes;
                  return (
                    <div
                      key={mod.key}
                      onClick={() => handleToggleModule(mod.key)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-3 select-none ${
                        isChecked
                          ? 'bg-primary-500/10 border-primary-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggleModule(mod.key)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <IconComp size={15} className={isChecked ? 'text-primary-400' : 'text-slate-500'} />
                          <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-100' : 'text-slate-300'}`}>
                            {mod.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Marketing Feature Bullets */}
          {activeDrawerTab === 'features' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Feature Inclusions Checklist
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bullet points displayed on public pricing cards and upgrade modals.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {formData.features.length} Items
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Type new feature point (e.g. Real-Time GPS Fleet Tracking)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 transition-colors shadow-inner"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddFeature}
                  icon={Plus}
                >
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {formData.features.map((feat, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 group hover:border-slate-700 transition-colors shadow-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900 cursor-pointer"
                      title="Remove feature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-4">
                    No feature bullet points yet. Type in the box above to add.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
