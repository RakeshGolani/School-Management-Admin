'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Printer, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import InvoiceSkeleton from '@/components/transactions/InvoiceSkeleton';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transaction list or single endpoint
      const response = await fetch(`http://localhost:5000/api/admin/transactions?limit=100`);
      const data = await response.json();

      if (data.success && data.data) {
        const found = data.data.find(
          (t) => String(t.id) === String(id) || String(t.gateway_transaction_id) === String(id) || String(t.invoice?.invoice_number) === String(id)
        );
        if (found) {
          setTransaction(found);
        } else {
          // If not found in list, fallback to first transaction for demo/testing or show error
          if (data.data.length > 0) {
            setTransaction(data.data[0]);
          } else {
            setError('Invoice record not found.');
          }
        }
      } else {
        setError('Failed to load invoice details.');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Server connection error while fetching invoice details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const handlePrint = () => {
    window.open(`/transactions/invoices/${id}/print`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <InvoiceSkeleton theme="dark" showActionBar={true} />;
  }

  if (error || !transaction) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Invoice Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested invoice could not be located in our records.'}</p>
        <Link
          href="/transactions"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Transactions</span>
        </Link>
      </div>
    );
  }

  const school = transaction.school || {};
  const subscription = transaction.subscription || {};
  const invoice = transaction.invoice || {};

  const invoiceNumber = invoice.invoice_number || `INV-${new Date(transaction.createdAt).getFullYear()}-${String(transaction.id).padStart(4, '0')}`;
  const issueDate = new Date(transaction.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const amountPaid = parseFloat(transaction.amount || 0);
  const taxRate = 18; // 18% GST
  const subtotal = (amountPaid / (1 + taxRate / 100)).toFixed(2);
  const taxAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none print:space-y-0">
      
      {/* Top Action Bar (Screen Only - Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            href="/transactions"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Invoice {invoiceNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {transaction.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400">View and print official tax invoice</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copied ? 'Copied Link' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main A4 Styled Sheet Container */}
      <div className="mx-auto w-full max-w-[794px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:bg-white print:text-slate-900">
        
        {/* Printable Document Body */}
        <div id="invoice-document" className="p-10 sm:p-14 bg-slate-900 print:bg-white print:text-slate-900 flex-1 flex flex-col justify-between print:min-h-[262mm] w-full">
          
          {/* Top Content Group */}
          <div className="space-y-8 print:space-y-5 w-full flex flex-col justify-start pb-8 print:pb-0">
            {/* Company Brand & Invoice Meta Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800 print:border-slate-300 gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md print:bg-amber-500 print:text-slate-950">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-slate-100 print:text-slate-900">EduSchool SaaS Cloud</h1>
                    <p className="text-xs text-amber-400 font-semibold print-amber-text">Enterprise School Management Suiteeeeee</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600 pt-1">
                  Tech Park Tower 4, Educational Corridor, Cyber City <br />
                  GSTIN: 27AAAAA0000A1Z5 | Support: support@eduschool.io
                </p>
              </div>

              <div className="text-left md:text-right space-y-0.5 bg-slate-800/40 print-card p-3 rounded-xl border border-slate-800 print:border-slate-200 w-full md:w-auto">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest mb-0.5 print-badge">
                  TAX INVOICE
                </span>
                <h2 className="text-base font-bold text-slate-100 print:text-slate-900 font-mono">{invoiceNumber}</h2>
                <div className="flex items-center md:justify-end space-x-1.5 text-[11px] text-slate-400 print:text-slate-600">
                  <Calendar size={13} />
                  <span>Date: {issueDate}</span>
                </div>
              </div>
            </div>

            {/* Billed To / Payment Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Billed To Customer */}
              <div className="p-4 rounded-xl bg-slate-950/50 print-card border border-slate-800/80 print:border-slate-200 space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 print:text-slate-500 uppercase tracking-wider">BILLED TO (CUSTOMER)</h4>
                <h3 className="text-sm font-bold text-amber-400 print-amber-text">{school.school_name || 'N/A'}</h3>
                <p className="text-xs text-slate-400 print:text-slate-700 flex items-center gap-2">
                  <Building2 size={13} className="shrink-0 text-slate-500" />
                  <span>School Code: <strong className="text-slate-200 print:text-slate-900 font-mono">{school.code}</strong></span>
                </p>
                {school.address && (
                  <p className="text-xs text-slate-400 print:text-slate-700 flex items-start gap-2">
                    <MapPin size={13} className="shrink-0 text-slate-500 mt-0.5" />
                    <span>{school.address}</span>
                  </p>
                )}
                {school.email && (
                  <p className="text-xs text-slate-400 print:text-slate-700 flex items-center gap-2">
                    <Mail size={13} className="shrink-0 text-slate-500" />
                    <span>{school.email}</span>
                  </p>
                )}
                {school.phone && (
                  <p className="text-xs text-slate-400 print:text-slate-700 flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-slate-500" />
                    <span>{school.phone}</span>
                  </p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-slate-950/50 print-card border border-slate-800/80 print:border-slate-200 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 print:text-slate-500 uppercase tracking-wider">PAYMENT DETAILS</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                    <span className="text-slate-400 print:text-slate-600">Payment Status:</span>
                    <span className="font-semibold text-emerald-400 print:text-emerald-700 uppercase flex items-center gap-1">
                      <CheckCircle2 size={13} /> {transaction.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                    <span className="text-slate-400 print:text-slate-600">Payment Method:</span>
                    <span className="font-semibold text-slate-200 print:text-slate-900">{transaction.payment_method || 'Online Gateway'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                    <span className="text-slate-400 print:text-slate-600">Transaction Reference:</span>
                    <span className="font-mono text-amber-400 print:text-slate-900 font-semibold">{transaction.gateway_transaction_id}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Line Items Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 print-table-header text-slate-300 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3.5">Item Description</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Plan / Capacity</th>
                    <th className="py-2.5 px-3.5 text-right">Base Price</th>
                    <th className="py-2.5 px-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-slate-800">
                  <tr>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-100 print:text-slate-900">
                        SaaS Subscription Plan ({subscription.plan_type ? subscription.plan_type.toUpperCase() : 'MONTHLY'})
                      </div>
                      <div className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                        Access to Student Portal, NFC Attendance, Bus Tracking & Admin Dashboard
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 print-pill text-slate-300 print:text-slate-900 font-mono text-[11px] whitespace-nowrap">
                        {subscription.max_students_limit || 50} Students / {subscription.max_buses_limit || 5} Buses
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">₹{subtotal}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-100 print:text-slate-900">₹{subtotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Content Group */}
          <div className="space-y-8 print:space-y-5 w-full pt-8 print:pt-0">
            {/* Calculations & Terms */}
            <div className="flex flex-col md:flex-row justify-between items-start pt-1 gap-4">
              <div className="text-[11px] text-slate-400 print:text-slate-600 space-y-0.5 max-w-sm">
                <p className="font-bold text-slate-300 print:text-slate-800">Terms & Conditions:</p>
                <p>1. This is a computer-generated tax invoice and requires no signature.</p>
                <p>2. Subscription fees are non-refundable once activated.</p>
              </div>

              <div className="w-full md:w-72 bg-slate-950/60 print-card p-3.5 rounded-xl border border-slate-800 print:border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200 print:text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>GST (18%):</span>
                  <span className="font-mono text-slate-200 print:text-slate-900">₹{taxAmount}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 print:border-slate-300 flex justify-between font-bold text-sm text-slate-100 print:text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-amber-400 print-amber-text text-sm font-extrabold">₹{amountPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Paid Footer Seal */}
            <div className="pt-3 text-center border-t border-slate-800 print:border-slate-300">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-widest">
                <CheckCircle2 size={15} /> Paid in Full via {transaction.payment_method || 'Online Payment Gateway'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
