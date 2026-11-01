import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import RiskMap from './pages/RiskMap';
import Reports from './pages/Reports';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenComplaints from './pages/citizen/CitizenComplaints';
import AdminRiskPrediction from './pages/admin/AdminRiskPrediction';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import NewComplaintModal from './components/NewComplaintModal';
import AuthModal from './components/AuthModal';
import { Complaint, RiskHotspot, User } from './types';
import { civicApi } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [authDefaultRole, setAuthDefaultRole] = useState<'citizen' | 'admin'>('citizen');
  const [currentPage, setCurrentPage] = useState<string>('citizen-dashboard');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hotspots, setHotspots] = useState<RiskHotspot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await civicApi.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotspots = async () => {
    try {
      const data = await civicApi.getRiskHotspots();
      setHotspots(data.clusters || []);
    } catch (err) {
      console.error('Error loading risk hotspots:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchHotspots();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
      showToast(`Signed in as Municipal Staff: ${user.name}`);
    } else {
      setCurrentPage('citizen-dashboard');
      showToast(`Signed in as Citizen: ${user.name}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('landing');
    showToast('Signed out of CivicEcho.');
  };

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    showToast(`Complaint submitted: "${newComplaint.description.slice(0, 36)}..."`);
    fetchHotspots();
  };

  const handleUpdateComplaint = (updated: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.complaint_id === updated.complaint_id ? updated : c))
    );
    showToast(`Status updated to: ${updated.verification_status}`);
    fetchHotspots();
  };

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'citizen-dashboard':
        return 'Neighborhood Safety';
      case 'citizen-complaints':
        return 'My Reported Issues';
      case 'admin-dashboard':
        return 'City Overview';
      case 'admin-complaints':
        return 'All Civic Issues';
      case 'admin-risk-prediction':
        return 'Gen AI Risk Forecaster';
      case 'risk-map':
        return currentUser?.role === 'admin'
          ? 'City Geospatial Map'
          : 'Local Hazard Map';
      case 'reports':
        return 'Municipal Reports Audit';
      default:
        return 'CivicCare';
    }
  };

  // If not logged in, display LandingPage or LoginPage
  if (!currentUser) {
    return (
      <div className="relative">
        {authView === 'landing' ? (
          <LandingPage
            onGoToLogin={(role) => {
              if (role) setAuthDefaultRole(role);
              setAuthView('login');
            }}
          />
        ) : (
          <LoginPage
            defaultRole={authDefaultRole}
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-slate-800 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>{notification}</span>
          </div>
        )}
      </div>
    );
  }

  const myComplaintsCount = complaints.filter(
    (c) => c.citizen_id === currentUser.id || c.citizen_name === currentUser.name
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Permanent Left Sidebar Navigation (Role-aware) */}
      <Sidebar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        myComplaintCount={myComplaintsCount}
        totalComplaintCount={complaints.length}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sticky Global Navbar */}
        <Navbar
          currentUser={currentUser}
          activePageTitle={getPageTitle(currentPage)}
          onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Pages */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* --- CITIZEN INTERFACE ROUTES --- */}
          {currentPage === 'citizen-dashboard' && (
            <CitizenDashboard
              user={currentUser}
              complaints={complaints}
              onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'citizen-complaints' && (
            <CitizenComplaints
              user={currentUser}
              complaints={complaints}
              loading={loading}
              onRefresh={fetchComplaints}
              onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            />
          )}

          {/* --- ADMIN INTERFACE ROUTES --- */}
          {currentPage === 'admin-dashboard' && (
            <Dashboard
              complaints={complaints}
              hotspots={hotspots}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'admin-complaints' && (
            <Complaints
              complaints={complaints}
              loading={loading}
              onRefresh={fetchComplaints}
              onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
              onUpdateComplaint={handleUpdateComplaint}
            />
          )}

          {currentPage === 'admin-risk-prediction' && (
            <AdminRiskPrediction
              complaints={complaints}
              currentUser={currentUser}
            />
          )}

          {/* --- SHARED / COMMON ROUTES --- */}
          {currentPage === 'risk-map' && (
            <RiskMap
              complaints={complaints}
              hotspots={hotspots}
              currentUser={currentUser}
              onUpdateComplaint={handleUpdateComplaint}
              onOpenNewComplaintWithCoords={() => {
                setIsNewComplaintOpen(true);
              }}
            />
          )}

          {currentPage === 'reports' && (
            <Reports complaints={complaints} />
          )}
        </main>
      </div>

      {/* New Complaint Reporting Modal */}
      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onComplaintCreated={handleComplaintCreated}
        currentUser={currentUser}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 text-slate-800 text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}
    </div>
  );
}
