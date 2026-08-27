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
  Boxes
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
import { notifySuccess, notifyError } from '@/lib/notify';
import PlanSkeleton from '@/components/skeletons/PlanSkeleton';

export default function PlansManagementPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'annual'
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
    description: '',
    features: [],
    is_active: true,
    sort_order: 1
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlansAction();
      if (res.success && Array.isArray(res.data?.plans || res.data?.packages)) {
        setPlans(res.data.plans || res.data.packages);
      } else {
        setPlans([]);
      }
    } catch (err) {
      notifyError('Failed to load subscription plans');
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

  const totalRecords = plans.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = plans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activePlansCount = plans.filter(p => p.is_active).length;
  const popularPlan = plans.find(p => p.is_popular);
  const avgMonthlyPrice = plans.length > 0 
    ? Math.round(plans.reduce((acc, p) => acc + (parseFloat(p.monthly_price) || 0), 0) / plans.length)
    : 0;
  const totalSubscriptions = plans.reduce((acc, p) => acc + (p.schools_count || 0), 0);

  const openEditDrawer = (plan) => {
    setEditingPlan(plan);
    const initialFeatures = Array.isArray(plan.features)
      ? plan.features.map(f => typeof f === 'string' ? f : f.feature_text)
      : [];

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
      description: plan.description || '',
      features: initialFeatures,
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      sort_order: plan.sort_order || 1
    });
    setNewFeatureText('');
    setDrawerOpen(true);
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
    e.preventDefault();
    if (!formData.name.trim()) {
      notifyError('Plan name is required');
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
        description: formData.description?.trim() || null,
        features: formData.features.filter(f => typeof f === 'string' && f.trim().length > 0),
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order, 10) || 0
      };

      const res = await updatePlanAction(editingPlan.uuid || editingPlan.id, payload);
      if (res.success) {
        notifySuccess('Subscription plan and feature checklist updated successfully');
        setDrawerOpen(false);
        fetchPlans();
      } else {
        notifyError(res.message || 'Failed to update plan');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const tableColumns = [
    {
      header: 'Plan Tier',
      render: (row) => (
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            row.is_popular 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-primary-500/10 border-primary-500/30 text-primary-400'
          }`}>
            {row.is_popular ? <Star size={20} className="fill-amber-400/20" /> : <Gem size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">{row.name}</span>
              {row.badge_text && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-500/20 border border-primary-500/40 text-primary-300">
                  {row.badge_text}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
              {row.tagline || row.description || 'Commercial tier'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Monthly Price',
      render: (row) => (
        <div className="flex items-center gap-1 font-bold text-slate-100 text-sm">
          <span>{row.currency_symbol || '₹'}</span>
          <span>{Number(row.monthly_price || 0).toLocaleString()}</span>
          <span className="text-xs font-normal text-slate-400">/mo</span>
        </div>
      )
    },
    {
      header: 'Annual Price',
      render: (row) => (
        <div className="flex items-center gap-1 font-bold text-emerald-400 text-sm">
          <span>{row.currency_symbol || '₹'}</span>
          <span>{Number(row.annual_price || 0).toLocaleString()}</span>
          <span className="text-xs font-normal text-slate-400">/yr</span>
        </div>
      )
    },
    {
      header: 'Bullet Features',
      render: (row) => {
        const count = Array.isArray(row.features) ? row.features.length : 0;
        return (
          <Badge variant="slate" size="sm">
            {count} Feature Points
          </Badge>
        );
      }
    },
    {
      header: 'Subscribed Schools',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
          <School size={14} className="text-slate-400" />
          <span>{row.schools_count || 0}</span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'slate'} size="sm">
          {row.is_active ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="Edit Plan & Pricing Features" position="left">
            <button
              onClick={() => openEditDrawer(row)}
              className="p-2 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-slate-800 transition-colors duration-150"
            >
              <Edit3 size={16} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-inner">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Subscription Plans & Pricing Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Configure commercial pricing tiers, monthly and annual rates, marketing feature checklists, and preview live customer pricing cards.
            </p>
          </div>
        </div>

        {/* Live Billing Period Switcher Simulator */}
        <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 relative z-10 shadow-inner">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              billingPeriod === 'monthly'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
              billingPeriod === 'annual'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Plans</span>
            <Tag size={16} className="text-primary-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{activePlansCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Featured Plan</span>
            <Star size={16} className="text-amber-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2 truncate">
            {popularPlan?.name || 'Full Suite'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg. Monthly Rate</span>
            <IndianRupee size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">₹{avgMonthlyPrice.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Subscriptions</span>
            <School size={16} className="text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{totalSubscriptions}</p>
        </div>
      </div>

      {/* Live Interactive Pricing Card Preview Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Live Pricing Simulator Preview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live visualization of customer-facing cards on landing page and checkout modals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isAnnual = billingPeriod === 'annual';
            const price = isAnnual ? plan.annual_price : plan.monthly_price;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between relative group ${
                  plan.is_popular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-primary-950/30 border-primary-500/50 shadow-xl shadow-primary-500/10 ring-2 ring-primary-500/20'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {plan.badge_text || 'Most Popular'}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-black text-slate-100 group-hover:text-primary-400 transition-colors">
                        {plan.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {plan.tagline || plan.description || 'Institution subscription tier'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mt-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-100">{plan.currency_symbol || '₹'}</span>
                      <span className="text-4xl font-black text-slate-100 tracking-tight">
                        {Number(price || 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    </div>
                    {isAnnual && plan.monthly_price > 0 && (
                      <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                        Equivalent to ₹{Math.round((plan.annual_price || 0) / 12).toLocaleString()}/month
                      </p>
                    )}
                  </div>

                  {/* Bullet Checklist */}
                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Plan Inclusions ({features.length})
                    </span>
                    {features.map((feat, idx) => {
                      const text = typeof feat === 'string' ? feat : feat.feature_text;
                      return (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
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

                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  <Button
                    variant={plan.is_popular ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => openEditDrawer(plan)}
                    icon={Edit3}
                  >
                    Edit Plan & Pricing
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Plans Data Table */}
      <Card
        title="Commercial Pricing Plans Directory"
        subtitle="Manage rates, badges, feature bullets, and marketing configuration"
        icon={Sparkles}
      >
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
      </Card>

      {/* Edit Plan Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Edit Plan: ${editingPlan?.name || ''}`}
        subtitle="Update commercial rates, marketing badges, and feature bullet checklists"
        icon={Sparkles}
        maxWidth="max-w-xl"
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
              Save Plan Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <Input
              label="Plan Title"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Full Institutional Suite"
              required
            />

            <Input
              label="Tagline / Marketing Subtitle"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Complete ERP & Real-Time Smart Bus Fleet Tracking"
            />

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary-400" />
                Commercial Pricing Tier
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Currency Code"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="INR"
                />
                <Input
                  label="Currency Symbol"
                  value={formData.currency_symbol}
                  onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                  placeholder="₹"
                />
              </div>
            </div>

            {/* Badges & Popular Status */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-amber-400" />
                Badging & Popularity
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Badge Text"
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="e.g. Most Popular"
                />
                <div className="flex flex-col justify-end">
                  <Checkbox
                    label="Highlight as Popular"
                    description="Emphasize card with glow and top ribbon"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                min="0"
              />
              <div className="flex flex-col justify-end">
                <Checkbox
                  label="Active Status"
                  description="Display on public landing and billing options"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Marketing Feature Checklist Manager */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
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

            {/* Add New Feature Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                placeholder="Type new feature bullet point (e.g. Live GPS Fleet Tracking)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-primary-500 transition-colors"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddFeature}
                icon={Plus}
              >
                Add
              </Button>
            </div>

            {/* List of Features */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {formData.features.map((feat, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 group hover:border-slate-700"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={12} />
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
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove feature"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-3">
                  No feature points yet. Add your first feature point above.
                </p>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
