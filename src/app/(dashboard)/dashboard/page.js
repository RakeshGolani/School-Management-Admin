'use client';
import { useState, useEffect } from 'react';
import { School, Users, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getSchoolsAction } from '@/actions/schoolActions';

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

  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Super Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Manage registered school institutions, credentials, and system settings.</p>
        </div>
        <Link href="/schools">
          <Button variant="primary" icon={ArrowRight}>
            Manage Schools
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Total Registered Schools</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">{loading ? '...' : totalSchools}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <School size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Active Portals</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">{loading ? '...' : activeSchools}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">System Health</p>
              <h3 className="text-3xl font-black text-blue-400 mt-2">100% Online</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity size={24} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
