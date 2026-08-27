'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Lock, X, KeyRound } from 'lucide-react';
import * as yup from 'yup';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { updateAdminProfileAction } from '@/actions/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  password: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

export default function ChangePasswordModal({ isOpen, onClose, adminId }) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({ currentPassword: '', password: '', confirmPassword: '' });
      setErrors({});
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateField = async (name, value, currentFormData = formData) => {
    try {
      const fieldData = { ...currentFormData, [name]: value };
      await yup.reach(passwordSchema, name).validate(value, { context: fieldData });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await passwordSchema.validate(formData, { abortEarly: false });
    } catch (valErrors) {
      const formattedErrors = {};
      valErrors.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setSaving(true);

    try {
      const result = await updateAdminProfileAction(adminId, {
        currentPassword: formData.currentPassword,
        password: formData.password
      });

      if (result.success) {
        notifySuccess('Password updated successfully!');
        onClose();
      } else {
        notifyError(result.message || 'Failed to update password.');
      }
    } catch (err) {
      notifyError('An unexpected server error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, saving]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !saving) {
      onClose();
    }
  };

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ease-out ${
        animate ? 'bg-slate-950/80 backdrop-blur-sm opacity-100' : 'bg-slate-950/0 backdrop-blur-none opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[28px] p-6 shadow-2xl space-y-5 transition-all duration-200 ease-out origin-center ${
          animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        {/* Close Button */}
        {!saving && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl border bg-primary-500/10 border-primary-500/20 text-primary-400 shrink-0">
            <KeyRound size={22} />
          </div>
          <div className="space-y-1 pt-0.5">
            <h3 className="text-base font-bold text-slate-100">Update Password</h3>
            <p className="text-xs text-slate-400">Secure your session with a new password.</p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Input
            label="Current Password"
            name="currentPassword"
            icon={Lock}
            type="password"
            placeholder="Enter current password"
            value={formData.currentPassword}
            onChange={handleInputChange}
            error={errors.currentPassword}
            required
          />

          <Input
            label="New Password"
            name="password"
            icon={Lock}
            type="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            icon={Lock}
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            showPasswordToggle={false}
            required
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            {!saving && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <Button variant="primary" type="submit" loading={saving}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
