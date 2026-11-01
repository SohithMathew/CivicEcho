import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Download,
  Loader2
} from 'lucide-react';
import { Complaint, User } from '../../types';
import { generateAndDownloadComplaintReceiptPdf } from '../../services/pdfGenerator';

interface CitizenComplaintsProps {
  user: User;
  complaints: Complaint[];
  loading: boolean;
  onRefresh: () => void;
  onOpenNewComplaint: () => void;
}

export const CitizenComplaints: React.FC<CitizenComplaintsProps> = ({
  user,
  complaints,
  loading,
  onRefresh,
  onOpenNewComplaint
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const handleDownloadReceipt = (comp: Complaint) => {
    setDownloadingReceipt(true);
    try {
      generateAndDownloadComplaintReceiptPdf(comp);
    } catch (err) {
      console.error('Error generating complaint receipt PDF:', err);
    } finally {
      setTimeout(() => setDownloadingReceipt(false), 700);
    }
  };

  const myComplaints = complaints.filter(
    (c) => c.citizen_id === user.id || c.citizen_name?.toLowerCase() === user.name.toLowerCase()
  );

  const filtered = myComplaints.filter((item) => {
    const matchesStatus = filterStatus === 'All' || item.verification_status === filterStatus;
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location_name && item.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              MY TICKETS
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{user.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Issues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track repair progress, assigned departments, and status updates for your reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenNewComplaint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my reports..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['All', 'pending', 'verified', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'All'
                ? 'All Reports'
                : st === 'pending'
                ? 'Pending'
                : st === 'verified'
                ? 'Verified'
                : st === 'in_progress'
                ? 'In Progress'
                : 'Resolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: My Complaints List + Status Timeline Tracker */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {myComplaints.length === 0
              ? "You haven't submitted any complaints yet."
              : 'No complaints match the selected filter.'}
          </p>
          <button
            onClick={onOpenNewComplaint}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-xs shadow-xs hover:bg-teal-700 cursor-pointer"
          >
            Submit New Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Complaints Cards */}
          <div className="lg:col-span-7 space-y-3">
            {filtered.map((item) => {
              const isSelected = selectedComplaint?.complaint_id === item.complaint_id;
              return (
                <div
                  key={item.complaint_id}
                  onClick={() => setSelectedComplaint(item)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-teal-600 ring-1 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.description}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        item.verification_status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.verification_status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : item.verification_status === 'verified'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.verification_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    <span className="text-slate-700 font-medium">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.location_name || `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>

                  {item.ai_analysis && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-slate-700 truncate font-medium">
                          Routed to: {item.ai_analysis.department_assigned}
                        </span>
                      </div>
                      <span className="text-teal-700 font-mono text-[11px] shrink-0 font-bold">
                        Hazard {item.ai_analysis.hazard_score}/100
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Progress Tracker Panel */}
          <div className="lg:col-span-5">
            {selectedComplaint ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      #{selectedComplaint.complaint_id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(selectedComplaint)}
                      disabled={downloadingReceipt}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {downloadingReceipt ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 text-teal-600" />
                          <span>Download Receipt</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedComplaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {selectedComplaint.description}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{selectedComplaint.location_name || `${selectedComplaint.latitude.toFixed(3)}, ${selectedComplaint.longitude.toFixed(3)}`}</span>
                  </p>
                </div>

                {selectedComplaint.image_url && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40 relative">
                    <img
                      src={selectedComplaint.image_url}
                      alt="Submitted evidence"
                      className="w-full h-40 object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded font-mono">
                      Photo Evidence
                    </span>
                  </div>
                )}

                {selectedComplaint.verification_status === 'pending' && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Awaiting Verification by Concerned Authority</span>
                      <span className="text-[11px] text-amber-700">
                        Your complaint has been registered with AI preliminary triage and is in queue for official review and verification by the municipal department.
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Diagnostic Summary */}
                {selectedComplaint.ai_analysis && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>AI Geospatial Diagnostic</span>
                      </span>
                      <span className="font-mono text-teal-700 font-bold">
                        Hazard {selectedComplaint.ai_analysis.hazard_score}/100
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {selectedComplaint.ai_analysis.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {typeof selectedComplaint.ai_analysis.similar_cases_count === 'number' && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-medium">
                          📋 {selectedComplaint.ai_analysis.similar_cases_count} similar city cases
                        </span>
                      )}
                      {selectedComplaint.ai_analysis.geographical_risk_factor && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-medium">
                          📍 {selectedComplaint.ai_analysis.geographical_risk_factor}
                        </span>
                      )}
                    </div>

                    {/* 5-Factor Hazard Triage Rating Matrix */}
                    {selectedComplaint.ai_analysis.hazard_factors && (
                      <div className="bg-white p-2 rounded border border-slate-200 space-y-1.5 mt-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-700 uppercase tracking-wider">
                            5-Factor Triage Matrix
                          </span>
                          <span className="font-bold text-teal-700">
                            {selectedComplaint.ai_analysis.hazard_factors.score_level} Hazard
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Image</span>
                            <span className="font-semibold text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.image_evidence_rating}</span>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Desc</span>
                            <span className="font-semibold text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.description_severity_rating}</span>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Area</span>
                            <span className="font-semibold text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.area_criticality_rating}</span>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Geo</span>
                            <span className="font-semibold text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.geographical_location_rating}</span>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Nearby</span>
                            <span className="font-semibold text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.nearby_similar_cases_rating}</span>
                          </div>
                        </div>
                        {selectedComplaint.ai_analysis.hazard_factors.justification && (
                          <p className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                            <strong>Assessment:</strong> {selectedComplaint.ai_analysis.hazard_factors.justification}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Tracker */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Repair Progress Tracker
                  </h5>

                  <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {/* Step 1: Submitted */}
                    <div className="relative">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 absolute -left-6 top-0.5 flex items-center justify-center text-white text-[10px] font-bold">
                        ✓
                      </span>
                      <p className="text-xs font-semibold text-slate-800">Report Submitted</p>
                      <p className="text-[11px] text-slate-500">Incident and photo recorded</p>
                    </div>

                    {/* Step 2: Authority Verification */}
                    <div className="relative">
                      <span
                        className={`w-4 h-4 rounded-full absolute -left-6 top-0.5 flex items-center justify-center text-[10px] font-bold ${
                          selectedComplaint.verification_status !== 'pending'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}
                      >
                        {selectedComplaint.verification_status !== 'pending' ? '✓' : '2'}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">Authority Verification</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedComplaint.verification_status !== 'pending'
                          ? `Verified by municipal authority · Routed to ${selectedComplaint.ai_analysis?.department_assigned || 'Department'}`
                          : 'Awaiting verification by concerned municipal authority'}
                      </p>
                    </div>

                    {/* Step 3: Crew Dispatched */}
                    <div className="relative">
                      <span
                        className={`w-4 h-4 rounded-full absolute -left-6 top-0.5 flex items-center justify-center text-[10px] font-bold ${
                          selectedComplaint.verification_status === 'in_progress' || selectedComplaint.verification_status === 'resolved'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {selectedComplaint.verification_status === 'resolved' ? '✓' : '3'}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">Field Crew Action</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedComplaint.verification_status === 'in_progress'
                          ? 'Crew dispatched on-site'
                          : selectedComplaint.verification_status === 'resolved'
                          ? 'Repairs executed on site'
                          : 'Awaiting crew scheduling'}
                      </p>
                    </div>

                    {/* Step 4: Resolved */}
                    <div className="relative">
                      <span
                        className={`w-4 h-4 rounded-full absolute -left-6 top-0.5 flex items-center justify-center text-[10px] font-bold ${
                          selectedComplaint.verification_status === 'resolved'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {selectedComplaint.verification_status === 'resolved' ? '✓' : '4'}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">Issue Resolved</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedComplaint.verification_status === 'resolved'
                          ? 'Repairs verified and signed off'
                          : 'Pending completion'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Summary Notes */}
                {selectedComplaint.ai_analysis && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-teal-800 block">Assessment Notes</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {selectedComplaint.ai_analysis.summary}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 sticky top-20 shadow-xs">
                <ChevronRight className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select any report to track real-time repair progress.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenComplaints;
