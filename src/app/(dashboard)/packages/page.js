'use client';
import { useState, useEffect } from 'react';
import { 
  Layers, 
  Bus, 
  BookOpen, 
  Edit3, 
  School, 
  CheckCircle2, 
  XCircle,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import Drawer from '@/components/ui/Drawer';
import { getPackagesAction, updatePackageAction } from '@/actions/packageActions';
import { SYSTEM_MODULES } from '@/config/modules';
import { notifySuccess, notifyError } from '@/lib/notify';
import PackageSkeleton from '@/components/skeletons/PackageSkeleton';

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modules: [],
    is_active: true
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await getPackagesAction();
      if (res.success && Array.isArray(res.data?.packages)) {
        setPackages(res.data.packages);
      } else {
        setPackages([]);
      }
    } catch (err) {
      notifyError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return <PackageSkeleton />;
  }

  const totalRecords = packages.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = packages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openEditDrawer = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      modules: Array.isArray(pkg.modules) ? [...pkg.modules] : [],
      is_active: pkg.is_active !== undefined ? pkg.is_active : true
    });
    setDrawerOpen(true);
  };

  const handleToggleModule = (moduleKey) => {
    setFormData(prev => {
      const exists = prev.modules.includes(moduleKey);
      if (exists) {
        return { ...prev, modules: prev.modules.filter(m => m !== moduleKey) };
      } else {
        return { ...prev, modules: [...prev.modules, moduleKey] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      notifyError('Package name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await updatePackageAction(editingPackage.id, formData);
      if (res.success) {
        notifySuccess('Package updated successfully');
        setDrawerOpen(false);
        fetchPackages();
      } else {
        notifyError(res.message || 'Failed to update package');
      }
    } catch (err) {
      notifyError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'SaaS Package / Plan',
      accessor: 'name',
      render: (row) => {
        const isTransport = row.code === 'TRANSPORT_ONLY';
        const isSchool = row.code === 'SCHOOL_ONLY';

        return (
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isTransport 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                : isSchool 
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' 
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
            }`}>
              {isTransport ? <Bus size={20} /> : isSchool ? <BookOpen size={20} /> : <Layers size={20} />}
            </div>
            <div>
              <p className="font-bold text-slate-100 flex items-center gap-2">
                {row.name}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
                  {row.code}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-md">{row.description}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Included Feature Modules',
      accessor: 'modules',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {(row.modules || []).map((modKey) => {
            const modInfo = SYSTEM_MODULES.find(m => m.key === modKey);
            return (
              <span 
                key={modKey} 
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200"
              >
                {modInfo ? modInfo.label : modKey}
              </span>
            );
          })}
        </div>
      )
    },
    {
      header: 'Subscribed Schools',
      accessor: 'schools_count',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <School size={14} className="text-amber-400" />
          <span className="font-bold text-slate-200">{row.schools_count || 0}</span>
          <span className="text-xs text-slate-400">Schools</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Disabled'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-6',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Tooltip content="Edit Package & Modules">
            <button
              onClick={() => openEditDrawer(row)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">SaaS Packages & Modules</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure predefined packages and module feature toggles for schools</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isTransport = pkg.code === 'TRANSPORT_ONLY';
          const isSchool = pkg.code === 'SCHOOL_ONLY';

          return (
            <div 
              key={pkg.id} 
              className={`glass-panel rounded-2xl border p-5 shadow-xl transition-all duration-300 ${
                isTransport 
                  ? 'border-amber-500/30 bg-amber-500/5' 
                  : isSchool 
                  ? 'border-blue-500/30 bg-blue-500/5' 
                  : 'border-indigo-500/30 bg-indigo-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  isTransport ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : isSchool ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                }`}>
                  {isTransport ? <Bus size={20} /> : isSchool ? <BookOpen size={20} /> : <Layers size={20} />}
                </div>
                <button
                  onClick={() => openEditDrawer(pkg)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={12} /> Edit
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-100 mt-3">{pkg.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{pkg.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Schools:</span>
                <span className="font-bold text-slate-200">{pkg.schools_count || 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Packages Table wrapped in Card */}
      <Card 
        title={`All Configured Packages (${totalRecords})`} 
        icon={Layers} 
        subtitle="Manage default modules, descriptions, and feature permissions for schools"
      >
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={loading}
          emptyMessage="No packages configured."
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize
          }}
        />
      </Card>

      {/* Edit Package Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit SaaS Package"
        subtitle={`Configure features for ${editingPackage?.name || 'Package'}`}
        icon={Layers}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end space-x-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="button" 
              loading={saving}
              onClick={handleSubmit}
            >
              Save Package Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Package Display Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Package description..."
            />
          </div>

          {/* Module Checklist */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Enabled Feature Modules
            </label>
            <p className="text-xs text-slate-400">Select which system modules are granted under this package.</p>

            <div className="space-y-2 pt-1">
              {SYSTEM_MODULES.map((mod) => {
                const isEnabled = formData.modules.includes(mod.key);

                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key)}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isEnabled
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{mod.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isEnabled
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'border-slate-600 bg-slate-900'
                    }`}>
                      {isEnabled && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
