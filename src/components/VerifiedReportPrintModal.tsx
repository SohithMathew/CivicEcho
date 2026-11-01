import React, { useState } from 'react';
import { X, Printer, Shield, CheckCircle2, Download, Building2, Layers, Loader2 } from 'lucide-react';
import { generateAndDownloadVerifiedDirectivePdf } from '../services/pdfGenerator';

interface VerifiedReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  verifiedBy?: string;
  verifiedAt?: string;
}

export const VerifiedReportPrintModal: React.FC<VerifiedReportPrintModalProps> = ({
  isOpen,
  onClose,
  report,
  verifiedBy,
  verifiedAt
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      generateAndDownloadVerifiedDirectivePdf(report, verifiedBy, verifiedAt);
    } catch (err) {
      console.error('Error downloading verified directive PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const refNumber = report.official_reference_number || 'MUNI-DIR-2026-9281';
  const printDate = verifiedAt ? new Date(verifiedAt).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative my-8 print:border-none print:shadow-none print:m-0 print:p-6 print:max-w-none text-slate-800">
        
        {/* Screen Controls Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Verified Municipal Directive &bull; Official Record
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Report Canvas */}
        <div className="space-y-6 print:space-y-4 font-sans text-slate-800">
          
          {/* Header */}
          <div className="border-b-2 border-slate-200 pb-5 text-center relative">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl print:text-2xl font-bold tracking-tight text-slate-900 uppercase">
              Municipal Corporation Infrastructure Command
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">
              Public Works &bull; Water Authority &bull; Electrical Board &bull; Traffic Management
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500 border-t border-slate-100 pt-2">
              <span>REFERENCE: <strong className="text-slate-800">{refNumber}</strong></span>
              <span>&bull;</span>
              <span>PRIORITY: <strong className="text-rose-600">P1 - HIGH PRIORITY</strong></span>
              <span>&bull;</span>
              <span>DATE/TIME: <strong className="text-slate-800">{printDate}</strong></span>
            </div>
          </div>

          {/* Verification Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Municipal Staff Verification Confirmed
                </h4>
                <p className="text-xs text-slate-700 mt-0.5">
                  Authorized by: <strong className="text-slate-900">{verifiedBy || report.verified_by || 'Er. K. Raman Nair (Chief Municipal Engineer)'}</strong>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Notes: {report.verifier_notes || 'All cross-incident correlations and work directives verified for execution.'}
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right font-mono text-[10px]">
              <span className="block border border-emerald-300 px-2 py-1 rounded bg-white text-emerald-800 font-bold uppercase shadow-xs">
                Certified
              </span>
            </div>
          </div>

          {/* Directive Title & Core Stats */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {report.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Risk Score</span>
                <span className="text-2xl font-black text-rose-600 font-mono">{report.composite_risk_score}/100</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Reports</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{report.total_analyzed_reports}</span>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                  {report.status_distribution?.pending || 1}P &middot; {report.status_distribution?.verified || 2}V &middot; {report.status_distribution?.in_progress || 4}In Prog &middot; {report.status_distribution?.resolved || 3}Resolved
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Identified Clusters</span>
                <span className="text-2xl font-black text-indigo-700 font-mono">{report.correlation_nexus?.length || 2}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Est. Budget</span>
                <span className="text-xl font-black text-teal-700 font-mono">₹1,85,000</span>
              </div>
            </div>
          </div>

          {/* Correlation Synthesis */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Cross-Incident Correlation &amp; Root Cause</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {report.executive_summary}
            </p>

            <div className="space-y-2 mt-3">
              {report.correlation_nexus?.map((nex: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {nex.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {nex.criticality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {nex.synergy_synthesis}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Correlated Issues: {nex.correlated_complaint_ids?.join(', ')}</span>
                    <span>Estimated Impact: {nex.affected_commuters?.toLocaleString()} daily</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorities and Work Directives */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Responsible Authorities &amp; Emergency Work Orders</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.concerning_authorities?.map((auth: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{auth.name}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      {auth.status || 'Dispatched'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{auth.role}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Contact: {auth.contact_email}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Task</th>
                    <th className="p-2">Responsible Agency</th>
                    <th className="p-2">Turnaround</th>
                    <th className="p-2">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.emergency_work_orders?.map((wo: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 font-medium text-slate-800">{wo.task}</td>
                      <td className="p-2 text-slate-600">{wo.agency}</td>
                      <td className="p-2 font-mono text-amber-700 font-semibold">{wo.turnaround_time}</td>
                      <td className="p-2 font-mono text-rose-700 font-bold">{wo.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-800 text-sm">
                {verifiedBy || report.verified_by || 'Er. K. Raman Nair'}
              </div>
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-slate-900">Er. K. Raman Nair</p>
                <p className="text-[11px] text-slate-500">Chief Municipal Engineer &bull; PWD</p>
              </div>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center font-serif italic text-slate-800 text-sm">
                Dr. Malini V. Kurup
              </div>
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-slate-900">Dr. Malini V. Kurup</p>
                <p className="text-[11px] text-slate-500">Executive Director &bull; Water &amp; Drainage</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifiedReportPrintModal;
