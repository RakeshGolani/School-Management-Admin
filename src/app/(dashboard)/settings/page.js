'use client';
import { useState, useEffect } from 'react';
import { Settings, Building, Save, Image as ImageIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getSystemSettingsAction, updateSystemSettingsAction } from '@/actions/systemSettingsActions';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    tagline: '',
    support_email: '',
    support_phone: '',
    address: '',
    gstin: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await getSystemSettingsAction();
    if (res.success && res.data) {
      setFormData({
        company_name: res.data.company_name || '',
        tagline: res.data.tagline || '',
        support_email: res.data.support_email || '',
        support_phone: res.data.support_phone || '',
        address: res.data.address || '',
        gstin: res.data.gstin || ''
      });
      if (res.data.logo_url) {
        setCurrentLogo(process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/admin', '') + res.data.logo_url : `http://127.0.0.1:5000${res.data.logo_url}`);
      }
    } else {
      Notify.failure(res.message || 'Failed to fetch system settings.');
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

  const handleFileChange = (e) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size exceeds 10 MB limit.');
        setLogoFile(null);
        e.target.value = ''; // Reset input
        return;
      }
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Basic Validation
    if (!formData.company_name.trim()) {
      Notify.failure('Company Name is required.');
      setSaving(false);
      return;
    }
    if (!formData.support_email.trim() || !/^\S+@\S+\.\S+$/.test(formData.support_email)) {
      Notify.failure('A valid Support Email is required.');
      setSaving(false);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    if (logoFile) {
      submitData.append('logo', logoFile);
    }

    const res = await updateSystemSettingsAction(submitData);
    if (res.success) {
      Notify.success('System settings saved successfully!');
    } else {
      Notify.failure(res.message || 'Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-2 animate-pulse">
        <Settings className="animate-spin-slow" size={32} />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">System Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your SaaS provider details, branding, and billing profile.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-900/80 border border-slate-800/80 p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Company Profile</h3>
              <p className="text-[10px] text-slate-400">These details will be displayed on all dynamically generated invoices for your clients.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="md:col-span-2 flex items-start space-x-6 border border-slate-200/50 rounded-2xl p-5 bg-slate-800/20">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : currentLogo ? (
                  <img src={currentLogo} alt="Current Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={28} className="text-slate-600" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="logo-upload" className="text-xs font-bold text-slate-300 uppercase tracking-wider block cursor-pointer">Company Logo</label>
                <input 
                  id="logo-upload"
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange}
                  className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer file:cursor-pointer hover:text-slate-300 transition-colors" 
                />
                <p className="text-[10px] text-slate-500 font-semibold">Recommended: 200x200px PNG or JPG (Max 10MB).</p>
                {fileError && <p className="text-xs text-rose-500 font-semibold mt-1">{fileError}</p>}
              </div>
            </div>

            <Input
              label="Company Name"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. EduSchool SaaS Cloud"
              required
            />
            
            <Input
              label="Tagline"
              name="tagline"
              type="text"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Enterprise School Management Suite"
            />

            <Input
              label="Support Email"
              name="support_email"
              type="email"
              value={formData.support_email}
              onChange={handleChange}
              placeholder="e.g. support@yourcompany.com"
              required
            />

            <Input
              label="Support Phone"
              name="support_phone"
              type="text"
              value={formData.support_phone}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
            />

            <div className="md:col-span-2">
              <Input
                label="GSTIN / Tax ID"
                name="gstin"
                type="text"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="e.g. 27AAAAA0000A1Z5"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Office Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-semibold bg-slate-900/50 text-slate-100 transition resize-none placeholder:text-slate-600"
                placeholder="Enter complete office address..."
                required
              />
            </div>
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
