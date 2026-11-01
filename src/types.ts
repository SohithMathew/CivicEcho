export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string; // For Admin
  neighborhood?: string; // For Citizen
  title?: string;
}

export interface NearbyCorrelation {
  complaint_id: string;
  description: string;
  category: string;
  distance_km: number;
  status: string;
}

export interface HazardFactorsBreakdown {
  score_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  justification: string;
  image_evidence_rating: 'Low' | 'Moderate' | 'High';
  description_severity_rating: 'Low' | 'Moderate' | 'High';
  area_criticality_rating: 'Low' | 'Moderate' | 'High';
  geographical_location_rating: 'Low' | 'Moderate' | 'High';
  nearby_similar_cases_rating: 'Low' | 'Moderate' | 'High';
}

export interface ComplaintAIAnalysis {
  hazard_score: number;
  hazard_tags: string[];
  affected_infrastructure: string;
  department_assigned: string;
  summary: string;
  confidence: number;
  image_corroborated?: boolean;
  similar_cases_count?: number;
  geographical_risk_factor?: string;
  compound_risk_level?: string;
  nearby_correlations?: NearbyCorrelation[];
  hazard_factors?: HazardFactorsBreakdown;
}

export interface Complaint {
  complaint_id: string;
  citizen_id?: string;
  citizen_name?: string;
  citizen_email?: string;
  description: string;
  image_url: string | null;
  latitude: number;
  longitude: number;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  verification_status: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected';
  ai_analysis: ComplaintAIAnalysis | null;
  created_at: string;
  location_name?: string;
  status_timeline?: Array<{
    status: string;
    label: string;
    timestamp: string;
    note?: string;
  }>;
}

export interface RiskHotspot {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  risk_score: number;
  risk_level: string;
  incident_count: number;
  primary_hazard: string;
  affected_commuters_daily: number;
  departments: string[];
  status: string;
}

export interface AIInvestigationReport {
  investigation_id: string;
  title: string;
  root_cause_synthesis: string;
  compound_risk_index: number;
  correlated_complaint_ids: string[];
  weather_factor_analysis: string;
  recommended_work_orders: Array<{
    task: string;
    agency: string;
    priority: 'P1' | 'P2' | 'P3';
    turnaround_time: string;
  }>;
  estimated_budget_inr: number;
  citizen_impact_mitigation: string;
}

export interface CivicReportData {
  reporting_period: string;
  metrics: {
    total_citizen_reports: number;
    verified_reports: number;
    in_progress_remediations: number;
    resolved_issues: number;
    avg_ai_triage_seconds: number;
    infrastructure_health_score: number;
    high_risk_hotspots: number;
  };
  category_breakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recommendations: string[];
}

export interface AuthorityDispatch {
  dispatch_id: string;
  title: string;
  target_authorities: Array<{
    name: string;
    department: string;
    contact_email: string;
    status: 'Sent' | 'Delivered' | 'Acknowledged';
  }>;
  priority: 'P1 - Immediate Intervention' | 'P2 - High Priority' | 'P3 - Scheduled Maintenance';
  summary: string;
  work_orders: Array<{
    task: string;
    agency: string;
    turnaround_time: string;
  }>;
  dispatched_at: string;
  dispatched_by: string;
  official_reference_number: string;
}

export interface AreaRiskPrediction {
  area_name: string;
  coordinates: { lat: number; lng: number };
  predicted_risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  key_hazards: string[];
  resident_advisory: string;
  weather_influence: string;
  nearby_incidents_count: number;
  safe_alternative_routes: string[];
  last_updated: string;
}
