import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles,
  CloudRain,
  Route,
  ShieldCheck,
  Navigation,
  Loader2
} from 'lucide-react';
import { Complaint, User, AreaRiskPrediction } from '../../types';
import { civicApi } from '../../services/api';
import { detectRealLocation } from '../../services/locationService';

interface CitizenDashboardProps {
  user: User;
  complaints: Complaint[];
  onOpenNewComplaint: () => void;
  onNavigate: (page: string) => void;
}

const NEIGHBORHOOD_PRESETS = [
  { name: 'MG Road / Central Ernakulam', lat: 9.9725, lng: 76.2800 },
  { name: 'Park Avenue & Sub-Station Zone', lat: 9.9782, lng: 76.2845 },
  { name: 'South Overbridge Corridor', lat: 9.9650, lng: 76.2730 },
  { name: 'Fort Kochi Marine Walkway', lat: 9.9678, lng: 76.2420 }
];

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  complaints,
  onOpenNewComplaint,
  onNavigate
}) => {
  const [selectedArea, setSelectedArea] = useState(user.neighborhood || NEIGHBORHOOD_PRESETS[0].name);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [prediction, setPrediction] = useState<AreaRiskPrediction | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const myComplaints = complaints.filter(
    (c) => c.citizen_id === user.id || c.citizen_name?.toLowerCase() === user.name.toLowerCase()
  );

  const handleDetectCurrentGps = async () => {
    setDetectingGps(true);
    try {
      const loc = await detectRealLocation();
      setSelectedArea(loc.locationName);
      setCurrentCoords({ lat: loc.latitude, lng: loc.longitude });
      await fetchAreaRiskWithCoords(loc.locationName, loc.latitude, loc.longitude);
    } catch (err) {
      console.warn('GPS detection failed on citizen dashboard:', err);
    } finally {
      setDetectingGps(false);
    }
  };

  const fetchAreaRiskWithCoords = async (areaName: string, lat: number, lng: number) => {
    setLoadingPrediction(true);
    try {
      const data = await civicApi.getAreaRiskPrediction({
        area_name: areaName,
        latitude: lat,
        longitude: lng
      });
      setPrediction(data);
    } catch (err) {
      console.error('Error fetching area risk prediction:', err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const fetchAreaRisk = async (areaName: string) => {
    setLoadingPrediction(true);
    const preset = NEIGHBORHOOD_PRESETS.find(p => p.name === areaName) || NEIGHBORHOOD_PRESETS[0];
    const lat = currentCoords ? currentCoords.lat : preset.lat;
    const lng = currentCoords ? currentCoords.lng : preset.lng;
    try {
      const data = await civicApi.getAreaRiskPrediction({
        area_name: areaName,
        latitude: lat,
        longitude: lng
      });
      setPrediction(data);
    } catch (err) {
      console.error('Error fetching area risk prediction:', err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (!currentCoords) {
      fetchAreaRisk(selectedArea);
    }
  }, [selectedArea]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                CITIZEN PORTAL
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{user.neighborhood || 'Resident'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Report neighborhood issues, follow repair progress, and check local safety alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('citizen-complaints')}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              My Complaints ({myComplaints.length})
            </button>
            <button
              onClick={onOpenNewComplaint}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {myComplaints.filter((c) => c.verification_status === 'pending').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Verified by Eng.</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">
              {myComplaints.filter((c) => c.verification_status === 'verified').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Crew Dispatched</p>
            <h3 className="text-2xl font-bold text-sky-600 mt-1">
              {myComplaints.filter((c) => c.verification_status === 'in_progress').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-medium">Resolved</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {myComplaints.filter((c) => c.verification_status === 'resolved').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Local Area Risk Radar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">
                Neighborhood Risk Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Local hazard estimation based on civic reports and weather conditions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium shrink-0">Zone:</span>
            <select
              value={selectedArea}
              onChange={(e) => {
                setCurrentCoords(null);
                setSelectedArea(e.target.value);
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs max-w-[220px] truncate"
            >
              {currentCoords && (
                <option value={selectedArea}>
                  📍 Current GPS: {selectedArea}
                </option>
              )}
              {NEIGHBORHOOD_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleDetectCurrentGps}
              disabled={detectingGps}
              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
              title="Detect your real GPS location"
            >
              {detectingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
              )}
              <span>{detectingGps ? 'Locating...' : 'Detect GPS'}</span>
            </button>
          </div>
        </div>

        {loadingPrediction ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Calculating neighborhood hazard forecast...
          </div>
        ) : prediction ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                    Risk Score
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-slate-900 font-mono">
                      {prediction.predicted_risk_score}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ml-auto ${
                        prediction.risk_level === 'High' || prediction.risk_level === 'Severe'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {prediction.risk_level} Risk
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Nearby Reports:</span>
                    <span className="text-slate-800 font-semibold">{prediction.nearby_incidents_count} active</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-4 h-4 text-teal-600" />
                    <span>Resident Advisory</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {prediction.resident_advisory}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1 font-semibold uppercase">
                      <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                      <span>Weather Impact</span>
                    </span>
                    <p className="text-xs text-slate-600 leading-snug">{prediction.weather_influence}</p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1 font-semibold uppercase">
                      <Route className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Suggested Routes</span>
                    </span>
                    <div className="text-xs text-slate-600 space-y-0.5">
                      {prediction.safe_alternative_routes?.map((route, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{route}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Hazards in {prediction.area_name}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {prediction.key_hazards?.map((hazard, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 leading-snug">{hazard}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Recent Submitted Complaints */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>My Reported Issues</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current repair status from municipal field teams
            </p>
          </div>

          <button
            onClick={() => onNavigate('citizen-complaints')}
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myComplaints.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-slate-500">You haven&apos;t submitted any civic reports yet.</p>
            <button
              onClick={onOpenNewComplaint}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-xs cursor-pointer shadow-xs hover:bg-teal-700"
            >
              Report First Issue
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myComplaints.slice(0, 3).map((item) => (
              <div
                key={item.complaint_id}
                onClick={() => onNavigate('citizen-complaints')}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">{item.description}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold capitalize ${
                        item.verification_status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.verification_status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.verification_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.location_name || `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-teal-700 font-semibold">Track &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
