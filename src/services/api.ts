import axios from 'axios';
import {
  Complaint,
  RiskHotspot,
  AIInvestigationReport,
  CivicReportData,
  User,
  AuthorityDispatch,
  AreaRiskPrediction
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const civicApi = {
  // Auth
  login: async (credentials: { email?: string; password?: string; role?: 'citizen' | 'admin' }) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', credentials);
    return res.data;
  },

  register: async (data: { name: string; email: string; password?: string; phone?: string; neighborhood?: string }) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/register', data);
    return res.data;
  },

  getDemoUsers: async () => {
    const res = await api.get<User[]>('/api/auth/users');
    return res.data;
  },

  // Health checks
  checkHealth: async () => {
    const res = await api.get('/health/db');
    return res.data;
  },

  checkHome: async () => {
    const res = await api.get('/', { headers: { Accept: 'application/json' } });
    return res.data;
  },

  // Complaints
  getComplaints: async (params?: { category?: string; status?: string; urgency?: string; citizen_id?: string; citizen_email?: string }) => {
    const res = await api.get<Complaint[]>('/api/complaints', { params });
    return res.data;
  },

  createComplaint: async (data: {
    description: string;
    latitude: number;
    longitude: number;
    category?: string;
    image_url?: string;
    citizen_id?: string;
    citizen_name?: string;
    citizen_email?: string;
    location_name?: string;
  }) => {
    const res = await api.post<Complaint>('/api/complaints', data);
    return res.data;
  },

  updateComplaintStatus: async (id: string, status: string, note?: string) => {
    const res = await api.patch<Complaint>(`/api/complaints/${id}/status`, { status, note });
    return res.data;
  },

  // AI Analysis & Triage
  analyzeComplaintAI: async (payload: {
    description?: string;
    category?: string;
    imageData?: string;
    latitude?: number;
    longitude?: number;
    location_name?: string;
  }) => {
    const res = await api.post('/api/complaints/analyze', payload);
    return res.data;
  },

  // Citizen Area Risk Prediction
  getAreaRiskPrediction: async (payload: { area_name?: string; latitude?: number; longitude?: number }) => {
    const res = await api.post<AreaRiskPrediction>('/api/predictions/area-risk', payload);
    return res.data;
  },

  // Admin GenAI Predictive Risk Engine
  getGenAIRiskPrediction: async (sector?: string) => {
    const res = await api.post<{
      prediction_id: string;
      sector: string;
      composite_vulnerability_index: number;
      forward_48h_risk_trend: string;
      critical_failure_vectors: Array<{
        infrastructure: string;
        probability_of_failure_pct: number;
        time_to_criticality_hours: number;
        cascading_impact: string;
      }>;
      recommended_preventive_actions: string[];
      inter_agency_coordination_directives: string;
    }>('/api/predictions/genai-risk', { sector });
    return res.data;
  },

  // Admin Authority Dispatches
  getAuthorityDispatches: async () => {
    const res = await api.get<AuthorityDispatch[]>('/api/authorities/dispatches');
    return res.data;
  },

  sendAuthorityDispatch: async (payload: {
    title: string;
    target_authorities: Array<{ name: string; department: string; contact_email: string; status: 'Sent' | 'Delivered' | 'Acknowledged' }>;
    priority: string;
    summary: string;
    work_orders: Array<{ task: string; agency: string; turnaround_time: string }>;
    dispatched_by?: string;
  }) => {
    const res = await api.post<AuthorityDispatch>('/api/authorities/dispatch', payload);
    return res.data;
  },

  // Geospatial Risk Hotspots
  getRiskHotspots: async () => {
    const res = await api.get<{
      total_active_clusters: number;
      overall_city_risk_index: number;
      clusters: RiskHotspot[];
    }>('/api/risk-hotspots');
    return res.data;
  },

  // Automated AI Cross-Incident Investigation
  runAIInvestigation: async (focusArea?: string) => {
    const res = await api.post<AIInvestigationReport>('/api/investigations/run', { focusArea });
    return res.data;
  },

  // Reports
  getReports: async () => {
    const res = await api.get<CivicReportData>('/api/reports');
    return res.data;
  },

  // Automated Cross-Incident Correlation & Municipal Directive
  getCorrelatedRiskReport: async () => {
    const res = await api.get<any>('/api/ai/correlated-risk-report');
    return res.data;
  },

  updateCorrelatedRiskReport: async (updatedReport: any) => {
    const res = await api.put<any>('/api/ai/correlated-risk-report', updatedReport);
    return res.data;
  },

  resetCorrelatedRiskReport: async () => {
    const res = await api.post<any>('/api/ai/correlated-risk-report/reset');
    return res.data;
  },

  verifyAndDispatchDirective: async (payload: { verifier_name?: string; verifier_department?: string; notes?: string }) => {
    const res = await api.post<any>('/api/ai/verify-and-dispatch', payload);
    return res.data;
  },

  // OpenAPI specs
  getOpenApiSpec: async () => {
    const res = await api.get('/api/openapi.json');
    return res.data;
  }
};

export default api;
