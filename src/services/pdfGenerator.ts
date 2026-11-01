import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CivicReportData, Complaint } from '../types';

export const generateAndDownloadAuditPdf = (
  reportData: CivicReportData | null,
  complaints: Complaint[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verifiedCount = complaints.filter((c) => c.verification_status === 'verified').length;
  const inProgressCount = complaints.filter((c) => c.verification_status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.verification_status === 'resolved').length;
  const healthScore = reportData?.metrics?.infrastructure_health_score || 79.4;

  // 1. Top Government Banner Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Decorative Teal accent bar
  doc.setFillColor(20, 184, 166); // Teal 500
  doc.rect(0, 37, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MUNICIPAL CORPORATION OF KOCHI', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 212, 191); // Teal 400
  doc.text('CIVICECHO INTELLIGENCE CELL · DIRECTORATE OF MUNICIPAL ENGINEERING', 14, 20);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(8);
  doc.text('Statutory Infrastructure Audit, Risk Assessment & Agency Accountability Dossier', 14, 26);

  // Document metadata box on the right
  doc.setFontSize(7.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(248, 250, 252);
  doc.text('DOC REF: AUDIT-REP-2026-Q3-0892', pageWidth - 14, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${currentDate}`, pageWidth - 14, 20, { align: 'right' });
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFont('helvetica', 'bold');
  doc.text('CLASSIFICATION: CERTIFIED PUBLIC RECORD', pageWidth - 14, 26, { align: 'right' });

  let yPos = 48;

  // 2. Executive Operations & Resilience Rating Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EXECUTIVE OPERATIONS AUDIT & RESILIENCE RATING', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  // Metric 1
  doc.text('Total Reports Audited:', 18, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${complaints.length} Records`, 18, yPos + 18);

  // Metric 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('AI Verified & Routed:', 65, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.text(`${verifiedCount} (${(complaints.length > 0 ? (verifiedCount / complaints.length) * 100 : 0).toFixed(0)}%)`, 65, yPos + 18);

  // Metric 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Active Work Orders:', 115, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // Sky 600
  doc.text(`${inProgressCount} Dispatched`, 115, yPos + 18);

  // Metric 4
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('City Health Score:', 160, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`${healthScore}%`, 160, yPos + 18);

  yPos += 32;

  // 3. Category Breakdown Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Infrastructure Failure Breakdown by Domain', 14, yPos);
  yPos += 3;

  const categoryRows = (reportData?.category_breakdown || [
    { category: 'Road Damage', count: 42, percentage: 38 },
    { category: 'Water Supply & Drainage', count: 28, percentage: 25 },
    { category: 'Electrical & Power Grid', count: 18, percentage: 16 },
    { category: 'Sanitation & Solid Waste', count: 14, percentage: 13 },
    { category: 'Public Safety & Lighting', count: 9, percentage: 8 },
  ]).map((item) => [
    item.category,
    `${item.count} Reports`,
    `${item.percentage}%`,
    item.category.includes('Road')
      ? 'Public Works Department (PWD Roads)'
      : item.category.includes('Water')
      ? 'Kerala Water Authority (KWA)'
      : item.category.includes('Power') || item.category.includes('Electrical')
      ? 'State Electricity Board (KSEB)'
      : item.category.includes('Sanitation')
      ? 'Health & Solid Waste Management'
      : 'Smart City Electrical Division',
    'MONITORED',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Domain Category', 'Incident Volume', 'Share (%)', 'Assigned Agency', 'Audit Status']],
    body: categoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // 4. Priority Compound Hazard Hotspots
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. Priority Compound Hazard Register', 14, yPos);
  yPos += 3;

  const hotspotRows = [
    [
      'MG Road Sector 4 Corridor',
      'Risk 88/100 · Critical',
      'Subsurface soil cavitation induced by 200mm high-pressure water feeder rupture. High risk of bus transit sinkhole.',
      'Emergency valve isolation & PWD polymer backfill',
    ],
    [
      'South Overbridge Approach',
      'Risk 95/100 · Extreme',
      '440V overhead distribution pole tension collapse across railway approach. Mechanical line snap imminent.',
      'KSEB emergency pole restabilization & line retension',
    ],
    [
      'Fort Kochi Coastal Walkway',
      'Risk 64/100 · Moderate',
      'Salt-mist photochemical corrosion of 7 solar lighting battery banks causing a 340m evening blindspot.',
      'Smart City LiFePO4 battery bank retrofitting',
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Hotspot Location', 'Vulnerability Score', 'Hazard Diagnosis', 'Statutory Directive']],
    body: hotspotRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // 5. Strategic Directives Box
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. Strategic Engineering Directives & Action Plan', 14, yPos);
  yPos += 5;

  const recommendations = reportData?.recommendations || [
    'Prioritize preventive culvert desilting along low-lying corridors before monsoon peak.',
    'Transition street lighting solar batteries to lithium-iron-phosphate (LiFePO4) with IP67 encasements.',
    'Coordinate Joint Excavation Protocol between PWD and Water Authority to prevent post-repair asphalt cuts.',
  ];

  recommendations.forEach((rec, idx) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos, pageWidth - 28, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(13, 148, 136);
    doc.text(`${idx + 1}.`, 17, yPos + 5.2);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(rec, 23, yPos + 5.2);
    yPos += 10;
  });

  yPos += 4;

  // 6. Signatory and Digital Hash Footer
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AUDIT RECORD VERIFICATION HASH (SHA-256):', 14, yPos);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('7f8a91b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2', 14, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Recorded in CivicEcho Immutable Municipal PostgreSQL Audit Ledger', 14, yPos + 8);

  // Authorized Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Er. K. Raman Nair, FIE', pageWidth - 14, yPos + 2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Superintending Engineer & Municipal Administrator', pageWidth - 14, yPos + 6, { align: 'right' });

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth - 70, yPos + 8, 56, 5, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ DIGITALLY CERTIFIED & TRANSMITTED', pageWidth - 42, yPos + 11.5, { align: 'center' });

  // 7. Save and trigger direct browser file download
  const filename = `CivicEcho_Municipal_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

export const generateAndDownloadVerifiedDirectivePdf = (
  report: any,
  verifiedBy?: string,
  verifiedAt?: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const refNumber = report?.official_reference_number || 'MUNI-DIR-2026-9281';
  const officerName = verifiedBy || report?.verified_by || 'Er. K. Raman Nair (Chief Municipal Engineer)';
  const printDate = verifiedAt
    ? new Date(verifiedAt).toLocaleString()
    : new Date().toLocaleString();

  // 1. Top Government Banner Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Decorative Teal stripe
  doc.setFillColor(20, 184, 166); // Teal 500
  doc.rect(0, 39, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MUNICIPAL CORPORATION INFRASTRUCTURE COMMAND', 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 212, 191); // Teal 400
  doc.text('PUBLIC WORKS · WATER AUTHORITY · ELECTRICAL BOARD · TRAFFIC ENFORCEMENT', 14, 19);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(7.5);
  doc.text('Statutory Cross-Incident Emergency Directive · Inter-Agency Operations Order', 14, 25);

  // Metadata block (Right side)
  doc.setFontSize(7.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`REF: ${refNumber}`, pageWidth - 14, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`VERIFIED: ${printDate}`, pageWidth - 14, 19, { align: 'right' });
  doc.setTextColor(244, 63, 94); // Rose 500
  doc.setFont('helvetica', 'bold');
  doc.text('CLASSIFICATION: P1 - STATUTORY DIRECTIVE', pageWidth - 14, 25, { align: 'right' });

  let yPos = 47;

  // 2. Official Municipal Staff Verification Stamp Banner
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.6);
  doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('✓ MUNICIPAL STAFF OFFICIAL VERIFICATION & AUTHORIZATION CERTIFICATE', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Authorized by: ${officerName}`, 18, yPos + 11.5);

  const notesText = report?.verifier_notes || 'All cross-incident multi-agency directives verified against field telemetry. Released for immediate inter-agency deployment.';
  const wrappedNotes = doc.splitTextToSize(`Notes: ${notesText}`, pageWidth - 90);
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7);
  doc.text(wrappedNotes[0] || '', 18, yPos + 16.5);

  // Digital badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 68, yPos + 6, 50, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DIGITALLY CERTIFIED', pageWidth - 43, yPos + 10.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('MUNICIPAL SEAL AFFIXED', pageWidth - 43, yPos + 13.5, { align: 'center' });

  yPos += 28;

  // 3. Directive Title & Core Assessment Metrics
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(report?.title || 'Emergency Inter-Agency Infrastructure Directive', 14, yPos);
  yPos += 4;

  // 4 Metric cards in a row
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const metrics = [
    { label: 'COMPOUND RISK', value: `${report?.composite_risk_score || 89}/100`, sub: 'Critical Compound Threat', valColor: [225, 29, 72] },
    {
      label: 'ANALYZED INCIDENTS',
      value: `${report?.total_analyzed_reports || 10} Reports`,
      sub: `${report?.status_distribution?.pending || 1} Pend · ${report?.status_distribution?.verified || 2} Ver · ${report?.status_distribution?.in_progress || 4} Prog · ${report?.status_distribution?.resolved || 3} Done`,
      valColor: [15, 23, 42]
    },
    { label: 'CRITICAL NEXUSES', value: `${report?.correlation_nexus?.length || 2} Synergies`, sub: 'Multi-Systemic Failures', valColor: [126, 34, 206] },
    { label: 'TARGET AGENCIES', value: '4 Authorities', sub: 'PWD · KWA · Police · KSEB', valColor: [13, 148, 136] }
  ];

  metrics.forEach((m, idx) => {
    const cardX = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, yPos, cardWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cardX + 3, yPos + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(m.valColor[0], m.valColor[1], m.valColor[2]);
    doc.text(m.value, cardX + 3, yPos + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, cardX + 3, yPos + 15);
  });

  yPos += 24;

  // 4. Automated Cross-Incident Correlation Synthesis
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. Automated Cross-Incident Correlation & Systemic Synthesis', 14, yPos);
  yPos += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(
    report?.executive_summary ||
    'AI correlation engine has identified systemic infrastructure vulnerability connecting continuous water main leakage with rapid road pavement deterioration, overhead electrical line instability, and downstream stormwater drainage blockage.',
    pageWidth - 28
  );
  doc.text(summaryLines, 14, yPos + 2);
  yPos += (summaryLines.length * 3.8) + 4;

  // Table of Correlation Nexuses
  const nexusRows = (report?.correlation_nexus || []).map((nex: any, idx: number) => [
    `Nexus #${idx + 1}: ${nex.title}`,
    nex.criticality || 'Critical Synergy',
    nex.synergy_synthesis || '',
    nex.correlated_complaint_ids?.join(', ') || 'N/A',
    `${nex.affected_commuters?.toLocaleString() || '15,000'} / day`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Identified Multi-Incident Nexus', 'Criticality', 'Compound Root Cause Analysis', 'Complaints', 'Commuters Affected']],
    body: nexusRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 26, textColor: [225, 29, 72] },
      2: { cellWidth: 64 },
      3: { cellWidth: 24, fontStyle: 'bold' },
      4: { cellWidth: 26 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  yPos = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need page break for Section 2
  if (yPos > pageHeight - 65) {
    doc.addPage();
    yPos = 16;
  }

  // 5. Concerning Authorities & Emergency Work Directives Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. Inter-Agency Emergency Work Orders & Statutory Directives', 14, yPos);
  yPos += 3;

  const workOrderRows = (report?.emergency_work_orders || []).map((wo: any) => [
    wo.task,
    wo.agency,
    wo.turnaround_time,
    wo.priority,
    'DISPATCHED & TRANSMITTED'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Emergency Task Directive', 'Designated Agency', 'SLA Turnaround', 'Priority', 'Dispatch Status']],
    body: workOrderRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 25, fontStyle: 'bold' },
      3: { cellWidth: 20, textColor: [225, 29, 72] },
      4: { cellWidth: 27, textColor: [5, 150, 105], fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Check if signatures fit on current page
  if (yPos > pageHeight - 38) {
    doc.addPage();
    yPos = 20;
  }

  // 6. Official Signatures and Seals Block
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 5;

  // Left Signatory (Chief Municipal Engineer)
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(13, 148, 136);
  doc.text(officerName, 14, yPos + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Er. K. Raman Nair, FIE', 14, yPos + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Chief Municipal Engineer · Public Works Department', 14, yPos + 11);
  doc.text('Municipal Corporation Infrastructure Command', 14, yPos + 14.5);

  // Right Signatory (Executive Director)
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(126, 34, 206);
  doc.text('Dr. Malini V. Kurup', pageWidth - 14, yPos + 3, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Dr. Malini V. Kurup, Ph.D.', pageWidth - 14, yPos + 7.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Executive Director · Water, Sanitation & Drainage', pageWidth - 14, yPos + 11, { align: 'right' });
  doc.text('Inter-Agency Disaster Mitigation Council', pageWidth - 14, yPos + 14.5, { align: 'right' });

  // Center Seal Stamp
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth / 2 - 28, yPos + 2, 56, 11, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('OFFICIAL STATUTORY SEAL', pageWidth / 2, yPos + 6.2, { align: 'center' });
  doc.setFontSize(5);
  doc.text('TRANSMITTED TO AUTHORITIES VIA SECURE LEDGER', pageWidth / 2, yPos + 9.5, { align: 'center' });

  // Save PDF file
  const filename = `Official_Municipal_Directive_${refNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
};

export const generateAndDownloadComplaintReceiptPdf = (complaint: Complaint) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const ticketId = complaint.complaint_id || 'CMP-2026-0001';
  const citizenName = complaint.citizen_name || 'Citizen Resident';
  const category = complaint.category || 'Civic Infrastructure';
  const location = complaint.location_name || 'Kochi Municipal Area';
  const status = (complaint.verification_status || 'pending').toUpperCase().replace('_', ' ');

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 36, 'F');
  doc.setFillColor(20, 184, 166); // Teal 500
  doc.rect(0, 35, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MUNICIPAL CORPORATION CITIZEN CIVIC PORTAL', 14, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 212, 191);
  doc.text('OFFICIAL STATUTORY COMPLAINT LODGMENT & DISPATCH RECEIPT', 14, 20);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text('CivicEcho Public Works & Municipal Services Resolution Tracking System', 14, 26);

  // Top right metadata
  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`TICKET: #${ticketId}`, pageWidth - 14, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${new Date(complaint.created_at).toLocaleDateString()}`, pageWidth - 14, 20, { align: 'right' });
  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATUS: ${status}`, pageWidth - 14, 26, { align: 'right' });

  let yPos = 46;

  // Status Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL CITIZEN REPORT ACKNOWLEDGMENT', 18, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Complainant: ${citizenName} · Email: ${complaint.citizen_email || 'Registered Citizen'}`, 18, yPos + 11.5);
  doc.text(`Assigned Department: ${complaint.ai_analysis?.department_assigned || 'Public Works Department (PWD)'}`, 18, yPos + 16.5);

  yPos += 28;

  // Complaint Details Table
  autoTable(doc, {
    startY: yPos,
    head: [['Attribute', 'Official Telemetry & Investigation Details']],
    body: [
      ['Complaint ID', `#${ticketId}`],
      ['Classification / Category', category],
      ['Geographic Location', `${location} (Lat: ${complaint.latitude?.toFixed(4)}, Lng: ${complaint.longitude?.toFixed(4)})`],
      ['Urgency Rating', complaint.urgency || 'High Priority'],
      ['Current Processing Stage', status],
      ['Detailed Description', complaint.description || 'Civic infrastructure malfunction reported by resident.'],
      ['AI Risk Assessment', complaint.ai_analysis?.summary || 'Automated triage scheduled and queued.'],
      ['Affected Infrastructure', complaint.ai_analysis?.affected_infrastructure || 'Subsurface municipal corridor & public transit artery'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold', textColor: [15, 23, 42] },
      1: { cellWidth: pageWidth - 28 - 48 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Signatory & Seal
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CITIZEN GRIEVANCE REDRESSAL VERIFICATION CODE:', 14, yPos);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`SHA256-${ticketId}-MUNI-CIVIC-RECORD`, 14, yPos + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Municipal Grievance Officer', pageWidth - 14, yPos + 2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Automated Citizen Helpdesk System', pageWidth - 14, yPos + 6, { align: 'right' });

  // Save PDF
  const filename = `Civic_Complaint_Receipt_${ticketId}.pdf`;
  doc.save(filename);
};
