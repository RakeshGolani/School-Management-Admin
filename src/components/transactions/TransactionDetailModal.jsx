'use client';
import { X, Building2, Calendar, CreditCard, CheckCircle2, AlertTriangle, XCircle, FileText, Hash, ShieldCheck, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function TransactionDetailModal({ isOpen, onClose, transaction, onOpenInvoice }) {
  if (!isOpen || !transaction) return null;

  const school = transaction.school || {};
  const subscription = transaction.subscription || {};
  const invoice = transaction.invoice || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Paid & Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={14} /> Pending Payment
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle size={14} /> Payment Failed
          </span>
        );
      default:
        return null;
    }
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Transaction Details</h3>
              <p className="text-xs text-slate-400">Ref: <span className="font-mono text-amber-400">{transaction.gateway_transaction_id}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status & Amount Highlight Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Transaction Value</p>
              <h2 className="text-3xl font-extrabold text-slate-100 font-mono mt-1">
                ₹{parseFloat(transaction.amount).toFixed(2)} <span className="text-xs text-slate-400 font-normal">{transaction.currency}</span>
              </h2>
            </div>
            <div>{getStatusBadge(transaction.status)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* School Info */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Building2 size={14} className="text-amber-400" />
                <span>Institution Info</span>
              </div>
              <p className="text-sm font-bold text-slate-100">{school.school_name || 'N/A'}</p>
              <p className="text-xs text-slate-400">Code: <span className="text-slate-200 font-mono">{school.code}</span></p>
              <p className="text-xs text-slate-400">{school.email}</p>
            </div>

            {/* Payment Gateway Info */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Payment Metadata</span>
              </div>
              <p className="text-xs text-slate-400">Method: <strong className="text-slate-200">{transaction.payment_method || 'Online'}</strong></p>
              <p className="text-xs text-slate-400">Processed At: <span className="text-slate-200">{formattedDate}</span></p>
              <p className="text-xs text-slate-400">Gateway ID: <span className="text-amber-400 font-mono">{transaction.gateway_transaction_id}</span></p>
            </div>

          </div>

          {/* Subscription Package Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscribed SaaS Plan</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Plan Type:</span>
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold uppercase border border-amber-500/20">
                {subscription.plan_type || 'MONTHLY'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Included Max Limits:</span>
              <span className="text-slate-200 font-mono">
                {subscription.max_students_limit ?? 50} Students
                {subscription.max_buses_limit > 0 ? ` / ${subscription.max_buses_limit} Buses` : ''}
              </span>
            </div>
          </div>

          {/* Invoice Information Card if available */}
          {invoice && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Tax Invoice Generated</p>
                <p className="text-sm font-bold text-amber-400 font-mono">{invoice.invoice_number}</p>
              </div>
              <Link
                href={`/transactions/invoices/${transaction.id}`}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
              >
                <FileText size={14} />
                <span>View Full Tax Invoice</span>
              </Link>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
