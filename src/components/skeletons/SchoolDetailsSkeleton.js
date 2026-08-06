'use client';

export default function SchoolDetailsSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Top Navigation skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-800/60 rounded-xl w-40"></div>
        <div className="h-9 bg-slate-800/60 rounded-xl w-28"></div>
      </div>

      {/* Profile Header Card skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-2">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="w-24 h-24 rounded-3xl bg-slate-800 shrink-0 shadow-xl"></div>
            <div className="text-center md:text-left space-y-3 w-full">
              <div className="h-8 bg-slate-800 rounded-lg w-72 mx-auto md:mx-0"></div>
              <div className="flex justify-center md:justify-start gap-2.5">
                <div className="h-6 bg-slate-800/60 rounded-lg w-28"></div>
                <div className="h-6 bg-slate-800/60 rounded-full w-24"></div>
              </div>
            </div>
          </div>
          {/* Quick Switch */}
          <div className="w-40 h-16 bg-slate-950/40 rounded-2xl border border-slate-800/60 shrink-0"></div>
        </div>
      </div>

      {/* Details Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="h-5 bg-slate-800 rounded-lg w-40 pb-2"></div>
          <div className="space-y-4 pt-2 border-t border-slate-800/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <div className="h-4 bg-slate-800/40 rounded col-span-1"></div>
                <div className="h-4 bg-slate-800/75 rounded col-span-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="h-5 bg-slate-800 rounded-lg w-40 pb-2"></div>
          <div className="space-y-4 pt-2 border-t border-slate-800/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <div className="h-4 bg-slate-800/40 rounded col-span-1"></div>
                <div className="h-4 bg-slate-800/75 rounded col-span-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
