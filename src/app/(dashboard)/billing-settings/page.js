'use client';
import { useState, useEffect } from 'react';
import { Settings, CreditCard, Save, Percent, IndianRupee, ShieldAlert, BadgeInfo } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getBillingSettingsAction, updateBillingSettingsAction } from '@/actions/billingActions';

export default function SuperAdminBillingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    base_fee_monthly: '',
    base_fee_yearly: '',
    student_fee_monthly: '',
    student_fee_yearly: '',
    bus_fee_monthly: '',
    bus_fee_yearly: '',
    yearly_discount_percent: '',
    tax_rate_percent: '',
    grace_period_days: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await getBillingSettingsAction();
    if (res.success && res.data) {
      setFormData({
        base_fee_monthly: res.data.base_fee_monthly,
        base_fee_yearly: res.data.base_fee_yearly,
        student_fee_monthly: res.data.student_fee_monthly,
        student_fee_yearly: res.data.student_fee_yearly,
        bus_fee_monthly: res.data.bus_fee_monthly,
        bus_fee_yearly: res.data.bus_fee_yearly,
        yearly_discount_percent: res.data.yearly_discount_percent,
        tax_rate_percent: res.data.tax_rate_percent,
        grace_period_days: res.data.grace_period_days !== undefined ? res.data.grace_period_days : 7
      });
    } else {
      setErrorMsg(res.message || 'Failed to fetch global billing settings.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    // Convert inputs to numbers
    const payload = {};
    Object.keys(formData).forEach(key => {
      payload[key] = parseFloat(formData[key]) || 0;
    });

    const res = await updateBillingSettingsAction(payload);
    if (res.success) {
      setSuccessMsg('Global billing settings saved and updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message || 'Failed to save billing settings.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-2 animate-pulse">
        <CreditCard className="animate-bounce" size={32} />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Billing Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Global SaaS Billing Configurations</h1>
            <p className="text-xs text-slate-400 mt-1">Configure pricing rates, seat taxes, and yearly subscription discounts dynamically.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-fadeIn">
          <BadgeInfo size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
          <ShieldAlert size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Subscriptions Card */}
          <Card className="bg-slate-900/80 border border-slate-800/80 p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Monthly Pricing Rates</h3>
                <p className="text-[10px] text-slate-400">Set rates billed every 30 days</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Base Fee (Monthly)"
                name="base_fee_monthly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.base_fee_monthly}
                onChange={handleChange}
                required
              />

              <Input
                label="Fee Per Student Seat (Monthly)"
                name="student_fee_monthly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.student_fee_monthly}
                onChange={handleChange}
                required
              />

              <Input
                label="Fee Per Bus Seat (Monthly)"
                name="bus_fee_monthly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.bus_fee_monthly}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* Yearly Subscriptions Card */}
          <Card className="bg-slate-900/80 border border-slate-800/80 p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Yearly Pricing Rates</h3>
                <p className="text-[10px] text-slate-400">Set rates billed annually (usually discounted)</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Base Fee (Yearly)"
                name="base_fee_yearly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.base_fee_yearly}
                onChange={handleChange}
                required
              />

              <Input
                label="Fee Per Student Seat (Yearly)"
                name="student_fee_yearly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.student_fee_yearly}
                onChange={handleChange}
                required
              />

              <Input
                label="Fee Per Bus Seat (Yearly)"
                name="bus_fee_yearly"
                type="number"
                step="0.01"
                icon={IndianRupee}
                value={formData.bus_fee_yearly}
                onChange={handleChange}
                required
              />
            </div>
          </Card>
        </div>

        {/* Global Taxes & Discounts */}
        <Card className="bg-slate-900/80 border border-slate-800/80 p-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Percent size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Tax & Discounts</h3>
              <p className="text-[10px] text-slate-400">Configure global tax rates and yearly subscription savings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Yearly Discount (%)"
              name="yearly_discount_percent"
              type="number"
              step="0.1"
              icon={Percent}
              value={formData.yearly_discount_percent}
              onChange={handleChange}
              required
            />

            <Input
              label="Tax Rate (%)"
              name="tax_rate_percent"
              type="number"
              step="0.1"
              icon={Percent}
              value={formData.tax_rate_percent}
              onChange={handleChange}
              required
            />

            <Input
              label="Grace Period (Days)"
              name="grace_period_days"
              type="number"
              step="1"
              icon={ShieldAlert}
              value={formData.grace_period_days}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Actions row */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={saving}
          >
            {saving ? 'Saving Settings...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
