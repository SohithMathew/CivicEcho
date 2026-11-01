import React, { useState, useEffect } from 'react';
import { generateAndDownloadAuditPdf } from '../services/pdfGenerator';
import {
  Download,
  Printer,
  CheckCircle2,
  Layers,
  Sparkles,
  FileCheck,
  ArrowRight,
  FileDown,
  Loader2
} from 'lucide-react';
import { civicApi } from '../services/api';
import { CivicReportData, Complaint } from '../types';
import AuditReportModal from '../components/AuditReportModal';

interface ReportsProps {
  complaints: Complaint[];
}

export const Reports: React.FC<ReportsProps> = ({ complaints }) => {
  const [reportData, setReportData] = useState<CivicReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    civicApi.getReports().then((data) => {
      setReportData(data);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching reports:', err);
      setLoading(false);
    });
  }, []);

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

  const downloadCsv = () => {
    const headers = ['Complaint ID', 'Category', 'Description', 'Latitude', 'Longitude', 'Status', 'Urgency', 'Created At'];
    const rows = complaints.map((c) => [
      c.complaint_id,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.latitude,
      c.longitude,
      c.verification_status,
      c.urgency,
      c.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicEcho_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenAuditReport = () => {
    setIsAuditModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Reports &amp; Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Performance metrics, category breakdowns, and exportable audit summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAuditReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-teal-600" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Loading municipal report...</p>
        </div>
      ) : reportData && (
        <div className="space-y-6">
          {/* Executive Summary Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                  Operational Period
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                  Infrastructure Health &amp; Operational Overview
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleOpenAuditReport}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Full Certified Audit</span>
                </button>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Health Rating</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono">
                    {reportData.metrics.infrastructure_health_score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Total Reports</span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {complaints.length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Pending Review</span>
                <span className="text-xl font-bold text-amber-600 font-mono">
                  {complaints.filter(c => c.verification_status === 'pending').length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Verified by Eng.</span>
                <span className="text-xl font-bold text-indigo-600 font-mono">
                  {complaints.filter(c => c.verification_status === 'verified').length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">In Progress</span>
                <span className="text-xl font-bold text-sky-600 font-mono">
                  {complaints.filter(c => c.verification_status === 'in_progress').length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Resolved</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {complaints.filter(c => c.verification_status === 'resolved').length}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Category Breakdown */}
            <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Issue Category Distribution</span>
              </h3>

              <div className="space-y-4">
                {reportData.category_breakdown.map((item: { category: string; count: number; percentage: number }, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{item.category}</span>
                      <span className="text-slate-500 font-mono">
                        {item.percentage}% ({item.count} reports)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="md:col-span-6 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Key Action Directives</span>
                </h3>

                <div className="space-y-2.5">
                  {reportData.recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Certified Municipal Audit</span>
                <button
                  onClick={handleOpenAuditReport}
                  className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Print Audit</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Municipal Audit Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        reportData={reportData}
        complaints={complaints}
      />
    </div>
  );
};

export default Reports;
