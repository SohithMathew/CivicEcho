import React, { useState } from 'react';
import {
  Plus,
  Radio,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
  ArrowRightLeft
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  onOpenNewComplaint: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  activePageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenNewComplaint,
  onOpenAuthModal,
  onLogout,
  activePageTitle,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between shadow-2xs">
      {/* Brand & Page Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-2xs ${
              isAdmin
                ? 'bg-purple-100 border border-purple-200 text-purple-700'
                : 'bg-teal-100 border border-teal-200 text-teal-700'
            }`}
          >
            {isAdmin ? <Shield className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">CivicEcho</span>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-semibold text-slate-700">{activePageTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-3">
        {/* Quick Report Issue Button (Citizens Only) */}
        {!isAdmin && (
          <button
            onClick={onOpenNewComplaint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        )}

        {/* User Account / Profile Dropdown */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-teal-100 text-teal-700 border border-teal-200'
                }`}
              >
                {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[10px] font-medium leading-none block ${
                    isAdmin ? 'text-purple-600' : 'text-teal-600'
                  }`}
                >
                  {isAdmin ? 'Municipal Staff' : 'Citizen'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="font-semibold text-slate-800">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  {currentUser.neighborhood && (
                    <p className="text-[10px] text-teal-600 font-medium mt-0.5">{currentUser.neighborhood}</p>
                  )}
                  {currentUser.department && (
                    <p className="text-[10px] text-purple-600 font-medium mt-0.5">{currentUser.department}</p>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-left transition-colors cursor-pointer text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600" />
              <span>Sign In</span>
            </button>
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
