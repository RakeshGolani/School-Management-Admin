'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Settings2, IndianRupee, Percent, Save } from 'lucide-react';
import { updateCustomPricingAction } from '@/actions/schoolActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function CustomPricingForm({ schoolId, subscription }) {
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    custom_base_fee_monthly: subscription?.custom_base_fee_monthly || '',
    custom_base_fee_yearly: subscription?.custom_base_fee_yearly || '',
    custom_student_fee_monthly: subscription?.custom_student_fee_monthly || '',
    custom_student_fee_yearly: subscription?.custom_student_fee_yearly || '',
    custom_bus_fee_monthly: subscription?.custom_bus_fee_monthly || '',
    custom_bus_fee_yearly: subscription?.custom_bus_fee_yearly || '',
    custom_discount_percent: subscription?.custom_discount_percent || ''
  });

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

    const payload = {};
    Object.keys(formData).forEach(key => {
      payload[key] = formData[key] === '' ? null : parseFloat(formData[key]);
    });

    const res = await updateCustomPricingAction(schoolId, payload);
    if (res.success) {
      notifySuccess('Custom pricing updated successfully!');
    } else {
      notifyError(res.message || 'Failed to update custom pricing');
    }
    setSaving(false);
  };

  return (
    <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 space-y-5">
      <div className="flex items-center gap-2.5 border-b border-slate-800/60 pb-3">
        <Settings2 size={18} className="text-pink-400" />
        <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Custom Pricing Overrides</h3>
      </div>
      
      <p className="text-xs text-slate-400">
        Leave fields empty to use the global default billing rates. Only fill fields you want to override for this specific school.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Custom Base Fee (Monthly)"
            name="custom_base_fee_monthly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_base_fee_monthly}
            onChange={handleChange}
            placeholder="e.g. 800"
          />
          <Input
            label="Custom Base Fee (Yearly)"
            name="custom_base_fee_yearly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_base_fee_yearly}
            onChange={handleChange}
            placeholder="e.g. 8000"
          />
          <Input
            label="Custom Student Fee (Monthly)"
            name="custom_student_fee_monthly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_student_fee_monthly}
            onChange={handleChange}
            placeholder="e.g. 8"
          />
          <Input
            label="Custom Student Fee (Yearly)"
            name="custom_student_fee_yearly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_student_fee_yearly}
            onChange={handleChange}
            placeholder="e.g. 80"
          />
          <Input
            label="Custom Bus Fee (Monthly)"
            name="custom_bus_fee_monthly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_bus_fee_monthly}
            onChange={handleChange}
            placeholder="e.g. 80"
          />
          <Input
            label="Custom Bus Fee (Yearly)"
            name="custom_bus_fee_yearly"
            type="number"
            step="0.01"
            icon={IndianRupee}
            value={formData.custom_bus_fee_yearly}
            onChange={handleChange}
            placeholder="e.g. 800"
          />
          <div className="md:col-span-2">
            <Input
              label="Custom Discount (%)"
              name="custom_discount_percent"
              type="number"
              step="0.1"
              icon={Percent}
              value={formData.custom_discount_percent}
              onChange={handleChange}
              placeholder="e.g. 20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Custom Pricing'}
          </Button>
        </div>
      </form>
    </Card>
  );
}