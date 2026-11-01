import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  AlertOctagon,
  ShieldAlert,
  CloudRain,
  Wrench,
  DollarSign,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Complaint, AIInvestigationReport } from '../types';
import { civicApi } from '../services/api';

interface AIInvestigationProps {
  complaints: Complaint[];
}

export const AIInvestigation: React.FC<AIInvestigationProps> = ({ complaints }) => {
  const [investigation, setInvestigation] = useState<AIInvestigationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusArea, setFocusArea] = useState('MG Road Urban Sector & Coastal Drainage');
  const [dispatchedTaskIndex, setDispatchedTaskIndex] = useState<number[]>([]);
  const [alertSent, setAlertSent] = useState(false);

  const handleRunInvestigation = async () => {
    setLoading(true);
    setAlertSent(false);
    try {
      const data = await civicApi.runAIInvestigation(focusArea);
      setInvestigation(data);
      setDispatchedTaskIndex([]);
    } catch (err) {
      console.error('Error generating AI investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchTask = (idx: number) => {
    if (!dispatchedTaskIndex.includes(idx)) {
      setDispatchedTaskIndex([...dispatchedTaskIndex, idx]);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              MUNICIPAL INVESTIGATION
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Incident Correlator</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Civic Investigation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cross-correlates citizen complaints, spatial proximity, and infrastructure dependencies.
          </p>
        </div>

        <button
          onClick={handleRunInvestigation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Incidents...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Investigation</span>
            </>
          )}
        </button>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 shrink-0">
            Focus Area:
          </span>
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="MG Road Urban Sector & Coastal Drainage">MG Road Urban Sector &amp; Coastal Drainage</option>
            <option value="Fort Kochi Promenade & Electrical Distribution">Fort Kochi Promenade &amp; Electrical Distribution</option>
            <option value="City-Wide Critical Infrastructure Audit">City-Wide Critical Infrastructure Audit</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Active Data:</span>
          <span className="text-slate-800 font-medium font-mono">{complaints.length} Citizen Reports</span>
        </div>
      </div>

      {/* Main Investigation Dossier Output */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center space-y-4 shadow-sm">
          <div className="relative w-12 h-12 mx-auto">
            <Cpu className="w-12 h-12 text-teal-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Correlating Municipal Incidents...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Analyzing spatial proximity of road damage against utility networks and drainage infrastructure.
            </p>
          </div>
        </div>
      ) : investigation ? (
        <div className="space-y-6">
          {/* Top Dossier Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="text-teal-700 font-mono font-bold">{investigation.investigation_id}</span>
                  <span aria-hidden="true">·</span>
                  <span>Engineering Briefing</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {investigation.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Compound Risk</span>
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    {investigation.compound_risk_index}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Root Cause Synthesis */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Synthesized Root Cause</span>
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {investigation.root_cause_synthesis}
                </p>
              </div>

              {/* Weather & Environmental Exacerbation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="text-xs font-bold text-sky-700 flex items-center gap-1.5 mb-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                    <span>Weather Factor</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {investigation.weather_factor_analysis}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Citizen Impact Mitigation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {investigation.citizen_impact_mitigation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Municipal Work Orders */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  <span>Recommended Work Orders</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable municipal tasks prioritized by emergency urgency
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Est. Allocation: ₹{investigation.estimated_budget_inr.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              {investigation.recommended_work_orders.map((order, idx) => {
                const isDispatched = dispatchedTaskIndex.includes(idx);
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            order.priority === 'P1'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.priority}
                        </span>
                        <span className="text-xs font-semibold text-teal-700">
                          {order.agency}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-xs text-slate-500">
                          TAT: {order.turnaround_time}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{order.task}</p>
                    </div>

                    <button
                      onClick={() => handleDispatchTask(idx)}
                      disabled={isDispatched}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isDispatched
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isDispatched ? '✓ Dispatched' : 'Dispatch Ticket'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Advisory Trigger */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Broadcast this briefing to Traffic Police and Public Works teams.
              </span>
              <button
                onClick={() => setAlertSent(true)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  alertSent
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {alertSent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Advisory Broadcasted</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-teal-600" />
                    <span>Broadcast Advisory</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
          <Cpu className="w-10 h-10 text-teal-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Automated Cross-Incident Intelligence
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Click &quot;Run Investigation&quot; to correlate active citizen reports and identify root causes across infrastructure systems.
          </p>
          <button
            onClick={handleRunInvestigation}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer shadow-sm"
          >
            Launch Investigation
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInvestigation;
