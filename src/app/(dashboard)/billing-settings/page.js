'use client';
import { useState, useEffect } from 'react';
import { 
  Settings, 
  CreditCard, 
  Save, 
  Percent, 
  IndianRupee, 
  ShieldAlert, 
  BadgeInfo,
  Sparkles,
  Users,
  Bus,
  Clock,
  Calculator,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  Tag
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { getBillingSettingsAction, updateBillingSettingsAction } from '@/actions/billingActions';
import { getPlansAction } from '@/actions/planActions';
import BillingSettingsSkeleton from '@/components/skeletons/BillingSettingsSkeleton';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function SuperAdminBillingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);

  const [formData, setFormData] = useState({
    base_fee_monthly: 9999,
    base_fee_yearly: 7999,
    student_fee_monthly: 10,
    student_fee_yearly: 100,
    bus_fee_monthly: 100,
    bus_fee_yearly: 1000,
    yearly_discount_percent: 15,
    tax_rate_percent: 18,
    grace_period_days: 7
  });

  // Simulator State
  const [simPlan, setSimPlan] = useState('FULL_SUITE');
  const [simPeriod, setSimPeriod] = useState('monthly');
  const [simStudents, setSimStudents] = useState(250);
  const [simBuses, setSimBuses] = useState(10);

  const fetchSettingsAndPlans = async () => {
    setLoading(true);
    try {
      const [billingRes, plansRes] = await Promise.all([
        getBillingSettingsAction(),
        getPlansAction()
      ]);

      if (billingRes.success && billingRes.data) {
        setFormData({
          base_fee_monthly: billingRes.data.base_fee_monthly ?? 9999,
          base_fee_yearly: billingRes.data.base_fee_yearly ?? 7999,
          student_fee_monthly: billingRes.data.student_fee_monthly ?? 10,
          student_fee_yearly: billingRes.data.student_fee_yearly ?? 100,
          bus_fee_monthly: billingRes.data.bus_fee_monthly ?? 100,
          bus_fee_yearly: billingRes.data.bus_fee_yearly ?? 1000,
          yearly_discount_percent: billingRes.data.yearly_discount_percent ?? 15,
          tax_rate_percent: billingRes.data.tax_rate_percent ?? 18,
          grace_period_days: billingRes.data.grace_period_days ?? 7
        });
      }

      if (plansRes.success && Array.isArray(plansRes.data?.plans || plansRes.data?.packages)) {
        setPlans(plansRes.data.plans || plansRes.data.packages);
      }
    } catch (err) {
      notifyError('Failed to load global billing configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        base_fee_monthly: parseFloat(formData.base_fee_monthly) || 0,
        base_fee_yearly: parseFloat(formData.base_fee_yearly) || 0,
        student_fee_monthly: parseFloat(formData.student_fee_monthly) || 0,
        student_fee_yearly: parseFloat(formData.student_fee_yearly) || 0,
        bus_fee_monthly: parseFloat(formData.bus_fee_monthly) || 0,
        bus_fee_yearly: parseFloat(formData.bus_fee_yearly) || 0,
        yearly_discount_percent: parseFloat(formData.yearly_discount_percent) || 0,
        tax_rate_percent: parseFloat(formData.tax_rate_percent) || 0,
        grace_period_days: parseInt(formData.grace_period_days, 10) || 0
      };

      const res = await updateBillingSettingsAction(payload);
      if (res.success) {
        notifySuccess('Global SaaS billing configurations saved successfully');
      } else {
        notifyError(res.message || 'Failed to save billing configurations');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <BillingSettingsSkeleton />;
  }

  // Simulator Calculations
  const selectedPlanObj = plans.find(p => p.code === simPlan) || {
    name: 'Full Institutional Suite',
    monthly_price: formData.base_fee_monthly,
    annual_price: formData.base_fee_yearly
  };

  const isSimYearly = simPeriod === 'yearly';
  const basePlanPrice = isSimYearly 
    ? Number(selectedPlanObj.annual_price || formData.base_fee_yearly)
    : Number(selectedPlanObj.monthly_price || formData.base_fee_monthly);

  const studentSeatRate = isSimYearly ? Number(formData.student_fee_yearly) : Number(formData.student_fee_monthly);
  const busSeatRate = isSimYearly ? Number(formData.bus_fee_yearly) : Number(formData.bus_fee_monthly);

  const simBaseStudents = selectedPlanObj.base_students_limit !== undefined ? Number(selectedPlanObj.base_students_limit) : 50;
  const simBaseBuses = selectedPlanObj.base_buses_limit !== undefined ? Number(selectedPlanObj.base_buses_limit) : 5;

  const extraStudents = Math.max(0, simStudents - simBaseStudents);
  const extraBuses = Math.max(0, simBuses - simBaseBuses);

  const studentAddonTotal = extraStudents * studentSeatRate;
  const busAddonTotal = extraBuses * busSeatRate;
  const subtotalBeforeTax = basePlanPrice + studentAddonTotal + busAddonTotal;

  const taxRate = Number(formData.tax_rate_percent || 18);
  const taxAmount = (subtotalBeforeTax * taxRate) / 100;
  const finalCalculatedInvoice = subtotalBeforeTax + taxAmount;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-violet-600 border border-primary-500/30 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <CreditCard size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Global SaaS Billing Configurations
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/40 text-primary-300">
                Financial Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configure dynamic per-seat scaling add-on fees, GST tax rates, annual discounts, and grace period rules for school subscriptions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            type="button"
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            loading={saving}
          >
            Save All Configurations
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-primary-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Student Seat Rate</span>
            <p className="text-xl font-black text-slate-100 mt-1">₹{formData.student_fee_monthly}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
            <span className="text-[11px] text-emerald-400 font-semibold mt-0.5 block">₹{formData.student_fee_yearly}/yr per seat</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-sky-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Bus Fleet Seat Rate</span>
            <p className="text-xl font-black text-sky-400 mt-1">₹{formData.bus_fee_monthly}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
            <span className="text-[11px] text-sky-400/80 font-semibold mt-0.5 block">₹{formData.bus_fee_yearly}/yr per bus</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <Bus size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Standard GST Rate</span>
            <p className="text-xl font-black text-amber-400 mt-1">{formData.tax_rate_percent}%</p>
            <span className="text-[11px] text-amber-400/80 mt-0.5 block">India GST Applied</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Percent size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-xl flex items-center justify-between group hover:border-purple-500/30 transition-all duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Grace Window</span>
            <p className="text-xl font-black text-purple-400 mt-1">{formData.grace_period_days} Days</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Overdue threshold</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Form Settings (Left 7 Cols) + Live Simulation Calculator (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Configuration Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Per-Seat Scaling Quotas */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Resource Seat Scaling Add-ons</h3>
                  <p className="text-xs text-slate-400">Extra fees charged per seat/bus beyond base plan quotas (50 students & 5 buses included)</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Dynamic Add-ons</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fee Per Student Seat (Monthly ₹)"
                name="student_fee_monthly"
                type="number"
                step="1"
                min="0"
                value={formData.student_fee_monthly}
                onChange={handleChange}
                required
              />
              <Input
                label="Fee Per Student Seat (Yearly ₹)"
                name="student_fee_yearly"
                type="number"
                step="1"
                min="0"
                value={formData.student_fee_yearly}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
              <Input
                label="Fee Per Bus Seat (Monthly ₹)"
                name="bus_fee_monthly"
                type="number"
                step="1"
                min="0"
                value={formData.bus_fee_monthly}
                onChange={handleChange}
                required
              />
              <Input
                label="Fee Per Bus Seat (Yearly ₹)"
                name="bus_fee_yearly"
                type="number"
                step="1"
                min="0"
                value={formData.bus_fee_yearly}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Card 2: Catalog Base Rates */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Catalog Base Rates (Fallback)</h3>
                  <p className="text-xs text-slate-400">Fallback rates when individual package prices are unspecified</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Base Fee (Monthly ₹)"
                name="base_fee_monthly"
                type="number"
                step="1"
                min="0"
                value={formData.base_fee_monthly}
                onChange={handleChange}
                required
              />
              <Input
                label="Base Fee (Yearly ₹)"
                name="base_fee_yearly"
                type="number"
                step="1"
                min="0"
                value={formData.base_fee_yearly}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Card 3: Tax, Discount & Grace Period */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Percent size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Taxation, Discounts & Grace Period</h3>
                  <p className="text-xs text-slate-400">Global invoice taxation (GST) and subscription renewal policies</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="GST Tax Rate (%)"
                name="tax_rate_percent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.tax_rate_percent}
                onChange={handleChange}
                required
              />
              <Input
                label="Annual Discount (%)"
                name="yearly_discount_percent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.yearly_discount_percent}
                onChange={handleChange}
                required
              />
              <Input
                label="Grace Period (Days)"
                name="grace_period_days"
                type="number"
                step="1"
                min="0"
                value={formData.grace_period_days}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Real-Time Billing Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-primary-950/40 border border-primary-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-300 shadow-xs">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100">Live Billing Simulator</h3>
                  <p className="text-[11px] text-slate-400">Preview how Plans + Seat Quotas combine into final school invoices</p>
                </div>
              </div>
              <Badge variant="primary" size="sm">Real-Time</Badge>
            </div>

            {/* Simulation Controls */}
            <div className="space-y-4 relative z-10">
              {/* Plan Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Base Plan Edition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'FULL_SUITE', label: 'Full Suite' },
                    { code: 'TRANSPORT_ONLY', label: 'Smart Fleet' },
                    { code: 'SCHOOL_ONLY', label: 'School ERP' }
                  ].map(p => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setSimPlan(p.code)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        simPlan === p.code
                          ? 'bg-primary-600 text-white border-primary-500 shadow-md shadow-primary-600/30'
                          : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Billing Frequency
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSimPeriod('monthly')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simPeriod === 'monthly'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPeriod('yearly')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      simPeriod === 'yearly'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Annual (Yearly)
                  </button>
                </div>
              </div>

              {/* Resource Sliders / Numbers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Total Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={simStudents}
                    onChange={(e) => setSimStudents(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold focus:outline-none focus:border-primary-500 transition-colors shadow-inner"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">50 base included</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Total Bus Fleet
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={simBuses}
                    onChange={(e) => setSimBuses(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold focus:outline-none focus:border-primary-500 transition-colors shadow-inner"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">5 base included</span>
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Receipt */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3 relative z-10 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Base Plan ({selectedPlanObj.name})</span>
                <span className="font-bold text-slate-200">₹{basePlanPrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Student Add-on ({extraStudents} extra × ₹{studentSeatRate})
                </span>
                <span className="font-bold text-slate-200">₹{studentAddonTotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Bus Fleet Add-on ({extraBuses} extra × ₹{busSeatRate})
                </span>
                <span className="font-bold text-slate-200">₹{busAddonTotal.toLocaleString()}</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs text-slate-300">
                <span>Subtotal (Pre-Tax)</span>
                <span className="font-bold text-slate-100">₹{subtotalBeforeTax.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>GST Tax ({taxRate}%)</span>
                <span className="font-bold">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-slate-700/80 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Total School Invoice</span>
                  <span className="text-[10px] text-slate-500">{isSimYearly ? 'Billed Annually' : 'Billed Monthly'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400 tracking-tight">
                    ₹{finalCalculatedInvoice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory Footer */}
            <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-start gap-2.5 relative z-10">
              <Zap size={16} className="text-primary-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                When schools configure extra student accounts or add fleet buses from their portal, the system automatically uses these exact rates to generate compliant GST invoices.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
