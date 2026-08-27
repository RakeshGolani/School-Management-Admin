'use client';
import { useState, useEffect } from 'react';
import { X, Printer, Download, Building2, CheckCircle2, AlertCircle, FileText, Calendar, CreditCard, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function PrintableInvoiceModal({ isOpen, onClose, transaction }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';
          const res = await fetch(`${apiUrl}/system-settings`);
          const data = await res.json();
          if (data.success && data.data) {
            setSystemSettings(data.data);
          }
        } catch (err) {
          console.error('Error fetching system settings:', err);
        }
      };
      fetchSettings();
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

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
  const taxRate = 18; // 18% GST standard
  const subtotal = (amountPaid / (1 + taxRate / 100)).toFixed(2);
  const taxAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Container with print-specific styles */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-200 print:max-h-none print:shadow-none print:border-none print:m-0 print:w-full print:bg-white print:text-black">
        
        {/* Top Header Bar - Hidden during printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Tax Invoice Preview</h3>
              <p className="text-xs text-slate-400">Official billing invoice for {school.school_name || 'Institution'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-primary-500/25 cursor-pointer active:scale-95"
            >
              <Printer size={16} />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div id="invoice-document" className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-900 print:bg-white print:text-slate-900 print:overflow-visible">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 print:border-slate-300 gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                {systemSettings?.logo_url ? (
                  <img src={systemSettings.logo_url.startsWith('http') ? systemSettings.logo_url : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${systemSettings.logo_url}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-primary-500/20">
                    <ShieldCheck size={24} />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-100 print:text-slate-900">{systemSettings?.company_name || 'Vidyadmin SaaS Cloud'}</h1>
                  <p className="text-xs text-primary-400 font-semibold">{systemSettings?.tagline || 'Simplifying Education, Empowering Admins'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 pt-2">
                {systemSettings?.address || 'Tech Park Tower 4, Educational Corridor, Cyber City'} <br />
                GSTIN: {systemSettings?.gstin || '27AAAAA0000A1Z5'} | Support: {systemSettings?.support_email || 'support@eduschool.io'}
              </p>
            </div>

            <div className="text-left md:text-right space-y-1 bg-slate-800/40 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-200 w-full md:w-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest mb-1 print:border-slate-300 print:bg-emerald-100 print:text-emerald-800">
                TAX INVOICE
              </span>
              <h2 className="text-lg font-bold text-slate-100 print:text-slate-900 font-mono">{invoiceNumber}</h2>
              <div className="flex items-center md:justify-end space-x-2 text-xs text-slate-400 print:text-slate-600">
                <Calendar size={14} />
                <span>Date: {issueDate}</span>
              </div>
            </div>
          </div>

          {/* Billed To / Billing From Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/40 print:bg-slate-50 border border-slate-800/80 print:border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 print:text-slate-500 uppercase tracking-wider">BILLED TO (CUSTOMER)</h4>
              <h3 className="text-base font-bold text-amber-400 print:text-slate-900">{school.school_name || 'N/A'}</h3>
              <p className="text-xs text-slate-400 print:text-slate-700 flex items-center gap-2">
                <Building2 size={13} className="shrink-0 text-slate-500" />
                <span>School Code: <strong className="text-slate-200 print:text-slate-900">{school.code}</strong></span>
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

            <div className="p-5 rounded-2xl bg-slate-950/40 print:bg-slate-50 border border-slate-800/80 print:border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 print:text-slate-500 uppercase tracking-wider">PAYMENT INFORMATION</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600">Payment Status:</span>
                  <span className="font-semibold text-emerald-400 print:text-emerald-700 uppercase flex items-center gap-1">
                    <CheckCircle2 size={13} /> {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600">Payment Method:</span>
                  <span className="font-semibold text-slate-200 print:text-slate-900">{transaction.payment_method || 'Online Gateway'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-slate-200">
                  <span className="text-slate-400 print:text-slate-600">Transaction Reference:</span>
                  <span className="font-mono text-amber-400 print:text-slate-900">{transaction.gateway_transaction_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 print:bg-slate-100 text-slate-300 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-300">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Plan / Capacity</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-slate-800">
                <tr>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100 print:text-slate-900">
                      SaaS Subscription Plan ({subscription.plan_type ? subscription.plan_type.toUpperCase() : 'MONTHLY'})
                    </div>
                      <div className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                        Access to Student Portal, NFC Attendance{subscription.max_buses_limit > 0 ? ', Bus Tracking' : ''} & Admin Dashboard
                      </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 text-slate-300 print:text-slate-800 font-mono">
                      {subscription.max_students_limit ?? 50} Students
                      {subscription.max_buses_limit > 0 ? ` / ${subscription.max_buses_limit} Buses` : ''}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">₹{subtotal}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 print:text-slate-900">₹{subtotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-2 gap-6">
            <div className="text-xs text-slate-400 print:text-slate-600 space-y-1 max-w-sm">
              <p className="font-bold text-slate-300 print:text-slate-800">Terms & Conditions:</p>
              <p>1. This is a computer-generated tax invoice and requires no signature.</p>
              <p>2. Subscription fees are non-refundable once activated.</p>
            </div>

            <div className="w-full md:w-72 bg-slate-950/60 print:bg-slate-50 p-4 rounded-2xl border border-slate-800 print:border-slate-200 space-y-2.5 text-xs">
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
                <span className="font-mono text-amber-400 print:text-slate-900">₹{amountPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Paid Seal */}
          <div className="pt-4 text-center border-t border-slate-800 print:border-slate-300">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-widest">
              <CheckCircle2 size={16} /> Paid in Full via {transaction.payment_method || 'Online Payment Gateway'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
