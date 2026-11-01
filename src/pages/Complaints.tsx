import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronRight,
  Plus,
  RefreshCw,
  Check
} from 'lucide-react';
import { Complaint } from '../types';
import { civicApi } from '../services/api';

interface ComplaintsProps {
  complaints: Complaint[];
  loading: boolean;
  onRefresh: () => void;
  onOpenNewComplaint: () => void;
  onUpdateComplaint: (updated: Complaint) => void;
}

export const Complaints: React.FC<ComplaintsProps> = ({
  complaints,
  loading,
  onRefresh,
  onOpenNewComplaint,
  onUpdateComplaint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const categories = [
    'All',
    'Road Damage',
    'Water Supply',
    'Electrical & Power',
    'Sanitation',
    'Public Safety'
  ];

  const statuses = ['All', 'pending', 'verified', 'in_progress', 'resolved'];

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location_name && item.location_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'All' ||
      item.verification_status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId);
    try {
      const updated = await civicApi.updateComplaintStatus(complaintId, newStatus);
      onUpdateComplaint(updated);
      if (selectedComplaint?.complaint_id === complaintId) {
        setSelectedComplaint(updated);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reported Civic Issues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, inspect, and update reported community civic issues.
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
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by keyword, category, landmark..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st === 'All'
                  ? 'All Status'
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

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-2 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Loading civic issues...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">No complaints found</h3>
          <p className="text-xs text-slate-500 mb-4">
            {complaints.length === 0
              ? 'No civic issues have been reported yet.'
              : 'No citizen reports match the selected filters.'}
          </p>
          <button
            onClick={onOpenNewComplaint}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-xs cursor-pointer hover:bg-teal-700 transition-colors shadow-xs"
          >
            Submit First Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Complaints Feed List */}
          <div className="lg:col-span-7 space-y-3">
            {filteredComplaints.map((item) => {
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
                        item.urgency === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.urgency === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    <span className="text-slate-700 font-medium">{item.category || 'General'}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>
                      {item.verification_status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </span>
                      ) : item.verification_status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          <span>In Progress</span>
                        </span>
                      ) : item.verification_status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <span>Pending</span>
                        </span>
                      )}
                    </span>
                    {item.location_name && (
                      <>
                        <span aria-hidden="true">&bull;</span>
                        <span className="text-slate-500 text-[11px]">{item.location_name}</span>
                      </>
                    )}
                  </div>

                  {/* AI Analysis Summary Snippet */}
                  {item.ai_analysis && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-slate-700 truncate font-medium">
                          {item.ai_analysis.affected_infrastructure}
                        </span>
                      </div>
                      <span className="font-mono text-teal-700 font-bold shrink-0 ml-2">
                        Hazard {item.ai_analysis.hazard_score}/100
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Complaint Detail & Workflow Actions Panel */}
          <div className="lg:col-span-5">
            {selectedComplaint ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      #{selectedComplaint.complaint_id.slice(0, 8)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded capitalize font-semibold ${
                        selectedComplaint.verification_status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedComplaint.verification_status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : selectedComplaint.verification_status === 'verified'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedComplaint.verification_status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedComplaint.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {selectedComplaint.description}
                  </h4>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        {selectedComplaint.location_name || 'Location'}: {selectedComplaint.latitude.toFixed(3)},{' '}
                        {selectedComplaint.longitude.toFixed(3)}
                      </span>
                    </div>
                    {selectedComplaint.citizen_name && (
                      <div>
                        Reported by: <span className="text-slate-700 font-medium">{selectedComplaint.citizen_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedComplaint.image_url && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48 relative">
                    <img
                      src={selectedComplaint.image_url}
                      alt="Complaint attachment"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                      Field Photo
                    </div>
                  </div>
                )}

                {/* AI Multi-Modal Triage Card */}
                {selectedComplaint.ai_analysis && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>AI Diagnostic &amp; Geospatial Triage</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Confidence {(selectedComplaint.ai_analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {selectedComplaint.ai_analysis.image_corroborated === false ? (
                      <div className="text-[11px] p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
                        ⚠️ Visual check: Uploaded image does not corroborate reported damage.
                      </div>
                    ) : (
                      <div className="text-[11px] p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                        ✓ Multi-modal visual evidence verified with reported disruption.
                      </div>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedComplaint.ai_analysis.summary}
                    </p>

                    {/* Spatial and Historical Context Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {typeof selectedComplaint.ai_analysis.similar_cases_count === 'number' && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                          📋 {selectedComplaint.ai_analysis.similar_cases_count} similar city cases
                        </span>
                      )}
                      {selectedComplaint.ai_analysis.geographical_risk_factor && (
                        <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-semibold">
                          📍 {selectedComplaint.ai_analysis.geographical_risk_factor}
                        </span>
                      )}
                      {selectedComplaint.ai_analysis.compound_risk_level && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold">
                          ⚠️ {selectedComplaint.ai_analysis.compound_risk_level}
                        </span>
                      )}
                    </div>

                    {/* 5-Factor Hazard Triage Breakdown */}
                    {selectedComplaint.ai_analysis.hazard_factors && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold uppercase tracking-wider text-slate-600">
                            5-Factor Hazard Evaluation
                          </span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            selectedComplaint.ai_analysis.hazard_factors.score_level === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : selectedComplaint.ai_analysis.hazard_factors.score_level === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedComplaint.ai_analysis.hazard_factors.score_level === 'Moderate'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {selectedComplaint.ai_analysis.hazard_factors.score_level} Hazard
                          </span>
                        </div>

                        <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Image</span>
                            <strong className="text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.image_evidence_rating}</strong>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Desc</span>
                            <strong className="text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.description_severity_rating}</strong>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Area</span>
                            <strong className="text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.area_criticality_rating}</strong>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Geo</span>
                            <strong className="text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.geographical_location_rating}</strong>
                          </div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px]">Nearby</span>
                            <strong className="text-slate-800">{selectedComplaint.ai_analysis.hazard_factors.nearby_similar_cases_rating}</strong>
                          </div>
                        </div>

                        {selectedComplaint.ai_analysis.hazard_factors.justification && (
                          <p className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight">
                            <strong>Rationale:</strong> {selectedComplaint.ai_analysis.hazard_factors.justification}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Nearby Correlated Incidents */}
                    {Array.isArray(selectedComplaint.ai_analysis.nearby_correlations) && selectedComplaint.ai_analysis.nearby_correlations.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Nearby Correlated Incidents:
                        </span>
                        {selectedComplaint.ai_analysis.nearby_correlations.slice(0, 3).map((item, i) => (
                          <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>
                              <strong className="text-slate-800">{item.distance_km}km away [{item.category}]:</strong> {item.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs pt-2 border-t border-slate-200 text-slate-600 space-y-1">
                      <div>
                        Assigned: <strong className="text-slate-800">{selectedComplaint.ai_analysis.department_assigned}</strong>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedComplaint.ai_analysis.hazard_tags?.map((tag, i) => (
                          <span key={i} className="text-[11px] text-slate-500">
                            #{tag}{i < selectedComplaint.ai_analysis!.hazard_tags.length - 1 ? ' · ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Municipal Authority Verification Workflow */}
                {selectedComplaint.verification_status === 'pending' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Pending Authority Verification</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      This report was submitted by a citizen with AI preliminary triage and requires official verification by your municipal engineering authority before scheduling work crews.
                    </p>
                    <button
                      onClick={() => handleStatusChange(selectedComplaint.complaint_id, 'verified')}
                      disabled={updatingId === selectedComplaint.complaint_id}
                      className="w-full mt-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Verify Complaint</span>
                    </button>
                  </div>
                )}

                {/* Status Controls */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                    Update Workflow Status
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Pending */}
                    <button
                      onClick={() => handleStatusChange(selectedComplaint.complaint_id, 'pending')}
                      disabled={updatingId === selectedComplaint.complaint_id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedComplaint.verification_status === 'pending'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span>Pending</span>
                    </button>

                    {/* 2. Verified */}
                    <button
                      onClick={() => handleStatusChange(selectedComplaint.complaint_id, 'verified')}
                      disabled={updatingId === selectedComplaint.complaint_id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedComplaint.verification_status === 'verified'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <span>Verified</span>
                    </button>

                    {/* 3. In Progress */}
                    <button
                      onClick={() => handleStatusChange(selectedComplaint.complaint_id, 'in_progress')}
                      disabled={updatingId === selectedComplaint.complaint_id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedComplaint.verification_status === 'in_progress'
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                      }`}
                    >
                      <span>In Progress</span>
                    </button>

                    {/* 4. Resolved */}
                    <button
                      onClick={() => handleStatusChange(selectedComplaint.complaint_id, 'resolved')}
                      disabled={updatingId === selectedComplaint.complaint_id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedComplaint.verification_status === 'resolved'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span>✓ Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 sticky top-20 shadow-xs">
                <ChevronRight className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Select any complaint to review details and update status.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
