'use client';

export default function TeacherDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header / Back navigation */}
      <div className="flex items-center justify-between">
        <div className="h-9 bg-slate-800 rounded-xl w-28" />
        <div className="flex items-center space-x-3">
          <div className="h-9 bg-slate-800 rounded-xl w-24" />
          <div className="h-9 bg-slate-800 rounded-xl w-28" />
        </div>
      </div>

      {/* Hero Teacher Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 shrink-0" />
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-7 bg-slate-800 rounded-lg w-48" />
              <div className="h-5 bg-slate-800 rounded-full w-20" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-slate-800/70 rounded w-32" />
              <div className="h-4 bg-slate-800/70 rounded w-28" />
              <div className="h-4 bg-slate-800/70 rounded w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 bg-slate-800 rounded-xl w-28" />
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-800 rounded w-2/3" />
              <div className="h-6 bg-slate-800 rounded-lg w-1/2" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
          </div>
        ))}
      </div>

      {/* 2-Column Info & Assigned Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Academic Credentials */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="h-5 bg-slate-800 rounded-md w-36 mb-4" />
          <div className="space-y-3.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5 border-b border-slate-800/40 pb-2.5 last:border-0">
                <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Assigned Classes & Timetable preview */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="h-5 bg-slate-800 rounded-md w-44" />
            <div className="h-8 bg-slate-800 rounded-lg w-24" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-800 rounded w-32" />
                    <div className="h-3 bg-slate-800/60 rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-slate-800 rounded-full w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
