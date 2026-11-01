import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  Printer,
  Download,
  Building2,
  RefreshCw,
  UserCheck,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  X,
  Send,
  Clock
} from 'lucide-react';
import { civicApi } from '../../services/api';
import { Complaint, User } from '../../types';
import VerifiedReportPrintModal from '../../components/VerifiedReportPrintModal';
import { generateAndDownloadVerifiedDirectivePdf } from '../../services/pdfGenerator';

interface AdminRiskPredictionProps {
  complaints: Complaint[];
  currentUser?: User;
}

export const AdminRiskPrediction: React.FC<AdminRiskPredictionProps> = ({
  complaints,
  currentUser
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [staffNotes, setStaffNotes] = useState(
    'Directives verified against telemetry and approved for immediate inter-agency deployment.'
  );
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Report Editing State for Municipal Staff
  const [isEditing, setIsEditing] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editScore, setEditScore] = useState(89);
  const [editSummary, setEditSummary] = useState('');
  const [editNexuses, setEditNexuses] = useState<any[]>([]);
  const [editWorkOrders, setEditWorkOrders] = useState<any[]>([]);

  const startEditing = () => {
    if (!report) return;
    setEditTitle(report.title || '');
    setEditScore(report.composite_risk_score || 89);
    setEditSummary(report.executive_summary || '');
    setEditNexuses(JSON.parse(JSON.stringify(report.correlation_nexus || [])));
    setEditWorkOrders(JSON.parse(JSON.stringify(report.emergency_work_orders || [])));
    setIsEditing(true);
  };

  const handleSaveReportEdits = async () => {
    setSavingReport(true);
    try {
      const updated = await civicApi.updateCorrelatedRiskReport({
        title: editTitle,
        composite_risk_score: editScore,
        executive_summary: editSummary,
        correlation_nexus: editNexuses,
        emergency_work_orders: editWorkOrders,
        last_edited_by: currentUser?.name || 'Er. K. Raman Nair'
      });
      setReport(updated);
      setIsEditing(false);
      setToastMessage('Report updated and saved successfully.');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Error saving report edits:', err);
    } finally {
      setSavingReport(false);
    }
  };

  const handleResetToAIDefault = async () => {
    if (!window.confirm('Reset this report back to the automated AI correlation?')) return;
    setLoading(true);
    try {
      const reset = await civicApi.resetCorrelatedRiskReport();
      setReport(reset);
      setIsEditing(false);
      setToastMessage('Report restored to AI correlation baseline.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error resetting report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkOrder = () => {
    setEditWorkOrders((prev) => [
      ...prev,
      {
        task: 'New remediation directive',
        agency: 'Public Works Department (PWD Roads)',
        turnaround_time: '4 hours',
        priority: 'P1'
      }
    ]);
  };

  const handleDeleteWorkOrder = (idx: number) => {
    setEditWorkOrders((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    setDownloadingPdf(true);
    try {
      generateAndDownloadVerifiedDirectivePdf(
        report,
        report.verified_by || currentUser?.name,
        report.verified_at
      );
    } catch (err) {
      console.error('Error downloading verified directive PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  const fetchCorrelatedReport = async () => {
    setLoading(true);
    try {
      const data = await civicApi.getCorrelatedRiskReport();
      setReport(data);
    } catch (err) {
      console.error('Error loading correlated risk report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelatedReport();
  }, []);

  const handleVerifyAndDispatch = async () => {
    setVerifying(true);
    try {
      const updated = await civicApi.verifyAndDispatchDirective({
        verifier_name: currentUser?.name || 'Er. K. Raman Nair',
        verifier_department: currentUser?.department || 'Public Works Administration',
        notes: staffNotes
      });
      setReport(updated);
      setToastMessage('Directive verified and dispatched to authorities.');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Error verifying report:', err);
    } finally {
      setVerifying(false);
    }
  };

  const isVerified = report?.verification_status === 'verified_and_dispatched';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              AI RISK ENGINE
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Correlation &amp; Directives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Incident Correlation &amp; Directives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthesize reported civic issues, evaluate compound hazards, and dispatch multi-agency directives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Edit Directives</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveReportEdits}
                disabled={savingReport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToAIDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          )}

          <button
            onClick={fetchCorrelatedReport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {isVerified && (
            <>
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print View</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Synthesizing civic reports...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Computing compound hazard indices and cross-incident correlation.
          </p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top Status & Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Compound Risk Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 font-mono">{report.composite_risk_score}</span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                Critical Compound Threat
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Analyzed Reports</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">{report.total_analyzed_reports}</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 flex-wrap">
                <span className="text-amber-600 font-bold">{report.status_distribution?.pending || 0} Pending</span>
                <span>&bull;</span>
                <span className="text-indigo-600 font-bold">{report.status_distribution?.verified || 0} Verified</span>
                <span>&bull;</span>
                <span className="text-sky-600 font-bold">{report.status_distribution?.in_progress || 0} In Progress</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Target Authorities</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700 font-mono">4</span>
                <span className="text-xs text-slate-400">Agencies</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block truncate">
                PWD, Water Authority, Traffic, Electricity
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Verification Status</span>
              <div className="mt-1">
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified &amp; Dispatched</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Awaiting Staff Sign-off</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">
                {isVerified ? `Ref: ${report.official_reference_number}` : 'Requires verification below'}
              </span>
            </div>
          </div>

          {/* Edit Form OR Synthesis Card */}
          {isEditing ? (
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                      Edit Directives
                    </h2>
                    <p className="text-xs text-slate-500">
                      Modify conclusions, adjust risk score, and update action orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReportEdits}
                    disabled={savingReport}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    {savingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Title & Score Editor */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Directive Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Risk Score</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={editScore}
                      onChange={(e) => setEditScore(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-rose-600 font-mono font-bold focus:outline-none focus:border-purple-600"
                    />
                    <span className="text-xs text-slate-400 font-mono">/100</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary Editor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Executive Summary</label>
                <textarea
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Emergency Work Orders Editor */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Emergency Work Orders</span>
                  </h3>
                  <button
                    onClick={handleAddWorkOrder}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Order</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editWorkOrders.map((wo, wIdx) => (
                    <div key={wIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={wo.task}
                        onChange={(e) => {
                          const copy = [...editWorkOrders];
                          copy[wIdx].task = e.target.value;
                          setEditWorkOrders(copy);
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      />
                      <select
                        value={wo.agency}
                        onChange={(e) => {
                          const copy = [...editWorkOrders];
                          copy[wIdx].agency = e.target.value;
                          setEditWorkOrders(copy);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 text-xs"
                      >
                        <option value="Public Works Department (PWD Roads)">PWD Roads</option>
                        <option value="Kerala Water Authority (KWA)">Water Authority</option>
                        <option value="Kochi City Traffic Enforcement">Traffic Police</option>
                        <option value="State Electricity Board (KSEB)">Electricity Board</option>
                      </select>
                      <button
                        onClick={() => handleDeleteWorkOrder(wIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Correlation Analysis
                    </h2>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {report.title}
                  </h3>
                </div>

                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Edit Report</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {report.executive_summary}
              </p>

              {/* Correlation Nexuses */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Compound Risk Clusters</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.correlation_nexus?.map((nex: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-mono text-xs font-bold">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800">{nex.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                          {nex.criticality}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{nex.synergy_synthesis}</p>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Impact: ~{nex.affected_commuters?.toLocaleString()} commuters</span>
                        <span className="font-semibold text-slate-700">{nex.estimated_failure_window}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Work Orders Table */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Authority Action Directives</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Action Directive</th>
                        <th className="p-2.5">Assigned Agency</th>
                        <th className="p-2.5">Turnaround</th>
                        <th className="p-2.5">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.emergency_work_orders?.map((wo: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">{wo.task}</td>
                          <td className="p-2.5 text-slate-600">{wo.agency}</td>
                          <td className="p-2.5 font-mono text-amber-700 font-semibold">{wo.turnaround_time}</td>
                          <td className="p-2.5 font-mono text-rose-700 font-bold">{wo.priority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Verification Box */}
          <div
            className={`rounded-2xl p-6 border transition-all shadow-xs ${
              isVerified
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            {isVerified ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-900">
                        Directive Verified &amp; Dispatched
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Authorized by: <strong className="text-slate-800">{report.verified_by}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print View</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-emerald-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Reference</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{report.official_reference_number}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-emerald-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Transmission</span>
                    <span className="font-semibold text-emerald-700">Delivered to Agencies</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-emerald-200">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Execution</span>
                    <span className="font-semibold text-slate-800">Field Dispatch Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Staff Verification &amp; Transmission
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Confirm directives and issue official dispatch to concerning authorities.
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Staff Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Authority: <strong className="text-slate-800">{currentUser?.name || 'Municipal Officer'}</strong>
                  </div>

                  <button
                    onClick={handleVerifyAndDispatch}
                    disabled={verifying}
                    className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Directives...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Verify &amp; Transmit Directives</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Verified Printable Report Modal */}
      <VerifiedReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={report}
        verifiedBy={report?.verified_by}
        verifiedAt={report?.verified_at}
      />
    </div>
  );
};

export default AdminRiskPrediction;
