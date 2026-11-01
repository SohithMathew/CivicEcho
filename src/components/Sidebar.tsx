import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  FileBarChart2,
  Shield,
  Sparkles,
  Clock,
  Radio,
  ArrowRightLeft
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentUser: UserType | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAuthModal?: () => void;
  myComplaintCount?: number;
  totalComplaintCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentPage,
  onNavigate,
  onOpenAuthModal,
  myComplaintCount = 0,
  totalComplaintCount = 0,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Role-specific navigation items
  const citizenNavItems = [
    {
      id: 'citizen-dashboard',
      label: 'Neighborhood Safety',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'citizen-complaints',
      label: 'My Reported Issues',
      icon: Clock,
      badge: myComplaintCount > 0 ? myComplaintCount : null,
    },
    {
      id: 'risk-map',
      label: 'Local Issue Map',
      icon: MapPin,
      badge: null,
    },
  ];

  const adminNavItems = [
    {
      id: 'admin-dashboard',
      label: 'City Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'admin-complaints',
      label: 'All Civic Issues',
      icon: AlertTriangle,
      badge: totalComplaintCount > 0 ? totalComplaintCount : null,
    },
    {
      id: 'admin-risk-prediction',
      label: 'Gen AI Risk Forecaster',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'risk-map',
      label: 'City Geospatial Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Municipal Reports Audit',
      icon: FileBarChart2,
      badge: null,
    },
  ];

  const navItems = isAdmin ? adminNavItems : citizenNavItems;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      <div>
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center border-b border-slate-200 gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-xs ${
              isAdmin
                ? 'bg-purple-600 text-white'
                : 'bg-teal-600 text-white'
            }`}
          >
            {isAdmin ? <Shield className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-sm leading-none flex items-center gap-1.5">
              <span>CivicEcho</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  isAdmin
                    ? 'text-purple-700 bg-purple-50 border-purple-200'
                    : 'text-teal-700 bg-teal-50 border-teal-200'
                }`}
              >
                {isAdmin ? 'STAFF' : 'CITIZEN'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">
              {isAdmin ? 'Municipal Dashboard' : 'Citizen Portal'}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="p-3">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>{isAdmin ? 'Staff Navigation' : 'Citizen Menu'}</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? isAdmin
                        ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                        : 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? isAdmin
                            ? 'text-purple-600'
                            : 'text-teal-600'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? isAdmin
                            ? 'bg-purple-600 text-white'
                            : 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-purple-600' : 'bg-teal-600'
              }`}
            />
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
              {currentUser?.name || 'Guest User'}
            </span>
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isAdmin
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-teal-50 text-teal-700 border border-teal-200'
            }`}
          >
            {isAdmin ? 'Staff' : 'Citizen'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
