'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, LogIn } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { adminLoginAction } from '@/actions/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.password) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminLoginAction(formData);

      if (res.success) {
        notifySuccess('Super Admin login successful!');
        router.push('/dashboard');
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
        notifyError(res.message || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-xl">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">Super Admin Portal</h1>
            <p className="text-xs text-slate-400">Enter master control credentials to access system</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              icon={Mail}
              placeholder="admin@school.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={LogIn}
            >
              Sign In to Master Console
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-500">School ERP System • Master Control Panel</p>
          </div>
        </div>
      </div>
    </BackendStatusProvider>
  );
}

