'use client';

export default function InvoiceSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="h-9 bg-slate-800 rounded-xl w-32" />
        <div className="flex items-center gap-3">
          <div className="h-9 bg-slate-800 rounded-xl w-24" />
          <div className="h-9 bg-slate-800 rounded-xl w-28" />
        </div>
      </div>

      {/* Invoice Document Paper Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        {/* Header: Company & Invoice Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-800 rounded-lg w-40" />
              <div className="h-3.5 bg-slate-800/60 rounded w-52" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-7 bg-slate-800 rounded-lg w-32 ml-auto" />
            <div className="h-4 bg-slate-800/60 rounded w-24 ml-auto" />
          </div>
        </div>

        {/* Bill To & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="h-3 bg-slate-800/60 rounded w-20" />
            <div className="h-5 bg-slate-800 rounded w-48" />
            <div className="h-3.5 bg-slate-800/60 rounded w-56" />
            <div className="h-3.5 bg-slate-800/60 rounded w-36" />
          </div>
          <div className="space-y-2 sm:text-right">
            <div className="h-3 bg-slate-800/60 rounded w-24 sm:ml-auto" />
            <div className="h-5 bg-slate-800 rounded w-36 sm:ml-auto" />
            <div className="h-3.5 bg-slate-800/60 rounded w-40 sm:ml-auto" />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="h-8 bg-slate-800/60 rounded-xl w-full" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/40">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-16" />
              <div className="h-4 bg-slate-800 rounded w-20" />
            </div>
          ))}
        </div>

        {/* Total Summary Box */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2.5">
            <div className="flex justify-between">
              <div className="h-3.5 bg-slate-800/60 rounded w-20" />
              <div className="h-3.5 bg-slate-800 rounded w-16" />
            </div>
            <div className="flex justify-between">
              <div className="h-3.5 bg-slate-800/60 rounded w-24" />
              <div className="h-3.5 bg-slate-800 rounded w-16" />
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2">
              <div className="h-5 bg-slate-800 rounded w-24" />
              <div className="h-5 bg-slate-800 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
