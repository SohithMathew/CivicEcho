import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Flame,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles,
  Navigation
} from 'lucide-react';
import { Complaint, RiskHotspot, User } from '../types';
import { civicApi } from '../services/api';
import { detectRealLocation } from '../services/locationService';

interface RiskMapProps {
  complaints: Complaint[];
  hotspots: RiskHotspot[];
  currentUser?: User;
  onUpdateComplaint?: (updated: Complaint) => void;
  onOpenNewComplaintWithCoords?: (lat: number, lng: number) => void;
}

type MapTheme = 'streets' | 'satellite' | 'dark';

const MAP_THEMES: Record<MapTheme, { name: string; url: string; attribution: string; maxZoom: number; overlayUrl?: string }> = {
  streets: {
    name: 'Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, USGS, NPS',
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  dark: {
    name: 'Dark GIS',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  }
};

export const RiskMap: React.FC<RiskMapProps> = ({
  complaints,
  hotspots,
  currentUser,
  onUpdateComplaint,
  onOpenNewComplaintWithCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  const [activeTheme, setActiveTheme] = useState<MapTheme>('streets');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [selectedIncident, setSelectedIncident] = useState<Complaint | null>(null);
  const [showHotspotRadii, setShowHotspotRadii] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);

  const locateUser = async (shouldFly: boolean = true) => {
    if (!mapInstanceRef.current) return;
    setLocatingUser(true);
    try {
      const loc = await detectRealLocation();
      setUserLocationName(loc.locationName);

      if (userLocationMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
      }

      const pulseIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(2, 132, 199, 0.3); border-radius: 50%;"></div>
            <div style="position: absolute; width: 14px; height: 14px; background: #0284c7; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: pulseIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 4px; font-family: sans-serif; font-size: 11px;">
            <strong style="color: #0284c7;">Your Current Location</strong><br/>
            <span>${loc.locationName}</span><br/>
            <span style="color: #64748b; font-size: 10px;">GPS: ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}</span>
          </div>
        `);
      userLocationMarkerRef.current = marker;

      if (shouldFly) {
        mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 15, { duration: 1.2 });
      }
    } catch (err) {
      console.warn('Real GPS detection on map:', err);
    } finally {
      setLocatingUser(false);
    }
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.9725, 76.2800],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer: Clean street map for light theme
    const initialTheme = MAP_THEMES.streets;
    const baseLayer = L.tileLayer(initialTheme.url, {
      attribution: initialTheme.attribution,
      maxZoom: initialTheme.maxZoom,
    }).addTo(map);
    baseTileLayerRef.current = baseLayer;

    const markersGroup = L.layerGroup().addTo(map);
    const hotspotsGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    hotspotsLayerRef.current = hotspotsGroup;
    mapInstanceRef.current = map;

    // Detect user's current GPS location on map mount
    locateUser(true);

    // Click on map to add report if citizen
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onOpenNewComplaintWithCoords && currentUser?.role !== 'admin') {
        onOpenNewComplaintWithCoords(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Theme Switch
  const switchTheme = (theme: MapTheme) => {
    if (!mapInstanceRef.current) return;
    setActiveTheme(theme);

    if (baseTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    }
    if (overlayTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    const config = MAP_THEMES[theme];
    const newBase = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(mapInstanceRef.current);
    baseTileLayerRef.current = newBase;

    if (config.overlayUrl) {
      const newOverlay = L.tileLayer(config.overlayUrl, {
        maxZoom: config.maxZoom,
      }).addTo(mapInstanceRef.current);
      overlayTileLayerRef.current = newOverlay;
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await civicApi.updateComplaintStatus(
        complaintId,
        newStatus,
        resolutionNotes.trim() || undefined
      );
      if (onUpdateComplaint) {
        onUpdateComplaint(updated);
      }
      setSelectedIncident(updated);
      setResolutionNotes('');
      setStatusSuccessMsg(
        newStatus === 'resolved'
          ? '✓ Issue resolved and cleared from map.'
          : `Status updated to ${newStatus.replace('_', ' ')}`
      );
      setTimeout(() => setStatusSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update status on map:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update Markers and Hotspots when data or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !hotspotsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    hotspotsLayerRef.current.clearLayers();

    // 1. Render Active Hotspot Radii (Exclude remediated/resolved clusters)
    if (showHotspotRadii) {
      hotspots
        .filter((h) => h.risk_level !== 'Remediated')
        .forEach((h) => {
          const circleColor = h.risk_score >= 85 ? '#e11d48' : '#d97706';
          const circle = L.circle([h.center.lat, h.center.lng], {
            radius: 400,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.14,
            weight: 2,
            dashArray: '4, 6',
          });

          circle.bindTooltip(
            `<strong>${h.name}</strong><br/>Risk Score: ${h.risk_score}/100`,
            { className: 'leaflet-tooltip-light' }
          );

          hotspotsLayerRef.current?.addLayer(circle);
        });
    }

    // 2. Render Complaint Markers: RESOLVED ISSUES ARE EXCLUDED FROM THE MAP
    const filtered = complaints.filter((c) => {
      // Remove marks from geo map if issue is resolved
      if (c.verification_status === 'resolved') {
        return false;
      }

      const matchesCategory =
        activeCategory === 'All' || c.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesStatus =
        activeStatus === 'All' || c.verification_status.toLowerCase() === activeStatus.toLowerCase();
      return matchesCategory && matchesStatus;
    });

    filtered.forEach((c) => {
      const isInProgress = c.verification_status === 'in_progress';
      const isVerified = c.verification_status === 'verified';

      const color = isInProgress
        ? '#0284c7' // Sky blue
        : isVerified
        ? '#4f46e5' // Indigo
        : c.urgency === 'Critical'
        ? '#e11d48' // Red / Rose
        : c.urgency === 'High'
        ? '#d97706' // Amber
        : '#0d9488'; // Teal

      const symbolHtml = isInProgress
        ? '<span style="color: white; font-size: 11px; font-weight: bold; line-height: 1;">⚙</span>'
        : isVerified
        ? '<span style="color: white; font-size: 10px; font-weight: bold; line-height: 1;">🛡</span>'
        : '<div style="width: 7px; height: 7px; background: white; border-radius: 50%;"></div>';

      const iconHtml = `
        <div style="
          background-color: ${color};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          ${symbolHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedIncident(c);
      });

      const statusBadgeHtml = isInProgress
        ? '<span style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">IN PROGRESS</span>'
        : isVerified
        ? '<span style="background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">VERIFIED</span>'
        : '<span style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">PENDING</span>';

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; min-width: 200px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">
              ${c.category}
            </div>
            ${statusBadgeHtml}
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin: 4px 0; line-height: 1.3;">
            ${c.description}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${c.location_name || `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [complaints, hotspots, activeCategory, activeStatus, showHotspotRadii]);

  const flyToCoord = (lat: number, lng: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], 15, { duration: 1.0 });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-100">
      {/* Top Floating Filter Bar */}
      <div className="absolute top-4 left-6 right-6 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer Filters & Basemap Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl pointer-events-auto shadow-md">
          {/* Basemap switcher */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
            {(['streets', 'satellite', 'dark'] as MapTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => switchTheme(theme)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTheme === theme
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {MAP_THEMES[theme].name}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Category:</span>
          </span>
          {['All', 'Road Damage', 'Water Supply', 'Electrical & Power', 'Sanitation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Status Filter (Excludes resolved since resolved issues are removed from map) */}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Status:
          </span>
          {[
            { id: 'All', label: 'All Active' },
            { id: 'pending', label: 'Pending' },
            { id: 'verified', label: 'Verified' },
            { id: 'in_progress', label: 'In Progress' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeStatus === st.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={() => setShowHotspotRadii(!showHotspotRadii)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              showHotspotRadii
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Risk Radii</span>
          </button>
        </div>

        {/* Quick Focus Navigators & My Location */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl pointer-events-auto shadow-md text-xs">
          <button
            onClick={() => locateUser(true)}
            disabled={locatingUser}
            className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-sky-200"
            title="Center map on your current GPS location"
          >
            {locatingUser ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span>{locatingUser ? 'Locating...' : 'My Location'}</span>
          </button>

          <span className="text-[11px] font-semibold text-slate-400 px-1 flex items-center gap-1 border-l border-slate-200 pl-2">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Focus:</span>
          </span>
          <button
            onClick={() => flyToCoord(9.9725, 76.2800)}
            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
          >
            MG Road
          </button>
          <button
            onClick={() => flyToCoord(9.9782, 76.2845)}
            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
          >
            Park Avenue
          </button>
          <button
            onClick={() => flyToCoord(9.9678, 76.2420)}
            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer text-[11px]"
          >
            Fort Kochi
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay at Bottom Left */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-xl shadow-lg pointer-events-auto text-xs space-y-2 max-w-xs">
        <div className="font-bold text-slate-800 flex items-center justify-between">
          <span>Active Issues Map</span>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            Live
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-600 flex items-center justify-center text-[8px] text-white font-bold">
              ⚙
            </span>
            <span>In Progress (Work Crew Dispatched)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">
              🛡
            </span>
            <span>Verified (Engineering Confirmed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Critical Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Standard Civic Maintenance</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500 italic">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Resolved issues are cleared from the map.</span>
          </div>
        </div>
      </div>

      {/* Selected Incident Drawer at Bottom Right */}
      {selectedIncident && (
        <div className="absolute bottom-6 right-6 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-xl max-w-md w-full pointer-events-auto space-y-3 max-h-[85vh] overflow-y-auto">
          {/* Status Success Alert */}
          {statusSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusSuccessMsg}</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="text-teal-700 font-semibold">{selectedIncident.category}</span>
                <span aria-hidden="true">&bull;</span>
                <span className="font-mono text-slate-600">{selectedIncident.latitude.toFixed(3)}, {selectedIncident.longitude.toFixed(3)}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {selectedIncident.description}
              </h4>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Evidence photo thumbnail if available */}
          {selectedIncident.image_url && (
            <div className="rounded-lg overflow-hidden border border-slate-200 max-h-36 relative">
              <img
                src={selectedIncident.image_url}
                alt="Incident photo"
                className="w-full h-36 object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded font-mono">
                Field Photo
              </span>
            </div>
          )}

          {/* Current Status Banner */}
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              selectedIncident.verification_status === 'resolved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : selectedIncident.verification_status === 'in_progress'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : selectedIncident.verification_status === 'verified'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedIncident.verification_status === 'resolved' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : selectedIncident.verification_status === 'in_progress' ? (
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
              ) : selectedIncident.verification_status === 'verified' ? (
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-bold uppercase tracking-wider text-[11px]">
                {selectedIncident.verification_status === 'resolved'
                  ? 'Resolved (Cleared from map)'
                  : selectedIncident.verification_status === 'in_progress'
                  ? 'In Progress (Crew On-Site)'
                  : selectedIncident.verification_status === 'verified'
                  ? 'Engineering Verified'
                  : 'Pending Action'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              #{selectedIncident.complaint_id.slice(0, 8)}
            </span>
          </div>

          {selectedIncident.ai_analysis && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-teal-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>{selectedIncident.ai_analysis.department_assigned}</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Hazard {selectedIncident.ai_analysis.hazard_score}/100
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedIncident.ai_analysis.summary}
              </p>
            </div>
          )}

          {/* MUNICIPAL STAFF STATUS UPDATER (When Staff is logged in) */}
          {currentUser?.role === 'admin' && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Update Issue Status
                </span>
                <span className="text-[10px] text-slate-400">Resolving clears marker from map</span>
              </div>

              <input
                type="text"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Optional resolution note..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {/* 1. Pending */}
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.complaint_id, 'pending')}
                  disabled={updatingStatus}
                  className={`px-1 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer text-center ${
                    selectedIncident.verification_status === 'pending'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Pending</span>
                </button>

                {/* 2. Verified */}
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.complaint_id, 'verified')}
                  disabled={updatingStatus}
                  className={`px-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    selectedIncident.verification_status === 'verified'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  <span>Verified</span>
                </button>

                {/* 3. In Progress */}
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.complaint_id, 'in_progress')}
                  disabled={updatingStatus}
                  className={`px-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    selectedIncident.verification_status === 'in_progress'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                  }`}
                >
                  <span>In Progress</span>
                </button>

                {/* 4. Resolved (Removes issue from map) */}
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.complaint_id, 'resolved')}
                  disabled={updatingStatus}
                  className={`px-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    selectedIncident.verification_status === 'resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                  title="Mark as resolved (removes marker from map)"
                >
                  {updatingStatus ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  <span>Resolved</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
            <span className="text-slate-500">
              Reported: <strong className="text-slate-700">{new Date(selectedIncident.created_at).toLocaleDateString()}</strong>
            </span>
            <button
              onClick={() => flyToCoord(selectedIncident.latitude, selectedIncident.longitude)}
              className="text-teal-700 hover:text-teal-800 font-semibold cursor-pointer text-xs"
            >
              Center on Pin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMap;
