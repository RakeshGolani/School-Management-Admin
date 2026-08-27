'use client';

export default function TeacherTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-800/40 last:border-0">
          {/* Teacher Profile */}
          <td className="py-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800/80 shrink-0"></div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 bg-slate-800/80 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-800/40 rounded-md w-1/2"></div>
              </div>
            </div>
          </td>

          {/* School / Institution */}
          <td className="py-4 px-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800/80 shrink-0"></div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3.5 bg-slate-800/80 rounded-md w-28"></div>
                <div className="h-3 bg-slate-800/40 rounded-md w-14"></div>
              </div>
            </div>
          </td>

          {/* Subject / Department */}
          <td className="py-4 px-4">
            <div className="h-6 bg-slate-800/80 rounded-lg w-24"></div>
          </td>

          {/* Contact Details */}
          <td className="py-4 px-4">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-slate-800/80 rounded-md w-32"></div>
              <div className="h-3 bg-slate-800/40 rounded-md w-20"></div>
            </div>
          </td>

          {/* Services & NFC */}
          <td className="py-4 px-4">
            <div className="h-6 bg-slate-800/80 rounded-full w-18"></div>
          </td>

          {/* Status */}
          <td className="py-4 px-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-5 rounded-full bg-slate-800/80"></div>
              <div className="h-3.5 bg-slate-800/60 rounded w-10"></div>
            </div>
          </td>

          {/* Actions */}
          <td className="py-4 px-4 text-right">
            <div className="flex items-center space-x-2 justify-end">
              <div className="w-8 h-8 rounded-lg bg-slate-800/80"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-800/80"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-800/80"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
