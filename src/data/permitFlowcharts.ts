import { FlowchartNode, JobType, LegalSource } from "@/types";
import { LEGAL_SOURCES } from "./pinellasLegalSources";

// Flowchart definitions for each permit type
export interface PermitFlowchart {
  id: string;
  jobType: JobType;
  title: string;
  nodes: FlowchartNode[];
}

// Small Bath Remodel Flowchart
export const SMALL_BATH_REMODEL_FLOWCHART: PermitFlowchart = {
  id: "small-bath-remodel",
  jobType: "SMALL_BATH_REMODEL",
  title: "Small Bathroom Remodel Permit Process",
  nodes: [
    {
      id: "start",
      label: "Start: Bath Remodel",
      type: "start",
      status: "pending",
      nextNodes: "scope-check"
    },
    {
      id: "scope-check",
      label: "Assess Scope of Work",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_105_2,
      nextNodes: { cosmetic: "no-permit", fixtures: "permit-check", plumbing: "plumbing-permit", electrical: "electrical-permit", full: "multi-permit" }
    },
    {
      id: "no-permit",
      label: "No Permit Required",
      type: "end",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_105_2,
      pinellasSpecific: false
    },
    {
      id: "permit-check",
      label: "Fixture Replacement Only?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_105_2,
      nextNodes: { same_location: "no-permit", new_location: "plumbing-permit" }
    },
    {
      id: "plumbing-permit",
      label: "Plumbing Permit Required",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_PLUMBING,
      nextNodes: "submit-permit"
    },
    {
      id: "electrical-permit",
      label: "Electrical Permit Required",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.NEC_210_8,
      nextNodes: "submit-permit"
    },
    {
      id: "multi-permit",
      label: "Multiple Permits Required",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_PERMIT_GUIDE,
      nextNodes: "submit-permit"
    },
    {
      id: "submit-permit",
      label: "Submit to Pinellas County",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS,
      nextNodes: "noc-check",
      pinellasSpecific: true
    },
    {
      id: "noc-check",
      label: "Project Value > $5,000?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.FS_713_13,
      nextNodes: { yes: "record-noc", no: "rough-inspection" }
    },
    {
      id: "record-noc",
      label: "Record NOC with Clerk",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_NOC,
      nextNodes: "rough-inspection",
      pinellasSpecific: true
    },
    {
      id: "rough-inspection",
      label: "Rough-In Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "drywall-close"
    },
    {
      id: "drywall-close",
      label: "Close Walls (Drywall)",
      type: "action",
      status: "pending",
      nextNodes: "final-inspection"
    },
    {
      id: "final-inspection",
      label: "Final Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "complete"
    },
    {
      id: "complete",
      label: "Permit Closed",
      type: "end",
      status: "pending"
    }
  ]
};

// Water Heater Flowchart
export const WATER_HEATER_FLOWCHART: PermitFlowchart = {
  id: "water-heater",
  jobType: "WATER_HEATER",
  title: "Water Heater Permit Process",
  nodes: [
    {
      id: "start",
      label: "Start: Water Heater",
      type: "start",
      status: "pending",
      nextNodes: "type-check"
    },
    {
      id: "type-check",
      label: "Tank or Tankless?",
      type: "decision",
      status: "pending",
      nextNodes: { tank: "express-permit", tankless: "tankless-worksheet" }
    },
    {
      id: "tankless-worksheet",
      label: "Complete Tankless Worksheet",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_TANKLESS,
      nextNodes: "express-permit",
      pinellasSpecific: true
    },
    {
      id: "express-permit",
      label: "Submit Express Permit",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS,
      nextNodes: "noc-check",
      pinellasSpecific: true
    },
    {
      id: "noc-check",
      label: "Value > $5,000?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.FS_713_13,
      nextNodes: { yes: "record-noc", no: "install" }
    },
    {
      id: "record-noc",
      label: "Record NOC",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_NOC,
      nextNodes: "install",
      pinellasSpecific: true
    },
    {
      id: "install",
      label: "Install Water Heater",
      type: "action",
      status: "pending",
      nextNodes: "final-inspection"
    },
    {
      id: "final-inspection",
      label: "Final Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "complete"
    },
    {
      id: "complete",
      label: "Permit Closed",
      type: "end",
      status: "pending"
    }
  ]
};

// AC/HVAC Changeout Flowchart
export const AC_HVAC_FLOWCHART: PermitFlowchart = {
  id: "ac-hvac-changeout",
  jobType: "AC_HVAC_CHANGEOUT",
  title: "AC/HVAC Changeout Permit Process",
  nodes: [
    {
      id: "start",
      label: "Start: HVAC Changeout",
      type: "start",
      status: "pending",
      nextNodes: "like-for-like"
    },
    {
      id: "like-for-like",
      label: "Like-for-Like Replacement?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_HVAC,
      nextNodes: { yes: "express-permit", no: "load-calc" }
    },
    {
      id: "load-calc",
      label: "Prepare Load Calculation",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_MECHANICAL,
      nextNodes: "standard-permit"
    },
    {
      id: "standard-permit",
      label: "Submit Standard Permit",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_PERMIT_GUIDE,
      nextNodes: "noc-check",
      pinellasSpecific: true
    },
    {
      id: "express-permit",
      label: "Submit Express Permit",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS,
      nextNodes: "noc-check",
      pinellasSpecific: true
    },
    {
      id: "noc-check",
      label: "Value > $15,000?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.FS_713_13,
      nextNodes: { yes: "record-noc", no: "install" }
    },
    {
      id: "record-noc",
      label: "Record NOC",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_NOC,
      nextNodes: "install",
      pinellasSpecific: true
    },
    {
      id: "install",
      label: "Install Equipment",
      type: "action",
      status: "pending",
      nextNodes: "final-inspection"
    },
    {
      id: "final-inspection",
      label: "Final Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "complete"
    },
    {
      id: "complete",
      label: "Permit Closed",
      type: "end",
      status: "pending"
    }
  ]
};

// Re-Roofing Flowchart
export const RE_ROOFING_FLOWCHART: PermitFlowchart = {
  id: "re-roofing",
  jobType: "RE_ROOFING",
  title: "Re-Roofing Permit Process",
  nodes: [
    {
      id: "start",
      label: "Start: Re-Roofing",
      type: "start",
      status: "pending",
      nextNodes: "material-type"
    },
    {
      id: "material-type",
      label: "Select Roofing Material",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.FBC_ROOFING,
      nextNodes: "affidavit"
    },
    {
      id: "affidavit",
      label: "Complete Re-Roofing Affidavit",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_REROOFING,
      nextNodes: "submit-permit",
      pinellasSpecific: true
    },
    {
      id: "submit-permit",
      label: "Submit Express Permit",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS,
      nextNodes: "noc-check",
      pinellasSpecific: true
    },
    {
      id: "noc-check",
      label: "Value > $5,000?",
      type: "decision",
      status: "pending",
      legalSource: LEGAL_SOURCES.FS_713_13,
      nextNodes: { yes: "record-noc", no: "tear-off" }
    },
    {
      id: "record-noc",
      label: "Record NOC",
      type: "action",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_NOC,
      nextNodes: "tear-off",
      pinellasSpecific: true
    },
    {
      id: "tear-off",
      label: "Tear Off & Prep Deck",
      type: "action",
      status: "pending",
      nextNodes: "dry-in-inspection"
    },
    {
      id: "dry-in-inspection",
      label: "Dry-In Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "complete-roof",
      pinellasSpecific: true
    },
    {
      id: "complete-roof",
      label: "Complete Roofing",
      type: "action",
      status: "pending",
      nextNodes: "final-inspection"
    },
    {
      id: "final-inspection",
      label: "Final Inspection",
      type: "inspection",
      status: "pending",
      legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS,
      nextNodes: "complete"
    },
    {
      id: "complete",
      label: "Permit Closed",
      type: "end",
      status: "pending"
    }
  ]
};

// All flowcharts by job type
export const PERMIT_FLOWCHARTS: Record<JobType, PermitFlowchart> = {
  SMALL_BATH_REMODEL: SMALL_BATH_REMODEL_FLOWCHART,
  WATER_HEATER: WATER_HEATER_FLOWCHART,
  AC_HVAC_CHANGEOUT: AC_HVAC_FLOWCHART,
  RE_ROOFING: RE_ROOFING_FLOWCHART,
  ELECTRICAL_PANEL: {
    id: "electrical-panel",
    jobType: "ELECTRICAL_PANEL",
    title: "Electrical Panel Upgrade Process",
    nodes: [
      { id: "start", label: "Start: Panel Upgrade", type: "start", status: "pending", nextNodes: "load-calc" },
      { id: "load-calc", label: "Prepare Load Calculation", type: "action", status: "pending", legalSource: LEGAL_SOURCES.NEC_210_52, nextNodes: "submit-permit" },
      { id: "submit-permit", label: "Submit Permit + Plans", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_PERMIT_GUIDE, nextNodes: "noc-check", pinellasSpecific: true },
      { id: "noc-check", label: "Value > $5,000?", type: "decision", status: "pending", legalSource: LEGAL_SOURCES.FS_713_13, nextNodes: { yes: "record-noc", no: "install" } },
      { id: "record-noc", label: "Record NOC", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_NOC, nextNodes: "install", pinellasSpecific: true },
      { id: "install", label: "Install Panel", type: "action", status: "pending", nextNodes: "final-inspection" },
      { id: "final-inspection", label: "Final Inspection", type: "inspection", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS, nextNodes: "complete" },
      { id: "complete", label: "Permit Closed", type: "end", status: "pending" }
    ]
  },
  WINDOW_DOOR_REPLACEMENT: {
    id: "window-door",
    jobType: "WINDOW_DOOR_REPLACEMENT",
    title: "Window/Door Replacement Process",
    nodes: [
      { id: "start", label: "Start: Window/Door", type: "start", status: "pending", nextNodes: "product-approval" },
      { id: "product-approval", label: "Verify Product Approval", type: "action", status: "pending", legalSource: LEGAL_SOURCES.FL_PRODUCT_APPROVAL, nextNodes: "complete-form" },
      { id: "complete-form", label: "Complete W/D Form", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_WINDOW_DOOR, nextNodes: "submit-permit", pinellasSpecific: true },
      { id: "submit-permit", label: "Submit Express Permit", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS, nextNodes: "install", pinellasSpecific: true },
      { id: "install", label: "Install Windows/Doors", type: "action", status: "pending", nextNodes: "final-inspection" },
      { id: "final-inspection", label: "Final Inspection", type: "inspection", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS, nextNodes: "complete" },
      { id: "complete", label: "Permit Closed", type: "end", status: "pending" }
    ]
  },
  POOL_BARRIER: {
    id: "pool-barrier",
    jobType: "POOL_BARRIER",
    title: "Pool Barrier Permit Process",
    nodes: [
      { id: "start", label: "Start: Pool Barrier", type: "start", status: "pending", nextNodes: "barrier-type" },
      { id: "barrier-type", label: "Select Barrier Type", type: "action", status: "pending", legalSource: LEGAL_SOURCES.FL_POOL_SAFETY, nextNodes: "submit-permit" },
      { id: "submit-permit", label: "Submit Express Permit", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_POOL_BARRIER, nextNodes: "install", pinellasSpecific: true },
      { id: "install", label: "Install Barrier", type: "action", status: "pending", nextNodes: "final-inspection" },
      { id: "final-inspection", label: "Final Inspection", type: "inspection", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS, nextNodes: "complete" },
      { id: "complete", label: "Permit Closed", type: "end", status: "pending" }
    ]
  },
  GENERATOR_INSTALL: {
    id: "generator",
    jobType: "GENERATOR_INSTALL",
    title: "Generator Installation Process",
    nodes: [
      { id: "start", label: "Start: Generator", type: "start", status: "pending", nextNodes: "load-calc" },
      { id: "load-calc", label: "Prepare Load Calculation", type: "action", status: "pending", legalSource: LEGAL_SOURCES.NEC_422, nextNodes: "submit-permit" },
      { id: "submit-permit", label: "Submit Permit + Plans", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_PERMIT_GUIDE, nextNodes: "noc-check", pinellasSpecific: true },
      { id: "noc-check", label: "Value > $5,000?", type: "decision", status: "pending", legalSource: LEGAL_SOURCES.FS_713_13, nextNodes: { yes: "record-noc", no: "install" } },
      { id: "record-noc", label: "Record NOC", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_NOC, nextNodes: "install", pinellasSpecific: true },
      { id: "install", label: "Install Generator", type: "action", status: "pending", legalSource: LEGAL_SOURCES.FBC_GENERATOR, nextNodes: "gas-inspection" },
      { id: "gas-inspection", label: "Gas Line Inspection", type: "inspection", status: "pending", nextNodes: "final-inspection" },
      { id: "final-inspection", label: "Final Electrical Inspection", type: "inspection", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS, nextNodes: "complete" },
      { id: "complete", label: "Permit Closed", type: "end", status: "pending" }
    ]
  },
  EV_CHARGER: {
    id: "ev-charger",
    jobType: "EV_CHARGER",
    title: "EV Charger Installation Process",
    nodes: [
      { id: "start", label: "Start: EV Charger", type: "start", status: "pending", nextNodes: "charger-level" },
      { id: "charger-level", label: "Level 1 or Level 2?", type: "decision", status: "pending", legalSource: LEGAL_SOURCES.NEC_625, nextNodes: { level1: "no-permit", level2: "submit-permit" } },
      { id: "no-permit", label: "No Permit (120V outlet)", type: "end", status: "pending" },
      { id: "submit-permit", label: "Submit Express Permit", type: "action", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_EXPRESS, nextNodes: "install", pinellasSpecific: true },
      { id: "install", label: "Install Charger", type: "action", status: "pending", nextNodes: "final-inspection" },
      { id: "final-inspection", label: "Final Inspection", type: "inspection", status: "pending", legalSource: LEGAL_SOURCES.PINELLAS_INSPECTIONS, nextNodes: "complete" },
      { id: "complete", label: "Permit Closed", type: "end", status: "pending" }
    ]
  }
};

// Helper function to get flowchart for a job type
export function getFlowchartForJobType(jobType: JobType): PermitFlowchart {
  return PERMIT_FLOWCHARTS[jobType];
}

// Helper function to generate Mermaid syntax from flowchart
export function generateMermaidFromFlowchart(flowchart: PermitFlowchart, currentNodeId?: string): string {
  const lines: string[] = ["flowchart TD"];
  
  flowchart.nodes.forEach(node => {
    // Node styling based on type and status
    let nodeStyle = "";
    if (node.id === currentNodeId) {
      nodeStyle = ":::current";
    } else if (node.status === "complete") {
      nodeStyle = ":::complete";
    }
    
    // Node shape based on type
    let nodeShape = "";
    switch (node.type) {
      case "start":
      case "end":
        nodeShape = `([${node.label}])`;
        break;
      case "decision":
        nodeShape = `{${node.label}}`;
        break;
      case "inspection":
        nodeShape = `[/${node.label}/]`;
        break;
      default:
        nodeShape = `[${node.label}]`;
    }
    
    lines.push(`    ${node.id}${nodeShape}${nodeStyle}`);
    
    // Add connections
    if (node.nextNodes) {
      if (typeof node.nextNodes === "string") {
        lines.push(`    ${node.id} --> ${node.nextNodes}`);
      } else {
        Object.entries(node.nextNodes).forEach(([condition, targetId]) => {
          lines.push(`    ${node.id} -->|${condition}| ${targetId}`);
        });
      }
    }
  });
  
  // Add styling
  lines.push("");
  lines.push("    classDef current fill:#3b82f6,stroke:#1d4ed8,color:#fff");
  lines.push("    classDef complete fill:#22c55e,stroke:#16a34a,color:#fff");
  
  return lines.join("\n");
}
