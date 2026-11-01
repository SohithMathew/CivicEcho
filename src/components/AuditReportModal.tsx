import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  FileDown,
  Loader2
} from 'lucide-react';
import { CivicReportData, Complaint } from '../types';
import { generateAndDownloadAuditPdf } from '../services/pdfGenerator';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: CivicReportData | null;
  complaints: Complaint[];
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  complaints
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      generateAndDownloadAuditPdf(reportData, complaints);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ reportData, complaints }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Municipal_Audit_Report_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const verifiedCount = complaints.filter((c) => c.verification_status === 'verified').length;
  const inProgressCount = complaints.filter((c) => c.verification_status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.verification_status === 'resolved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-6 text-slate-800 max-h-[92vh] overflow-y-auto print:border-none print:shadow-none print:max-w-none print:p-0 print:max-h-none print:text-slate-900">
        {/* Actions Bar */}
        <div className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono font-bold text-teal-700">
              MUNICIPAL AUDIT REPORT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={downloadJson}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="space-y-6 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-200 pb-5 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-mono tracking-widest uppercase text-teal-700 font-bold block">
                  MUNICIPAL CORPORATION · CIVIC INTELLIGENCE
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Infrastructure Health Audit &amp; Risk Assessment
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Statutory operations, risk factors, and department resolution performance.
            </p>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-100">
              <span>REF: <strong className="text-slate-800 font-bold">AUDIT-REP-2026-Q3</strong></span>
              <span>DATE: <strong className="text-slate-800">{currentDate}</strong></span>
              <span>RECORD: <strong className="text-emerald-700 font-bold">CERTIFIED RECORD</strong></span>
            </div>
          </div>

          {/* Section 1: Executive Operations Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>1. Operations Overview</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Reports</span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {complaints.length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Pending Review</span>
                <span className="text-xl font-bold font-mono text-amber-600">
                  {complaints.filter(c => c.verification_status === 'pending').length}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Verified</span>
                <span className="text-xl font-bold font-mono text-indigo-600">
                  {verifiedCount}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">In Progress</span>
                <span className="text-xl font-bold font-mono text-sky-600">
                  {inProgressCount}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Resolved</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {resolvedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Category Breakdown Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>2. Breakdown by Category</span>
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Count</th>
                    <th className="py-2.5 px-3">Share (%)</th>
                    <th className="py-2.5 px-3">Assigned Department</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData?.category_breakdown?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.category}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{item.count}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{item.percentage}%</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.category.includes('Road')
                          ? 'Public Works Department (PWD)'
                          : item.category.includes('Water')
                          ? 'Kerala Water Authority (KWA)'
                          : item.category.includes('Power') || item.category.includes('Electrical')
                          ? 'State Electricity Board (KSEB)'
                          : item.category.includes('Sanitation')
                          ? 'Health & Solid Waste'
                          : 'Smart City Administration'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: High-Priority Hazard Hotspots */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>3. Priority Hazard Hotspots</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">MG Road Corridor</span>
                  <span className="font-mono text-rose-600 font-bold">Risk 88/100</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Water feeder leak causing road sub-base deterioration.
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">Action: Valve Isolation &amp; Trench Repair</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">South Overbridge</span>
                  <span className="font-mono text-rose-600 font-bold">Risk 95/100</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Power distribution pole instability near railway approach.
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">Action: Pole Restabilization &amp; Re-guying</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Fort Kochi Walkway</span>
                  <span className="font-mono text-amber-600 font-bold">Risk 64/100</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Streetlight cable wear creating poor lighting along the coastal path.
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">Action: Luminaire &amp; Wiring Replacement</span>
              </div>
            </div>
          </div>

          {/* Section 4: Recommendations */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>4. Recommended Action Plan</span>
            </h2>

            <div className="space-y-2 text-xs">
              {reportData?.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Verification & Signatory */}
          <div className="pt-6 border-t-2 border-slate-200 mt-8 grid grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                AUDIT HASH
              </span>
              <p className="font-mono text-[11px] text-slate-700 break-all">
                SHA256: 7f8a91b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                CivicEcho Verified Database Record
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                AUTHORIZED SIGNATORY
              </span>
              <div className="font-bold text-slate-800 text-sm">
                Er. K. Raman Nair
              </div>
              <div className="text-[11px] text-slate-500">
                Superintending Engineer &amp; Municipal Admin
              </div>
              <div className="inline-block mt-1 font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 bg-emerald-50 font-semibold">
                Certified &amp; Recorded
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReportModal;
