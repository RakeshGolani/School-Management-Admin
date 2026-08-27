'use client';

export default function BillingSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
          <div className="space-y-2 flex-1 max-w-md">
            <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-800/60 rounded-md w-full" />
          </div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-36 shrink-0" />
      </div>

      {/* 2-Column Pricing Slabs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Subscription Pricing Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="h-5 bg-slate-800 rounded-md w-48 mb-2" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 bg-slate-800/60 rounded w-1/3" />
                <div className="h-10 bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Per-Student & Smart Bus Add-on Rates Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="h-5 bg-slate-800 rounded-md w-56 mb-2" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 bg-slate-800/60 rounded w-1/3" />
                <div className="h-10 bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Gateway & Invoicing Settings Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="h-5 bg-slate-800 rounded-md w-60 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 bg-slate-800/60 rounded w-1/3" />
              <div className="h-10 bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
