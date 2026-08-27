'use client';
import { useState, useEffect } from 'react';
import { School, Users, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getSchoolsAction } from '@/actions/schoolActions';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';

export default function AdminDashboardPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchoolsAction().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setSchools(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <School className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">Vidyadmin SuperAdmin Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage registered school institutions, credentials, subscriptions, and system settings.</p>
          </div>
        </div>
        <Link href="/schools" className="relative z-10 shrink-0">
          <Button variant="primary" icon={ArrowRight}>
            Manage Schools
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="bg-slate-900/80 hover:border-primary-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Total Registered Schools</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">{loading ? '...' : totalSchools}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-inner">
              <School size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/80 hover:border-accent-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Active Portals</p>
              <h3 className="text-3xl font-black text-accent-400 mt-2">{loading ? '...' : activeSchools}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-400 shadow-inner">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/80 hover:border-secondary-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">System Health</p>
              <h3 className="text-3xl font-black text-secondary-400 mt-2">100% Online</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 border border-secondary-500/30 flex items-center justify-center text-secondary-400 shadow-inner">
              <Activity size={24} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
