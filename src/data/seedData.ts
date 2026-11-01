export interface SeedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'citizen' | 'admin';
  phone: string;
  neighborhood?: string;
  department?: string;
  title: string;
}

export interface SeedComplaint {
  complaint_id: string;
  citizen_id: string;
  citizen_name: string;
  citizen_email: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  verification_status: 'pending' | 'verified' | 'in_progress' | 'resolved';
  ai_analysis: {
    hazard_score: number;
    hazard_tags: string[];
    affected_infrastructure: string;
    department_assigned: string;
    summary: string;
    confidence: number;
  };
  created_at: string;
  location_name: string;
  status_timeline: Array<{
    status: string;
    label: string;
    timestamp: string;
    note: string;
  }>;
}

// Crisp inline SVGs depicting realistic damage photos
const createDamageSvg = (title: string, tag: string, color: string, bgGradient: [string, string], iconType: string) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <rect width="600" height="400" fill="url(#grid)"/>
    
    <!-- Road / Ground Horizon -->
    <path d="M0 240 Q150 230 300 245 T600 235 L600 400 L0 400 Z" fill="#0f172a" opacity="0.9"/>
    
    <!-- Hazard focal graphics based on type -->
    ${iconType === 'water' ? `
      <!-- Flooded water ripple and crack -->
      <path d="M120 280 C200 260 380 290 500 270 C480 320 200 340 120 280 Z" fill="#0284c7" opacity="0.4"/>
      <path d="M160 290 C220 275 340 300 440 285" stroke="#38bdf8" stroke-width="3" fill="none"/>
      <ellipse cx="280" cy="295" rx="90" ry="25" fill="#0369a1" opacity="0.6"/>
      <path d="M275 220 L285 270 M265 240 L280 280" stroke="#bae6fd" stroke-width="3"/>
    ` : iconType === 'pothole' ? `
      <!-- Pothole crater -->
      <ellipse cx="300" cy="300" rx="140" ry="45" fill="#020617"/>
      <ellipse cx="295" cy="302" rx="125" ry="35" fill="#090d16" stroke="#334155" stroke-width="4"/>
      <path d="M220 285 L180 270 M380 295 L430 310 M310 330 L320 350" stroke="#475569" stroke-width="3"/>
      <circle cx="280" cy="305" r="8" fill="#1e293b"/>
      <circle cx="340" cy="300" r="12" fill="#1e293b"/>
    ` : iconType === 'wire' ? `
      <!-- Electric wire drooping -->
      <line x1="80" y1="90" x2="100" y2="340" stroke="#64748b" stroke-width="8"/>
      <line x1="520" y1="110" x2="500" y2="340" stroke="#64748b" stroke-width="8"/>
      <path d="M100 110 Q300 270 500 130" stroke="#f59e0b" stroke-width="5" fill="none"/>
      <path d="M100 130 Q300 310 500 150" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,4" fill="none"/>
      <polygon points="300,240 315,265 300,265 305,290 285,255 300,255" fill="#fbbf24"/>
    ` : iconType === 'drain' ? `
      <!-- Open drain pit -->
      <rect x="200" y="250" width="200" height="90" rx="8" fill="#020617" stroke="#475569" stroke-width="4"/>
      <line x1="230" y1="250" x2="230" y2="340" stroke="#334155" stroke-width="4"/>
      <line x1="270" y1="250" x2="270" y2="340" stroke="#334155" stroke-width="4"/>
      <line x1="310" y1="250" x2="310" y2="340" stroke="#334155" stroke-width="4"/>
      <line x1="350" y1="250" x2="350" y2="340" stroke="#334155" stroke-width="4"/>
      <polygon points="170,240 210,240 190,200" fill="#f43f5e"/>
    ` : `
      <!-- General Infrastructure repair -->
      <circle cx="300" cy="270" r="60" fill="#1e293b" stroke="${color}" stroke-width="4"/>
      <path d="M280 270 L295 285 L325 255" stroke="#10b981" stroke-width="6" fill="none" stroke-linecap="round"/>
    `}

    <!-- HUD Overlay -->
    <rect x="24" y="24" width="220" height="34" rx="8" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.1)"/>
    <circle cx="42" cy="41" r="5" fill="${color}"/>
    <text x="56" y="45" fill="#f8fafc" font-size="12" font-family="sans-serif" font-weight="bold">${tag}</text>
    
    <!-- Title banner at bottom -->
    <rect x="0" y="340" width="600" height="60" fill="rgba(15,23,42,0.95)"/>
    <text x="24" y="365" fill="#e2e8f0" font-size="14" font-family="sans-serif" font-weight="bold">${title}</text>
    <text x="24" y="385" fill="#94a3b8" font-size="11" font-family="sans-serif">Verified Municipal Evidence Photograph · GPS Calibrated</text>
  </svg>`;
};

// Exactly 10 realistic user accounts (7 Citizens, 3 Municipal Staff)
export const SEED_USERS: SeedUser[] = [
  // 7 Citizens
  {
    id: 'usr-cit-101',
    email: 'arjun.menon@civic.org',
    password: 'civic123',
    name: 'Arjun Menon',
    role: 'citizen',
    phone: '+91 98470 12001',
    neighborhood: 'Marine Drive Central, Ward 14',
    title: 'Resident & Commuter'
  },
  {
    id: 'usr-cit-102',
    email: 'priya.sharma@civic.org',
    password: 'civic123',
    name: 'Priya Sharma',
    role: 'citizen',
    phone: '+91 98470 12002',
    neighborhood: 'Panampilly Nagar, Sector 3',
    title: 'Local Business Owner'
  },
  {
    id: 'usr-cit-103',
    email: 'rahul.varma@civic.org',
    password: 'civic123',
    name: 'Rahul Varma',
    role: 'citizen',
    phone: '+91 98470 12003',
    neighborhood: 'Edappally Toll Junction',
    title: 'Daily Commuter'
  },
  {
    id: 'usr-cit-104',
    email: 'ananya.iyer@civic.org',
    password: 'civic123',
    name: 'Ananya Iyer',
    role: 'citizen',
    phone: '+91 98470 12004',
    neighborhood: 'Fort Kochi Heritage Zone',
    title: 'Heritage Society Member'
  },
  {
    id: 'usr-cit-105',
    email: 'karthik.nair@civic.org',
    password: 'civic123',
    name: 'Karthik Nair',
    role: 'citizen',
    phone: '+91 98470 12005',
    neighborhood: 'Kadavanthra South, Ward 22',
    title: 'School PTA Representative'
  },
  {
    id: 'usr-cit-106',
    email: 'sneha.pillai@civic.org',
    password: 'civic123',
    name: 'Sneha Pillai',
    role: 'citizen',
    phone: '+91 98470 12006',
    neighborhood: 'Kaloor Stadium Road',
    title: 'Health Worker'
  },
  {
    id: 'usr-cit-107',
    email: 'deepak.joseph@civic.org',
    password: 'civic123',
    name: 'Deepak Joseph',
    role: 'citizen',
    phone: '+91 98470 12007',
    neighborhood: 'Ravipuram Arterial Corridor',
    title: 'Resident Association Secretary'
  },
  // 3 Municipal Staff
  {
    id: 'usr-adm-201',
    email: 'chief.pwd@municipality.gov',
    password: 'admin123',
    name: 'Er. K. Raman Nair',
    role: 'admin',
    phone: '+91 94470 44001',
    department: 'Public Works Department (PWD Roads)',
    title: 'Chief Municipal Infrastructure Engineer'
  },
  {
    id: 'usr-adm-202',
    email: 'director.kwa@municipality.gov',
    password: 'admin123',
    name: 'Dr. Malini V. Kurup',
    role: 'admin',
    phone: '+91 94470 44002',
    department: 'Kerala Water Authority (KWA)',
    title: 'Executive Director (Water Distribution & Drainage)'
  },
  {
    id: 'usr-adm-203',
    email: 'officer.traffic@municipality.gov',
    password: 'admin123',
    name: 'Rajesh G. Menon',
    role: 'admin',
    phone: '+91 94470 44003',
    department: 'City Traffic Enforcement & Safety',
    title: 'Assistant Commissioner of Traffic Police'
  }
];

// Exactly 10 realistic civic reports (1 Pending, 2 Verified, 4 In Progress, 3 Resolved)
export const SEED_COMPLAINTS: SeedComplaint[] = [
  // 1. Pending
  {
    complaint_id: 'CMP-2026-101',
    citizen_id: 'usr-cit-105',
    citizen_name: 'Karthik Nair',
    citizen_email: 'karthik.nair@civic.org',
    description: 'High-voltage 440V overhead electrical cable sagging dangerously low (under 2.4m) across primary school pedestrian path after thunderstorm winds.',
    image_url: createDamageSvg('Drooping 440V Overhead Cable', 'CRITICAL ELECTRICAL HAZARD', '#ef4444', ['#1e1b4b', '#0f172a'], 'wire'),
    latitude: 9.9658,
    longitude: 76.2982,
    category: 'Electrical & Power',
    urgency: 'Critical',
    verification_status: 'pending',
    ai_analysis: {
      hazard_score: 95,
      hazard_tags: ['Electrocution Risk', 'School Zone', 'Monsoon Hazard'],
      affected_infrastructure: '440V Secondary Feeder Overhead Line',
      department_assigned: 'State Electricity Board (KSEB)',
      summary: 'Extreme life safety hazard in active pedestrian corridor. Immediate power isolation and re-tensioning mandated.',
      confidence: 0.98
    },
    created_at: '2026-10-31T09:15:00.000Z',
    location_name: 'Kadavanthra South School Crossroad',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted by Citizen',
        timestamp: '2026-10-31T09:15:00.000Z',
        note: 'Reported with calibrated GPS telemetry and evidence photo.'
      }
    ]
  },
  // 2. Pending
  {
    complaint_id: 'CMP-2026-102',
    citizen_id: 'usr-cit-103',
    citizen_name: 'Rahul Varma',
    citizen_email: 'rahul.varma@civic.org',
    description: 'Uncovered 1.8-meter deep storm drainage pit on footpath with broken concrete slab, completely unlit at night near Edappally Metro approach.',
    image_url: createDamageSvg('Broken Concrete Slab Over Deep Sump', 'FALL & PEDESTRIAN RISK', '#f59e0b', ['#1c1917', '#0f172a'], 'drain'),
    latitude: 10.0245,
    longitude: 76.3078,
    category: 'Public Safety',
    urgency: 'High',
    verification_status: 'verified',
    ai_analysis: {
      hazard_score: 84,
      hazard_tags: ['Open Sump', 'Pedestrian Injury Risk', 'Transit Approach'],
      affected_infrastructure: 'Underground Storm Drainage Culvert Footpath',
      department_assigned: 'Public Works Department (PWD Roads)',
      summary: 'Substantial fall hazard adjacent to heavy transit walkway. Requires immediate steel plate barricade.',
      confidence: 0.94
    },
    created_at: '2026-10-31T11:40:00.000Z',
    location_name: 'Edappally Toll Footpath, Near Metro Pillar 384',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted by Citizen',
        timestamp: '2026-10-31T11:40:00.000Z',
        note: 'Submitted with GPS coordinates and evidence photo.'
      },
      {
        status: 'verified',
        label: 'Engineering Verification Confirmed',
        timestamp: '2026-10-31T12:15:00.000Z',
        note: 'Site inspection verified by municipal engineer; work order approved.'
      }
    ]
  },
  // 3. Verified
  {
    complaint_id: 'CMP-2026-103',
    citizen_id: 'usr-cit-104',
    citizen_name: 'Ananya Iyer',
    citizen_email: 'ananya.iyer@civic.org',
    description: 'Heavy municipal solid waste and discarded packing timber dumped into open heritage stormwater canal, completely impeding outflow to harbour.',
    image_url: createDamageSvg('Canal Inflow Choked by Waste Debris', 'DRAINAGE OBSTRUCTION', '#f97316', ['#14532d', '#0f172a'], 'drain'),
    latitude: 9.9642,
    longitude: 76.2428,
    category: 'Sanitation',
    urgency: 'Medium',
    verification_status: 'verified',
    ai_analysis: {
      hazard_score: 68,
      hazard_tags: ['Canal Choke', 'Vector Breeding', 'Urban Waterlogging'],
      affected_infrastructure: 'Fort Kochi Historic Outfall Canal',
      department_assigned: 'Solid Waste Management & Sanitation Wing',
      summary: 'Canal surface flow reduced by 75%. High risk of backflow inundation if uncleaned before high tide.',
      confidence: 0.91
    },
    created_at: '2026-10-31T13:20:00.000Z',
    location_name: 'Fort Kochi Bazaar Canal Bridge',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted by Citizen',
        timestamp: '2026-10-31T13:20:00.000Z',
        note: 'Queued for sanitary inspector assessment.'
      },
      {
        status: 'verified',
        label: 'Engineering Verification Confirmed',
        timestamp: '2026-10-31T14:05:00.000Z',
        note: 'Sanitation wing confirmed canal choke; clearing excavator order issued.'
      }
    ]
  },

  // 4. In Progress
  {
    complaint_id: 'CMP-2026-104',
    citizen_id: 'usr-cit-101',
    citizen_name: 'Arjun Menon',
    citizen_email: 'arjun.menon@civic.org',
    description: 'High-pressure 300mm ductile iron potable water pipe burst beneath MG Road Sector 4, causing massive pavement cavitation and asphalt upheaval.',
    image_url: createDamageSvg('Subsurface Water Seepage & Road Cave-in', 'SEVERE CAVITATION HAZARD', '#0284c7', ['#082f49', '#0f172a'], 'water'),
    latitude: 9.9725,
    longitude: 76.2800,
    category: 'Water Supply',
    urgency: 'Critical',
    verification_status: 'in_progress',
    ai_analysis: {
      hazard_score: 96,
      hazard_tags: ['Subsurface Cavitation', 'Water Main Burst', 'Arterial Road Sinkhole'],
      affected_infrastructure: '300mm Primary Water Feeder + MG Road Transit Sub-base',
      department_assigned: 'Kerala Water Authority (KWA)',
      summary: 'Continuous 1500 LPM seepage actively eroding foundation gravel underneath arterial road. Compound sinkhole danger.',
      confidence: 0.97
    },
    created_at: '2026-10-30T08:30:00.000Z',
    location_name: 'MG Road Sector 4, Near Jos Junction',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted',
        timestamp: '2026-10-30T08:30:00.000Z',
        note: 'Citizen uploaded live leak evidence.'
      },
      {
        status: 'in_progress',
        label: 'Rapid Emergency Crew Dispatched',
        timestamp: '2026-10-30T09:45:00.000Z',
        note: 'KWA emergency valve isolated; excavation machine on site.'
      }
    ]
  },
  // 5. In Progress
  {
    complaint_id: 'CMP-2026-105',
    citizen_id: 'usr-cit-102',
    citizen_name: 'Priya Sharma',
    citizen_email: 'priya.sharma@civic.org',
    description: 'Severe multi-crater asphalt pothole cluster (depth > 18cm) on Banerjee Road junction destabilizing city buses and two-wheeler traffic.',
    image_url: createDamageSvg('Asphalt Crater Cluster & Sub-base Loss', 'HIGH TRANSIT COLLAPSE RISK', '#e11d48', ['#4c0519', '#0f172a'], 'pothole'),
    latitude: 9.9868,
    longitude: 76.2845,
    category: 'Road Damage',
    urgency: 'High',
    verification_status: 'in_progress',
    ai_analysis: {
      hazard_score: 88,
      hazard_tags: ['Transit Impedance', 'Pavement Failure', 'Two-Wheeler Accident Risk'],
      affected_infrastructure: 'Banerjee Road Primary Arterial Carriageway',
      department_assigned: 'Public Works Department (PWD Roads)',
      summary: 'Aggressive sub-base moisture saturation resulting in rapid edge fracturing under bus transit axle loads.',
      confidence: 0.95
    },
    created_at: '2026-10-30T10:15:00.000Z',
    location_name: 'Banerjee Road High Court Junction Approach',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted',
        timestamp: '2026-10-30T10:15:00.000Z',
        note: 'Reported by local merchant association.'
      },
      {
        status: 'in_progress',
        label: 'Road Milling Crew Mobilized',
        timestamp: '2026-10-30T14:00:00.000Z',
        note: 'PWD cold-mix asphalt patch unit deployed.'
      }
    ]
  },
  // 6. In Progress
  {
    complaint_id: 'CMP-2026-106',
    citizen_id: 'usr-cit-101',
    citizen_name: 'Arjun Menon',
    citizen_email: 'arjun.menon@civic.org',
    description: 'Marine Drive coastal stormwater culvert embankment structural fissure letting high-tide seawater breach into sidewalk walkway and subterranean conduits.',
    image_url: createDamageSvg('Culvert Embankment Fissure & Seawater Backflow', 'TIDAL FLOODING VULNERABILITY', '#0284c7', ['#0f766e', '#0f172a'], 'water'),
    latitude: 9.9782,
    longitude: 76.2755,
    category: 'Drainage & Flood Control',
    urgency: 'High',
    verification_status: 'in_progress',
    ai_analysis: {
      hazard_score: 86,
      hazard_tags: ['Tidal Backflow', 'Structural Fissure', 'Subterranean Flooding'],
      affected_infrastructure: 'Coastal Stormwater Sea-Wall & Culvert 2B',
      department_assigned: 'Major Irrigation & Coastal Drainage Wing',
      summary: 'Backflow prevents freshwater drainage from city core. Interlocks with upstream MG Road water line burst.',
      confidence: 0.93
    },
    created_at: '2026-10-30T12:00:00.000Z',
    location_name: 'Marine Drive Promenade North Jetty',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted',
        timestamp: '2026-10-30T12:00:00.000Z',
        note: 'Reported by morning joggers.'
      },
      {
        status: 'in_progress',
        label: 'Sandbag & Flap-Valve Reinforcement Crew Dispatched',
        timestamp: '2026-10-30T16:30:00.000Z',
        note: 'Emergency tidal gate barrier installation underway.'
      }
    ]
  },
  // 7. In Progress
  {
    complaint_id: 'CMP-2026-107',
    citizen_id: 'usr-cit-106',
    citizen_name: 'Sneha Pillai',
    citizen_email: 'sneha.pillai@civic.org',
    description: 'Traffic intersection automated signal controller short-circuited due to rainwater ingress, flashing solid amber and inducing 3-kilometer bottleneck.',
    image_url: createDamageSvg('Short-Circuited Intersection Signal Unit', 'TRAFFIC GRIDLOCK IMPEDANCE', '#eab308', ['#713f12', '#0f172a'], 'wire'),
    latitude: 9.9984,
    longitude: 76.2995,
    category: 'Traffic Infrastructure',
    urgency: 'Medium',
    verification_status: 'in_progress',
    ai_analysis: {
      hazard_score: 74,
      hazard_tags: ['Signal Outage', 'Bottleneck Gridlock', 'Emergency Response Delay'],
      affected_infrastructure: 'Kaloor 4-Way Intelligent Traffic Controller',
      department_assigned: 'Kochi City Traffic Enforcement & Electronics Cell',
      summary: 'Water entry in junction PCB. Manual traffic wardens stationed while replacement relay arrives.',
      confidence: 0.92
    },
    created_at: '2026-10-30T15:10:00.000Z',
    location_name: 'Kaloor Junction Stadium Crossroad',
    status_timeline: [
      {
        status: 'pending',
        label: 'Complaint Submitted',
        timestamp: '2026-10-30T15:10:00.000Z',
        note: 'Reported during evening commute.'
      },
      {
        status: 'in_progress',
        label: 'Electronics Field Technician Dispatched',
        timestamp: '2026-10-30T16:00:00.000Z',
        note: 'Controller reboot attempted; logic board replacement scheduled.'
      }
    ]
  },

  // 8. Resolved
  {
    complaint_id: 'CMP-2026-108',
    citizen_id: 'usr-cit-102',
    citizen_name: 'Priya Sharma',
    citizen_email: 'priya.sharma@civic.org',
    description: 'Deep road depression and pavement edge shear along Panampilly Nagar residential avenue completely resurfaced with polymer bitumen.',
    image_url: createDamageSvg('Finished Polymer Asphalt Resurfacing', 'REMEDIATED & CERTIFIED', '#10b981', ['#064e3b', '#0f172a'], 'general'),
    latitude: 9.9620,
    longitude: 76.2910,
    category: 'Road Damage',
    urgency: 'High',
    verification_status: 'resolved',
    ai_analysis: {
      hazard_score: 15,
      hazard_tags: ['Resurfaced', 'Quality Certified', 'Safe Commute'],
      affected_infrastructure: 'Panampilly Nagar Avenue 4 Carriageway',
      department_assigned: 'Public Works Department (PWD Roads)',
      summary: 'Full depth patch compaction completed. Dynamic load bearing verified by municipal supervisor.',
      confidence: 0.99
    },
    created_at: '2026-10-28T09:00:00.000Z',
    location_name: 'Panampilly Nagar Main Avenue, Crossroad 3',
    status_timeline: [
      {
        status: 'pending',
        label: 'Submitted',
        timestamp: '2026-10-28T09:00:00.000Z',
        note: 'Citizen logged edge cracking.'
      },
      {
        status: 'in_progress',
        label: 'Paver Crew Deployed',
        timestamp: '2026-10-28T14:00:00.000Z',
        note: 'Asphalt milling and base filling executed.'
      },
      {
        status: 'resolved',
        label: 'Work Completed & Audited',
        timestamp: '2026-10-29T18:00:00.000Z',
        note: 'Final bitumen compaction verified by Er. K. Raman Nair (PWD).'
      }
    ]
  },
  // 9. Resolved
  {
    complaint_id: 'CMP-2026-109',
    citizen_id: 'usr-cit-107',
    citizen_name: 'Deepak Joseph',
    citizen_email: 'deepak.joseph@civic.org',
    description: 'Defective 150mm distribution gate valve leaking 400 liters/hr beneath pavement replaced with heavy-duty cast steel valve.',
    image_url: createDamageSvg('New Pressure-Tested Valve Installed', 'REMEDIATED & SEALED', '#10b981', ['#064e3b', '#0f172a'], 'general'),
    latitude: 9.9575,
    longitude: 76.2890,
    category: 'Water Supply',
    urgency: 'Medium',
    verification_status: 'resolved',
    ai_analysis: {
      hazard_score: 12,
      hazard_tags: ['Leak Sealed', 'Pressure Stabilized', 'Pavement Restored'],
      affected_infrastructure: '150mm Feeder Sluice Valve V-12',
      department_assigned: 'Kerala Water Authority (KWA)',
      summary: 'Hydrostatic pressure tested up to 6.5 bar. Pavement reinstatement executed.',
      confidence: 0.98
    },
    created_at: '2026-10-27T11:00:00.000Z',
    location_name: 'Ravipuram 2nd Cross, Near Temple Gate',
    status_timeline: [
      {
        status: 'pending',
        label: 'Submitted',
        timestamp: '2026-10-27T11:00:00.000Z',
        note: 'Water pooling reported by residents.'
      },
      {
        status: 'in_progress',
        label: 'Valve Excavation',
        timestamp: '2026-10-27T16:00:00.000Z',
        note: 'Replacement valve fitted.'
      },
      {
        status: 'resolved',
        label: 'Pressure Certified & Completed',
        timestamp: '2026-10-28T12:00:00.000Z',
        note: 'Water distribution normalized. Inspected by Dr. Malini V. Kurup (KWA).'
      }
    ]
  },
  // 10. Resolved
  {
    complaint_id: 'CMP-2026-110',
    citizen_id: 'usr-cit-105',
    citizen_name: 'Karthik Nair',
    citizen_email: 'karthik.nair@civic.org',
    description: 'Damaged 8-meter steel octagonal streetlight pole leaning dangerously towards roadway stabilized with concrete reinforcement and LED restored.',
    image_url: createDamageSvg('Reinforced Streetlight Mast Plumb', 'STABILIZED & VERIFIED', '#10b981', ['#064e3b', '#0f172a'], 'general'),
    latitude: 9.9320,
    longitude: 76.2970,
    category: 'Electrical & Power',
    urgency: 'Medium',
    verification_status: 'resolved',
    ai_analysis: {
      hazard_score: 10,
      hazard_tags: ['Structural Alignment', 'Lighting Restored', 'Foundation Poured'],
      affected_infrastructure: 'Municipal Street Lighting Mast #ST-104',
      department_assigned: 'State Electricity Board & Municipal Electricals',
      summary: 'Anchor bolts grouted with M30 high-early concrete. Illumination lux verified.',
      confidence: 0.99
    },
    created_at: '2026-10-26T14:30:00.000Z',
    location_name: 'Thevara Ferry Road, Approach Pier',
    status_timeline: [
      {
        status: 'pending',
        label: 'Submitted',
        timestamp: '2026-10-26T14:30:00.000Z',
        note: 'Citizen reported pole tilted after heavy wind.'
      },
      {
        status: 'in_progress',
        label: 'Crane & Rigging Unit Dispatched',
        timestamp: '2026-10-27T10:00:00.000Z',
        note: 'Pole plumb alignment corrected and concrete base cast.'
      },
      {
        status: 'resolved',
        label: 'Safety Audit Completed',
        timestamp: '2026-10-28T09:30:00.000Z',
        note: 'Pole certified structurally sound for wind velocities up to 120 km/h.'
      }
    ]
  }
];
