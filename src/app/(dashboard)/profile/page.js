'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Activity, Save } from 'lucide-react';
import * as yup from 'yup';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormPhoneInput from '@/components/FormPhoneInput';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { 
  getAdminSessionAction, 
  updateAdminProfileAction, 
  updateAdminSessionAction 
} from '@/actions/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

// Yup validation schema for basic profile details
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Full Name is required')
    .min(3, 'Full Name must be at least 3 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email Address is required'),
  phone: yup
    .string()
    .optional()
});

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Validation Errors State
  const [errors, setErrors] = useState({});

  // Load Session User
  const fetchSession = () => {
    setLoadingSession(true);
    getAdminSessionAction().then((res) => {
      if (res.authenticated && res.user) {
        setAdminUser(res.user);
        setFormData({
          name: res.user.name || '',
          email: res.user.email || '',
          phone: res.user.phone || ''
        });
      }
      setLoadingSession(false);
    });
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Validate single field live as the user types (Dynamic Validation)
  const validateField = async (name, value, currentFormData = formData) => {
    try {
      const fieldData = { ...currentFormData, [name]: value };
      await yup.reach(profileSchema, name).validate(value, { context: fieldData });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      validateField(name, value, nextData);
      return nextData;
    });
  };

  const handlePhoneChange = (phoneVal) => {
    setFormData((prev) => {
      const nextData = { ...prev, phone: phoneVal };
      validateField('phone', phoneVal, nextData);
      return nextData;
    });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate complete form schema
      await profileSchema.validate(formData, { abortEarly: false });
    } catch (validationErrors) {
      const formattedErrors = {};
      validationErrors.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
      setErrors(formattedErrors);
      notifyError('Please fix validation errors before saving.');
      return;
    }

    setSaving(true);

    try {
      // Call update API in database
      const updateRes = await updateAdminProfileAction(adminUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      if (updateRes.success) {
        // Sync local cookie session User details
        const sessionSync = await updateAdminSessionAction({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });

        if (sessionSync.success) {
          notifySuccess('Profile updated successfully!');
          // Trigger a short delay before reloading to allow users to see the success toast
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          notifyError('Profile saved, but session sync failed.');
        }
      } else {
        notifyError(updateRes.message || 'Failed to update profile.');
      }
    } catch (err) {
      notifyError('An unexpected server error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingSession) {
    return <ProfileSkeleton />;
  }

  // Get Initials for Avatar
  const getInitials = (nameStr) => {
    if (!nameStr) return 'SA';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100">Super Admin Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your account details, phone configuration, and secure password credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary Card & Password Trigger */}
        <div className="lg:col-span-1 space-y-5">
          {/* Main summary card */}
          <Card className="bg-slate-900/80">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              {/* Round Avatar initials */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 border-2 border-amber-500/20 shadow-lg shadow-amber-500/10 flex items-center justify-center text-slate-950 text-3xl font-black select-none leading-none">
                {getInitials(adminUser?.name)}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-100">{adminUser?.name}</h3>
                <p className="text-xs text-slate-400">{adminUser?.email}</p>
              </div>

              {/* Badges/Tags */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Shield size={10} />
                  <span>Super Admin</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Activity size={10} />
                  <span>Session Active</span>
                </span>
              </div>

              {/* Quick Details Block */}
              <div className="w-full border-t border-slate-800/60 pt-6 mt-2 text-left space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Authorization level:</span>
                  <span className="text-slate-200 font-bold">Master Control</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Account ID:</span>
                  <span className="text-slate-200 font-mono font-bold">#{adminUser?.id}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Credentials Trigger Card */}
          <Card 
            onClick={() => setChangePasswordOpen(true)}
            className="bg-slate-900/80 hover:border-amber-500/40 transition cursor-pointer select-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Lock size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-100">Security Credentials</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Update account password</p>
                </div>
              </div>
              <div className="text-slate-500 hover:text-slate-300 shrink-0 ml-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Editor Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-slate-900/80">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-slate-800/60 pb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Account Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  icon={User}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  icon={Mail}
                  type="email"
                  placeholder="admin@school.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />
              </div>

              <div>
                <FormPhoneInput
                  label="Contact Phone Number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={fetchSession}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  loading={saving}
                  icon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Change Password Overlay Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        adminId={adminUser?.id}
      />
    </div>
  );
}
