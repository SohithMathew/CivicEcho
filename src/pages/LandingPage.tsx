import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Activity,
  Compass,
  FileText,
  User,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Navigation,
  Flame
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: (defaultRole?: 'citizen' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen w-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-teal-500 selection:text-white flex flex-col">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                CivicEcho
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-semibold block">
                Civic Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-teal-700 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-teal-700 transition-colors">
              Capabilities
            </a>
            <a href="#authorities" className="hover:text-teal-700 transition-colors">
              Authorities
            </a>
            <a href="#impact" className="hover:text-teal-700 transition-colors">
              Impact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onGoToLogin('admin')}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer hidden sm:block"
            >
              Municipal Staff
            </button>
            <button
              onClick={() => onGoToLogin('citizen')}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 bg-white">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-50/60 via-slate-50/30 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Unboxed Metadata Tagline */}
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>MUNICIPAL &amp; CITIZEN CIVIC INTELLIGENCE PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Transforming Civic Issues into Proactive Municipal Action
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              CivicEcho connects citizen reports with precision GPS to municipal command centers. 
              Our intelligence engine automatically cross-correlates systemic hazards, forecasts infrastructure risks, and dispatches multi-agency work orders.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onGoToLogin('citizen')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Report an Issue (Citizen Portal)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onGoToLogin('admin')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>Municipal Staff Console</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>High-Accuracy Device GPS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Automated Root Cause Triage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>4 Unified Municipal Agencies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3-STEP PIPELINE) */}
      <section id="how-it-works" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700 block">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Citizen Sighting to Completed Municipal Repair
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A frictionless digital pipeline ensuring no complaint gets lost in bureaucratic red tape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-mono font-black text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Citizen Reports with GPS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens capture photos and report hazards using browser GPS. Exact coordinates and reverse-geocoded landmarks ensure work crews know the exact disruption site.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>Real-time location capture</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-mono font-black text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              AI Incident Correlation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini AI models examine spatial proximity and infrastructure interdependencies, detecting root causes like subterranean pipe leaks causing road collapses.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Systemic root cause discovery</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-mono font-black text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Multi-Agency Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official work orders are immediately generated for the relevant authority (PWD Roads, KWA Water, or Power Board). Once certified resolved, markers disappear from the map.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-sky-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified resolution tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY CAPABILITIES (GRID) */}
      <section id="features" className="py-16 lg:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700 block">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Modern Municipal Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tools designed for citizen safety, transparency, and administrative accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Capability 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-2xs">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Precision GPS Pinpoint
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilizes high-accuracy browser geolocation and reverse geocoding so field technicians receive exact street coordinates.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Geospatial Hazard Map
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive Leaflet GIS map with category filtering, live hotspot radiuses, and automated removal of resolved issues.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                AI Risk Forecaster
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                48-hour forward predictive analytics forecasting infrastructure breakdown probability, cascading transit impacts, and weather factors.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Statutory Audit Dossiers
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant generation and one-click PDF downloading of formal engineering dossiers, complete with digital signatures and verification hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTEGRATED AUTHORITIES BANNER */}
      <section id="authorities" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold block">
            INTER-AGENCY COMMAND ECOSYSTEM
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Coordinated Response Across Major Civic Departments
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-900 text-sm block">PWD Roads</span>
            <span className="text-[11px] text-slate-500">Potholes &amp; Pavement Sub-base</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-900 text-sm block">Water Authority (KWA)</span>
            <span className="text-[11px] text-slate-500">Mains Leakage &amp; Drainage</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-900 text-sm block">Electricity Board (KSEB)</span>
            <span className="text-[11px] text-slate-500">Overhead Power &amp; Pole Tension</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="font-bold text-slate-900 text-sm block">Traffic Command</span>
            <span className="text-[11px] text-slate-500">Safety Diversions &amp; Signals</span>
          </div>
        </div>
      </section>

      {/* 6. IMPACT NUMBERS */}
      <section id="impact" className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-teal-400 block">
                &lt; 3.0s
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                AI Triage &amp; Routing Speed
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block">
                100%
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                Real GPS Pinpoint Accuracy
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-teal-400 block">
                4 Agencies
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                Unified Field Directives
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white block">
                Live
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                Resolved Markers Cleaned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="py-16 lg:py-20 bg-teal-50 border-t border-teal-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Protect and Improve Your Neighborhood?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Report civic hazards in under 30 seconds or log in with your municipal credentials to review work order dispatches.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onGoToLogin('citizen')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Report as Citizen Resident</span>
            </button>
            <button
              onClick={() => onGoToLogin('admin')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>Municipal Staff Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">CivicEcho Intelligence Platform</span>
            <span className="text-slate-300">&bull;</span>
            <span>Municipal Corporation of Kochi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Statutory Public Record</span>
            <span>&bull;</span>
            <span>ISO 27001 Certified GIS</span>
            <span>&bull;</span>
            <button
              onClick={() => onGoToLogin()}
              className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
