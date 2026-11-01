import React from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
  Activity,
  Check
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Complaint, RiskHotspot } from '../types';

interface DashboardProps {
  complaints: Complaint[];
  hotspots: RiskHotspot[];
  onNavigate: (page: string) => void;
  onOpenNewComplaint?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  complaints,
  hotspots,
  onNavigate
}) => {
  const pendingCount = complaints.filter((c) => c.verification_status === 'pending').length;
  const criticalCount = complaints.filter((c) => c.urgency === 'Critical').length;
  const inProgressCount = complaints.filter((c) => c.verification_status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.verification_status === 'resolved').length;
  const highRiskHotspots = hotspots.filter((h) => h.risk_score >= 80).length;

  const infrastructureIndex = complaints.length === 0
    ? '100'
    : Math.max(50, Math.round(100 - (criticalCount * 12) - ((complaints.length - resolvedCount) * 3))).toString();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              MUNICIPAL OPERATIONS
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Live Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Incoming civic reports, active repair work orders, and risk hotspots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('admin-risk-prediction')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Gen AI Risk Forecaster</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Key Metrics</span>
          </h2>
          <span className="text-xs text-slate-400">Live Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Reported Issues"
            value={complaints.length}
            subtext={`${pendingCount} pending · ${resolvedCount} resolved`}
            icon={AlertTriangle}
            accentColor="text-teal-600"
          />

          <StatCard
            label="Active Work Dispatches"
            value={inProgressCount}
            subtext={`${criticalCount} urgent priority`}
            icon={Clock}
            accentColor="text-sky-600"
          />

          <StatCard
            label="Risk Hotspots"
            value={hotspots.length}
            subtext={`${highRiskHotspots} critical`}
            icon={Flame}
            accentColor="text-rose-600"
          />

          <StatCard
            label="Infrastructure Index"
            value={`${infrastructureIndex}%`}
            subtext="City health rating"
            icon={Layers}
            accentColor="text-emerald-600"
          />
        </div>
      </div>

      {/* Two Column Layout: Geospatial Risk & Live Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Hotspots Highlight Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Geospatial Risk Clusters</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-priority incident concentrations by location
                </p>
              </div>
              <button
                onClick={() => onNavigate('risk-map')}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Full Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {hotspots.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center my-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No active risk hotspots</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All sectors are operating within standard thresholds.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {hotspots.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => onNavigate('risk-map')}
                    className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-800">{h.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          h.risk_score >= 85
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        Risk {h.risk_score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1.5">{h.primary_hazard}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{h.incident_count} issue{h.incident_count > 1 ? 's' : ''}</span>
                      <span>{h.departments?.[0] || 'Public Works'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <span>Multi-agency coordination</span>
            </span>
            <button
              onClick={() => onNavigate('risk-map')}
              className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              Open Interactive Map &rarr;
            </button>
          </div>
        </div>

        {/* Live Incoming Complaints Feed */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Recent Citizen Reports</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest verified reports from residents
                </p>
              </div>
              <button
                onClick={() => onNavigate('admin-complaints')}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {complaints.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center my-4">
                <Check className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No complaints reported</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Citizen reports will appear here when submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {complaints.slice(0, 4).map((item) => (
                  <div
                    key={item.complaint_id}
                    onClick={() => onNavigate('admin-complaints')}
                    className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {item.description}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          item.urgency === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.urgency === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{item.category || 'General'}</span>
                      <span aria-hidden="true">·</span>
                      <span className={item.verification_status === 'pending' ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                        {item.verification_status === 'pending' ? 'Pending Review' : item.verification_status === 'verified' ? 'Verified' : item.verification_status.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location_name || `${item.latitude.toFixed(2)}, ${item.longitude.toFixed(2)}`}</span>
                    </div>
                    {item.ai_analysis && (
                      <div className="mt-1.5 text-[11px] text-teal-700 font-sans flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate">{item.ai_analysis.department_assigned}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {complaints.length} total report{complaints.length === 1 ? '' : 's'} logged
            </span>
            <button
              onClick={() => onNavigate('admin-complaints')}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Manage Issues &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
