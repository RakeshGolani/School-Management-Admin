'use client';
import { useState, useEffect } from 'react';
import { 
  Boxes, 
  Bus, 
  BookOpen, 
  Edit3, 
  School, 
  CheckCircle2, 
  XCircle,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  Check,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Landmark,
  CalendarDays,
  Layers,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import Drawer from '@/components/ui/Drawer';
import Checkbox from '@/components/ui/Checkbox';
import { getPackagesAction, updatePackageAction } from '@/actions/packageActions';
import { SYSTEM_MODULES } from '@/config/modules';
import { notifySuccess, notifyError } from '@/lib/notify';
import PackageSkeleton from '@/components/skeletons/PackageSkeleton';

// Map icon string name to Lucide Component
const ICON_COMPONENTS = {
  Users,
  Bus,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Landmark,
  CalendarDays,
  Layers,
  Boxes,
  School,
  Sparkles
};

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
    tagline: '',
    description: '',
    icon: 'Boxes',
    modules: [],
    is_active: true,
    sort_order: 1
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

  const totalSchools = packages.reduce((acc, p) => acc + (p.schools_count || 0), 0);
  const activePackagesCount = packages.filter(p => p.is_active).length;
  const fullSuitePkg = packages.find(p => p.code === 'FULL_SUITE');

  const openEditDrawer = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      tagline: pkg.tagline || '',
      description: pkg.description || '',
      icon: pkg.icon || 'Boxes',
      modules: Array.isArray(pkg.modules) ? [...pkg.modules] : [],
      is_active: pkg.is_active !== undefined ? pkg.is_active : true,
      sort_order: pkg.sort_order || 1
    });
    setDrawerOpen(true);
  };

  const handleToggleModule = (moduleKey) => {
    setFormData(prev => {
      const current = prev.modules || [];
      const exists = current.includes(moduleKey);
      if (exists) {
        return { ...prev, modules: current.filter(m => m !== moduleKey) };
      } else {
        return { ...prev, modules: [...current, moduleKey] };
      }
    });
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notifyError('Package name is required');
      return;
    }
    if (!formData.modules || formData.modules.length === 0) {
      notifyError('Please select at least one module for this package');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        tagline: formData.tagline?.trim() || null,
        description: formData.description?.trim() || null,
        icon: formData.icon || 'Boxes',
        modules: formData.modules,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order, 10) || 0
      };

      const res = await updatePackageAction(editingPackage.uuid || editingPackage.id, payload);
      if (res.success) {
        notifySuccess('Package and module permissions updated successfully');
        setDrawerOpen(false);
        fetchPackages();
      } else {
        notifyError(res.message || 'Failed to update package');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const tableColumns = [
    {
      header: 'Package Edition',
      render: (row) => {
        const IconComp = ICON_COMPONENTS[row.icon] || Boxes;
        return (
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0 shadow-xs">
              <IconComp size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{row.name}</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {row.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                {row.tagline || row.description || 'Custom software edition bundle'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Enabled Modules',
      render: (row) => {
        const modulesList = Array.isArray(row.modules) ? row.modules : [];
        return (
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {modulesList.map(modKey => {
              const modInfo = SYSTEM_MODULES.find(m => m.key === modKey);
              return (
                <span 
                  key={modKey} 
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {modInfo ? modInfo.label : modKey}
                </span>
              );
            })}
            {modulesList.length === 0 && (
              <span className="text-xs text-slate-500 italic">No modules assigned</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Enrolled Schools',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <School size={15} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100">{row.schools_count || 0}</span>
            <span className="text-xs text-slate-400 ml-1">Schools</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'slate'} size="sm">
          {row.is_active ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip content="Configure Package & Modules" position="left">
            <button
              onClick={() => openEditDrawer(row)}
              className="p-2 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-slate-800 transition-colors duration-150"
            >
              <Edit3 size={16} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-inner">
            <Boxes size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              SaaS Packages & Module Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Configure core software editions, bundled enterprise capabilities, and system module access permissions across registered institutions.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Packages</span>
            <Boxes size={16} className="text-primary-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{packages.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Suites</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{activePackagesCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Schools</span>
            <School size={16} className="text-amber-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{totalSchools}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Full Suite Enrolled</span>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">{fullSuitePkg?.schools_count || 0}</p>
        </div>
      </div>

      {/* Package Edition Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const IconComp = ICON_COMPONENTS[pkg.icon] || Boxes;
          const pkgModules = Array.isArray(pkg.modules) ? pkg.modules : [];

          return (
            <div 
              key={pkg.id} 
              className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between relative group ${
                pkg.code === 'FULL_SUITE'
                  ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-primary-950/20 border-primary-500/40 shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/20'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-primary-400">
                    <IconComp size={24} />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {pkg.code}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary-400 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {pkg.tagline || pkg.description || 'Configured system edition'}
                  </p>
                </div>

                {/* Module Capabilities Checklist */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Included Capabilities ({pkgModules.length})
                  </span>
                  <div className="space-y-1.5">
                    {SYSTEM_MODULES.map((mod) => {
                      const isIncluded = pkgModules.includes(mod.key);
                      return (
                        <div 
                          key={mod.key} 
                          className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors ${
                            isIncluded 
                              ? 'bg-slate-800/50 text-slate-200' 
                              : 'text-slate-600 opacity-40'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isIncluded ? (
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle size={13} className="text-slate-600 shrink-0" />
                            )}
                            <span className={isIncluded ? 'font-medium' : 'line-through'}>{mod.label}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-slate-100 text-sm">{pkg.schools_count || 0}</span> Schools Active
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditDrawer(pkg)}
                  icon={SlidersHorizontal}
                >
                  Edit Modules
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Management Data Table */}
      <Card
        title="Package Registry & Module Configuration"
        subtitle="Manage software bundles, access control, and enrolled schools"
        icon={Boxes}
      >
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          loading={loading}
          emptyMessage="No SaaS packages found"
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }
          }}
        />
      </Card>

      {/* Edit Package Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Configure Package: ${editingPackage?.name || ''}`}
        subtitle="Update package name, icon, and granular system module permissions"
        icon={Boxes}
        maxWidth="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePackage}
              loading={saving}
              icon={Check}
            >
              Save Package Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Readonly Package Code Alert */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <Info size={18} className="text-primary-400 shrink-0" />
            <div className="text-xs text-slate-300">
              Package Code: <strong className="font-mono text-primary-300">{editingPackage?.code}</strong> (Immutable identifier used for SaaS route guards)
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Package Display Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Full Institutional Suite"
              required
            />

            <Input
              label="Short Tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Complete ERP & Real-Time Smart Bus Tracking"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief summary of this package edition..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sort Order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                min="0"
              />
              <div className="flex flex-col justify-end">
                <Checkbox
                  label="Package Active Status"
                  description="Allow institutions to be provisioned with this package"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              </div>
            </div>
          </div>

          {/* Granular Module Selection Matrix */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Granular Module Permissions</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select the system modules enabled for schools on this package.
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {formData.modules.length} / {SYSTEM_MODULES.length} Selected
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {SYSTEM_MODULES.map((mod) => {
                const isChecked = formData.modules.includes(mod.key);
                const IconComp = ICON_COMPONENTS[mod.icon] || Boxes;

                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key)}
                    className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-3 select-none ${
                      isChecked
                        ? 'bg-primary-500/10 border-primary-500/40 shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleModule(mod.key)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <IconComp size={14} className={isChecked ? 'text-primary-400' : 'text-slate-500'} />
                        <span className={`text-xs font-bold truncate ${isChecked ? 'text-slate-100' : 'text-slate-300'}`}>
                          {mod.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
