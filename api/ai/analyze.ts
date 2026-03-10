import { z } from 'zod';
import OpenAI from 'openai';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const AnalyzeRequestSchema = z.object({
  jobType: z.string().min(1).max(100),
  jurisdiction: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  description: z.string().min(0).max(2000).optional().default(''),
  squareFootage: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  buildingType: z.string().optional(),
  isAlteringShape: z.boolean().optional(),
  isTankless: z.boolean().optional(),
  isGas: z.boolean().optional(),
  deckHeight: z.string().optional(),
  isAttached: z.boolean().optional(),
  fenceHeight: z.string().optional(),
  fenceMaterial: z.string().optional(),
  panelAmps: z.string().optional(),
  hvacTonnage: z.string().optional(),
  bathMovingPlumbing: z.boolean().optional(),
  bathMovingElectric: z.boolean().optional(),
  bathStructural: z.boolean().optional(),
});

function setCorsHeaders(res: any, origin?: string) {
  const requestOrigin = origin || '*';
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }
  if (record.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - record.count };
}

function enrichRequirement(req: any, index: number) {
  return {
    id: req.id || `req-${Date.now()}-${index}`,
    jobId: req.jobId || '',
    category: req.category || 'document',
    title: req.title || 'Required Document',
    description: req.description || 'A required document for your permit',
    isRequired: req.isRequired ?? true,
    confidence: req.confidence || 0.8,
    status: 'pending',
    actionType: req.actionType || 'Fill out and upload',
    sourceUrl: req.sourceUrl || 'https://pinellas.gov/topic/building-development/permits/',
    minimumCriteria: req.minimumCriteria || 'Clear address, names, and signatures',
    whoCanHelp: req.whoCanHelp || 'County permit desk',
    plainLanguageWhy: req.plainLanguageWhy || 'The county needs this to review your job.',
    acceptedFormats: req.acceptedFormats || ['PDF', 'JPG', 'PNG'],
    allowsMultipleUploads: req.allowsMultipleUploads ?? false,
    goodUploadExample: req.goodUploadExample || 'Clear full-page image or PDF'
  };
}

function makeReq(id: number, category: string, title: string, description: string, why: string, sourceUrl: string, actionType: string, formats: string[]) {
  return {
    id: `req-${Date.now()}-${id}`,
    jobId: '',
    category,
    title,
    description,
    isRequired: true,
    confidence: 0.95,
    status: 'pending',
    actionType,
    sourceUrl,
    minimumCriteria: 'Complete and legible',
    whoCanHelp: 'County permit desk (727) 464-3888',
    plainLanguageWhy: why,
    acceptedFormats: formats,
    allowsMultipleUploads: false,
    goodUploadExample: 'Clear full-page scan or photo'
  };
}

function getJobSpecificFallbacks(jobType: string, data: any): any[] {
  // Use jurisdiction-specific portal URL if available, otherwise default to Pinellas County
  const portalUrl = data.jurisdictionPortal || 'https://aca-prod.accela.com/pinellas/Default.aspx';
  const deskPhone = data.jurisdictionPhone || '(727) 464-3888';
  const permitApp = makeReq(1, 'document', 'Permit Application', 'Completed building permit application form for your jurisdiction', 'This is the official form that starts your permit review. The county cannot process your job without it.', portalUrl, 'Download from your jurisdiction portal, fill out, and upload', ['PDF']);
  const contractorLicense = makeReq(2, 'license', 'Contractor License', 'Valid Florida state contractor license (certified or registered)', 'Florida law requires all permit work to be done by a licensed contractor. The county verifies this before approving your permit.', 'https://www.myfloridalicense.com/wl11.asp', 'Upload a copy of your license — verify it is Active at myfloridalicense.com', ['PDF', 'JPG', 'PNG']);
  const insurance = makeReq(3, 'insurance', 'Certificate of Insurance', 'General liability insurance certificate showing active coverage during the project period', 'The county requires proof of insurance to protect the homeowner and the public in case of accidents during the permitted work.', portalUrl, 'Request from your insurance agent and upload', ['PDF']);
  const nocForm = makeReq(4, 'document', 'Notice of Commencement', 'Recorded Notice of Commencement (NOC) from Pinellas County Clerk — required for jobs over $2,500 (Florida Statute 713.13)', 'Florida law requires a Notice of Commencement to be recorded BEFORE work begins on jobs over $2,500. This protects the homeowner from contractor liens.', 'https://www.mypinellasclerk.gov', 'Record with Clerk of Court online or in person, then upload a certified copy', ['PDF']);

  switch (jobType) {
    case 'RE_ROOFING':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Roof Plan / Sketch', 'Simple scale drawing showing roof dimensions, slope, and material type', 'The county reviewer needs to see the roof layout to verify code compliance for your specific roof type and slope.', 'https://pinellas.gov/topic/building-development/permits/', 'Draw or have your contractor prepare a simple sketch', ['PDF', 'JPG', 'PNG']),
        makeReq(6, 'document', 'Manufacturer Product Approval', 'Florida Product Approval (NOA) sheets for the roofing material being installed', 'Florida Building Code requires all roofing materials to have a state-approved product approval number. This proves your materials meet hurricane wind standards.', 'https://floridabuilding.org/pr/pr_app_srch.aspx', 'Download from Florida Building Commission website and upload', ['PDF']),
        contractorLicense,
        insurance,
        nocForm,
      ];
    case 'ROOF_REPAIR':
      return [
        permitApp,
        makeReq(5, 'document', 'Scope of Work', 'Written description of the repair: what is damaged, what will be replaced, and materials used', 'The county needs to know the extent of the repair to determine if a full re-roof permit is required instead.', 'https://pinellas.gov/topic/building-development/permits/', 'Write a brief description and upload', ['PDF', 'JPG', 'PNG']),
        contractorLicense,
        insurance,
      ];
    case 'AC_HVAC_CHANGEOUT':
      return [
        permitApp,
        makeReq(5, 'document', 'Equipment Specifications Sheet', 'Manufacturer spec sheet for the new AC/HVAC unit showing model number, tonnage, SEER rating, and dimensions', 'The county must verify the new equipment meets Florida energy efficiency codes and that the electrical service can handle the load.', 'https://pinellas.gov/topic/building-development/permits/', 'Get from equipment supplier and upload', ['PDF']),
        makeReq(6, 'drawing', 'Equipment Location Diagram', 'Simple diagram showing where the air handler and condenser unit will be located on the property', 'The county needs to verify setback distances from property lines and that the unit placement meets zoning requirements.', 'https://pinellas.gov/topic/building-development/permits/', 'Sketch or have contractor prepare a simple diagram', ['PDF', 'JPG', 'PNG']),
        contractorLicense,
        insurance,
      ];
    case 'WATER_HEATER': {
      const reqs: any[] = [
        permitApp,
        makeReq(5, 'document', 'Water Heater Specifications', `Spec sheet for the new ${data.isTankless ? 'tankless' : 'tank'} water heater showing model, capacity, and ${data.isGas ? 'BTU rating' : 'wattage'}`, `The county verifies the new unit meets Florida energy codes and that the ${data.isGas ? 'gas line and venting' : 'electrical circuit'} is properly sized.`, 'https://pinellas.gov/topic/building-development/permits/', 'Get from supplier and upload', ['PDF']),
        contractorLicense,
        insurance,
      ];
      if (data.isGas) {
        reqs.splice(2, 0, makeReq(7, 'inspection', 'Gas Line Inspection', 'Inspection of the gas line connection and venting by a licensed plumbing inspector', 'All gas appliance connections must be inspected to prevent gas leaks and carbon monoxide hazards.', 'https://pinellas.gov/topic/building-development/permits/', 'Schedule with county after installation', ['N/A']));
      }
      return reqs;
    }
    case 'ELECTRICAL_PANEL':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Electrical Load Calculation', 'Load calculation worksheet showing existing and new electrical loads to verify the panel size is adequate', "The county electrical inspector needs to verify the new panel amperage is correct for your home's electrical load. This prevents overloading and fire hazards.", 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF']),
        makeReq(6, 'document', 'Panel Specifications', 'Manufacturer spec sheet for the new electrical panel showing brand, model, and amperage rating', 'The county verifies the panel meets UL listing requirements and Florida Building Code.', 'https://pinellas.gov/topic/building-development/permits/', 'Get from electrical supplier and upload', ['PDF']),
        contractorLicense,
        insurance,
        makeReq(7, 'inspection', 'Rough-In Electrical Inspection', 'Inspection of wiring before walls are closed — required before energizing the new panel', 'Florida Building Code requires an inspection before the panel is energized to prevent electrical fires and shock hazards.', 'https://pinellas.gov/topic/building-development/permits/', 'Schedule with county after rough-in work is complete', ['N/A']),
      ];
    case 'ELECTRICAL_REWIRING':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Electrical Plan', 'Diagram showing the circuits being rewired, panel location, and new outlet/switch locations', 'The county needs to see the scope of rewiring to verify code compliance and schedule the correct inspections.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF', 'JPG']),
        makeReq(6, 'drawing', 'Load Calculation', 'Electrical load calculation to verify panel capacity for the rewired circuits', 'Required to ensure the panel can safely handle the new wiring without tripping breakers or causing fire hazards.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF']),
        contractorLicense,
        insurance,
      ];
    case 'EV_CHARGER':
      return [
        permitApp,
        makeReq(5, 'document', 'Charger Specifications', 'Manufacturer spec sheet for the EV charger showing model, amperage (Level 1 or Level 2), and UL listing', 'The county verifies the charger meets safety standards and that the electrical circuit is properly sized for the charger amperage.', 'https://pinellas.gov/topic/building-development/permits/', 'Get from charger manufacturer or installer', ['PDF']),
        makeReq(6, 'drawing', 'Electrical Circuit Diagram', 'Simple diagram showing the new dedicated circuit from the panel to the charger location', 'The county needs to verify the circuit is properly sized (typically 50A for Level 2) and that the panel has capacity.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF', 'JPG']),
        contractorLicense,
        insurance,
      ];
    case 'GENERATOR_INSTALL':
      return [
        permitApp,
        makeReq(5, 'document', 'Generator Specifications', 'Manufacturer spec sheet for the generator showing model, wattage, fuel type, and transfer switch type', 'The county verifies the generator and transfer switch meet Florida Building Code and that the electrical connection is safe.', 'https://pinellas.gov/topic/building-development/permits/', 'Get from generator supplier', ['PDF']),
        makeReq(6, 'drawing', 'Site Plan', 'Simple drawing showing generator placement on the property with distances from property lines and the house', 'Generators must meet setback requirements from property lines and windows/doors due to carbon monoxide exhaust.', 'https://pinellas.gov/topic/building-development/permits/', 'Sketch the property layout with measurements', ['PDF', 'JPG']),
        makeReq(7, 'drawing', 'Transfer Switch Diagram', "Wiring diagram showing how the transfer switch connects the generator to the home's electrical panel", 'Required to prevent back-feeding electricity onto the utility grid, which is a serious safety hazard for utility workers.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF']),
        contractorLicense,
        insurance,
      ];
    case 'PLUMBING_MAIN_LINE':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Plumbing Diagram', 'Diagram showing the main line location, depth, pipe material, and connection points', 'The county needs to verify the pipe material and depth meet code, and that the connection to the public system is done correctly.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your plumber prepare this', ['PDF', 'JPG']),
        contractorLicense,
        insurance,
        makeReq(7, 'inspection', 'Trench Inspection', 'Inspection of the pipe in the trench before backfilling — must be done before covering the pipe', 'The county must inspect the pipe before it is buried to verify depth, material, and connections are correct.', 'https://pinellas.gov/topic/building-development/permits/', 'Schedule with county before backfilling', ['N/A']),
      ];
    case 'SMALL_BATH_REMODEL':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Plumbing Layout', 'Drawing showing existing and new fixture locations — required if moving any plumbing', 'If you are moving a toilet, sink, or shower drain, the county needs to verify the new drain locations meet code.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your plumber sketch the layout', ['PDF', 'JPG']),
        makeReq(6, 'document', 'Scope of Work', 'Written description of all work being done: demo, plumbing, electrical, tile, fixtures', 'The county uses this to determine which trade inspections are required (plumbing, electrical, or both).', 'https://pinellas.gov/topic/building-development/permits/', 'Write a brief description and upload', ['PDF', 'JPG']),
        contractorLicense,
        insurance,
      ];
    case 'KITCHEN_REMODEL':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Floor Plan', 'Scale drawing of the kitchen showing existing and new cabinet, appliance, and fixture locations', 'The county needs to verify new appliance locations meet code for ventilation, gas connections, and electrical circuits.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your contractor prepare this', ['PDF', 'JPG']),
        makeReq(6, 'drawing', 'Electrical Plan', 'Diagram showing new or modified circuits for appliances (range, dishwasher, refrigerator, microwave)', 'Kitchen appliances require dedicated circuits. The county verifies these are properly sized to prevent overloads.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your electrician prepare this', ['PDF']),
        contractorLicense,
        insurance,
        nocForm,
      ];
    case 'WINDOW_DOOR_REPLACEMENT':
      return [
        permitApp,
        makeReq(5, 'document', 'Florida Product Approval (NOA)', 'Florida Product Approval sheets for each window/door model being installed', 'Florida Building Code requires all windows and doors to have a state-approved impact rating for hurricane protection. This is especially important in Pinellas County.', 'https://floridabuilding.org/pr/pr_app_srch.aspx', 'Download from Florida Building Commission website for each product', ['PDF']),
        makeReq(6, 'drawing', 'Window/Door Schedule', 'List of all windows and doors being replaced with their sizes, locations, and product approval numbers', 'The county reviewer needs to verify each opening has the correct impact-rated product installed.', 'https://pinellas.gov/topic/building-development/permits/', 'Create a simple table listing each window/door', ['PDF', 'JPG']),
        contractorLicense,
        insurance,
      ];
    case 'SIDING_EXTERIOR':
      return [
        permitApp,
        makeReq(5, 'document', 'Product Approval / Specifications', 'Florida Product Approval for the siding material showing wind resistance rating', 'Pinellas County is in a high-velocity hurricane zone. All exterior cladding must meet wind load requirements.', 'https://floridabuilding.org/pr/pr_app_srch.aspx', 'Get from siding manufacturer and upload', ['PDF']),
        contractorLicense,
        insurance,
      ];
    case 'DECK_INSTALLATION':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Site Plan', 'Drawing of the property showing the deck location, dimensions, and distances from property lines and the house', 'Decks must meet setback requirements from property lines. The county needs to verify your deck is in a permitted location.', 'https://pinellas.gov/topic/building-development/permits/', 'Sketch the property with the deck location and measurements', ['PDF', 'JPG']),
        makeReq(6, 'drawing', 'Construction Plans', `Structural drawings showing deck framing, post sizes, beam sizes, joist spacing, and ${data.deckHeight === 'over-30in' ? 'railing details (required for decks over 30 inches)' : 'connection to house'}`, 'The county structural reviewer needs to verify the deck framing can safely support the required loads.', 'https://pinellas.gov/topic/building-development/permits/', 'Have a contractor or engineer prepare these drawings', ['PDF']),
        contractorLicense,
        insurance,
        nocForm,
      ];
    case 'FENCE_INSTALLATION':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Site Plan / Survey', "Copy of your property survey showing property lines, with the proposed fence location drawn on it", "The county needs to verify the fence is on your property and not on a neighbor's land or in a utility easement.", 'https://pinellas.gov/topic/building-development/permits/', 'Use your property survey (from when you bought the house) and mark the fence location', ['PDF', 'JPG']),
        makeReq(6, 'document', 'Fence Specifications', 'Description of fence: height, material, and post spacing', 'The county verifies the fence height meets zoning rules for your property location (front yard vs back yard have different height limits in Pinellas County).', 'https://pinellas.gov/topic/building-development/permits/', 'Write a brief description with measurements', ['PDF', 'JPG']),
        makeReq(7, 'document', 'HOA Approval (if applicable)', 'Written approval from your HOA if your neighborhood has a homeowners association', 'Many HOAs have additional rules about fence materials and colors beyond what the county requires. Get HOA approval before starting.', 'https://pinellas.gov/topic/building-development/permits/', 'Contact your HOA and upload their written approval', ['PDF', 'JPG', 'PNG']),
      ];
    case 'POOL_BARRIER':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Pool Barrier Plan', 'Drawing showing the pool barrier/fence layout, gate locations, and distances from pool edge', 'Florida law requires pool barriers to meet specific height and latch requirements to prevent child drowning. The county verifies compliance.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your contractor prepare this drawing', ['PDF', 'JPG']),
        contractorLicense,
        insurance,
      ];
    case 'ROOM_ADDITION':
      return [
        permitApp,
        makeReq(5, 'drawing', 'Architectural Plans', 'Full set of architectural drawings showing floor plan, elevations, and cross-sections of the addition', 'Room additions require a full plan review to verify structural integrity, energy code compliance, and zoning setbacks.', 'https://pinellas.gov/topic/building-development/permits/', 'Hire an architect or designer to prepare these', ['PDF']),
        makeReq(6, 'drawing', 'Site Plan', 'Survey or drawing showing the property with the addition footprint and all setback dimensions', 'The county must verify the addition meets zoning setback requirements from property lines.', 'https://pinellas.gov/topic/building-development/permits/', 'Have your contractor or surveyor prepare this', ['PDF', 'JPG']),
        makeReq(7, 'drawing', 'Structural Calculations', 'Engineering calculations for foundation, framing, and any structural elements', 'Room additions require structural engineering review to ensure the new structure can safely support the required loads.', 'https://pinellas.gov/topic/building-development/permits/', 'Hire a structural engineer to prepare these', ['PDF']),
        contractorLicense,
        insurance,
        nocForm,
      ];
    case 'FOUNDATION_REPAIR':
      return [
        permitApp,
        makeReq(5, 'document', 'Engineering Report', 'Structural engineering report describing the foundation problem and the proposed repair method', 'Foundation repairs require an engineer to assess the problem and specify the correct repair method. The county reviews this for code compliance.', 'https://pinellas.gov/topic/building-development/permits/', 'Hire a structural engineer to prepare this report', ['PDF']),
        makeReq(6, 'drawing', 'Repair Drawings', 'Engineering drawings showing the repair details, materials, and dimensions', 'The county inspector needs these drawings to verify the repair is done correctly during inspection.', 'https://pinellas.gov/topic/building-development/permits/', 'Your structural engineer will prepare these with the report', ['PDF']),
        contractorLicense,
        insurance,
        nocForm,
      ];
    default:
      return [permitApp, contractorLicense, insurance];
  }
}

function getJobEstimates(jobType: string): { estimatedCost: string; estimatedTimeline: string } {
  const estimates: Record<string, { cost: string; timeline: string }> = {
    RE_ROOFING: { cost: '$75-$150', timeline: '3-7 business days' },
    ROOF_REPAIR: { cost: '$50-$100', timeline: '2-5 business days' },
    AC_HVAC_CHANGEOUT: { cost: '$85-$150', timeline: '3-7 business days' },
    WATER_HEATER: { cost: '$60-$100', timeline: '2-5 business days' },
    ELECTRICAL_PANEL: { cost: '$75-$150', timeline: '5-10 business days' },
    ELECTRICAL_REWIRING: { cost: '$150-$400', timeline: '7-14 business days' },
    EV_CHARGER: { cost: '$75-$125', timeline: '3-7 business days' },
    GENERATOR_INSTALL: { cost: '$150-$300', timeline: '5-10 business days' },
    PLUMBING_MAIN_LINE: { cost: '$100-$250', timeline: '5-10 business days' },
    SMALL_BATH_REMODEL: { cost: '$150-$350', timeline: '7-14 business days' },
    KITCHEN_REMODEL: { cost: '$300-$800', timeline: '10-21 business days' },
    WINDOW_DOOR_REPLACEMENT: { cost: '$60-$120', timeline: '3-7 business days' },
    SIDING_EXTERIOR: { cost: '$150-$300', timeline: '5-10 business days' },
    DECK_INSTALLATION: { cost: '$150-$400', timeline: '7-14 business days' },
    FENCE_INSTALLATION: { cost: '$75-$150', timeline: '3-7 business days' },
    POOL_BARRIER: { cost: '$50-$100', timeline: '2-5 business days' },
    ROOM_ADDITION: { cost: '$800-$2,500+', timeline: '30-90 business days' },
    FOUNDATION_REPAIR: { cost: '$300-$800', timeline: '10-21 business days' },
  };
  const est = estimates[jobType] || { cost: '$100-$300', timeline: '5-10 business days' };
  return { estimatedCost: est.cost, estimatedTimeline: est.timeline };
}

// ─── Verified Pinellas County Building Department Data (March 2026) ─────────
// Source: https://pinellas.gov/building-departments-in-pinellas-county/
// Fee schedule: FY25 BDRS fees effective Oct 1, 2024
// Florida Building Code: 8th Edition (2023) — current as of March 2026
const JURISDICTION_PORTALS: Record<string, { portal: string; phone: string; address: string }> = {
  PINELLAS_COUNTY: { portal: 'https://aca-prod.accela.com/pinellas/Default.aspx', phone: '(727) 464-3888', address: '440 Court Street, Clearwater, FL 33756' },
  ST_PETERSBURG:   { portal: 'https://www.stpete.org/business/building_permitting/building_permits.php', phone: '(727) 893-7231', address: 'One 4th Street N, St. Petersburg, FL 33701' },
  CLEARWATER:      { portal: 'https://aca-prod.accela.com/CLEARWATER/Default.aspx', phone: '(727) 562-4567', address: '2741 State Road 580, Clearwater, FL 33761' },
  LARGO:           { portal: 'https://www.largo.com/building_services/index.php', phone: '(727) 586-7488', address: '201 Highland Ave, Largo, FL 33770' },
  DUNEDIN:         { portal: 'https://www.dunedin.gov/City-Services/Business-Development/Building-Codes-Permits-Construction', phone: '(727) 298-3210', address: '737 Louden Avenue, Dunedin, FL 34698' },
  TARPON_SPRINGS:  { portal: 'https://www.ctsfl.us/309/GoPost-Online-Permit-Application-Portal', phone: '(727) 942-5617', address: '324 East Pine Street, Tarpon Springs, FL 34689' },
  SEMINOLE:        { portal: 'https://myseminole.com/website/building.html', phone: '(727) 392-1966', address: '9199 113th Street, Seminole, FL 33772' },
  PINELLAS_PARK:   { portal: 'https://www.pinellas-park.com/1981/Applying-for-a-Permit', phone: '(727) 369-5647', address: '6051 78th Avenue N, Pinellas Park, FL 33781' },
  GULFPORT:        { portal: 'https://mygulfport.us/community-development/', phone: '(727) 893-1024', address: '5330 23rd Ave S, Gulfport, FL 33707' },
  ST_PETE_BEACH:   { portal: 'https://www.stpetebeach.org/200/Building-Permitting', phone: '(727) 367-2735', address: '155 Corey Hall, St. Pete Beach, FL 33706' },
  TREASURE_ISLAND: { portal: 'https://mytreasureisland.org/building_department/index.php', phone: '(727) 547-4575', address: '10451 Gulf Blvd, Treasure Island, FL 33706' },
  MADEIRA_BEACH:   { portal: 'https://madeirabeachfl.gov/building-department/', phone: '(727) 391-9951', address: '300 Municipal Drive, Madeira Beach, FL 33708' },
  INDIAN_SHORES:   { portal: 'https://myindianshores.com/2229/Building-Department', phone: '(727) 474-7786', address: '19305 Gulf Blvd, Indian Shores, FL 33785' },
  SOUTH_PASADENA:  { portal: 'https://mysouthpasadena.com/government/departments/community_improvement', phone: '(727) 343-4192', address: '6940 Hibiscus Avenue, South Pasadena, FL 33707' },
  BELLEAIR:        { portal: 'https://townofbelleair.com/401/Building', phone: '(727) 588-1477', address: '901 Ponce de Leon Blvd, Belleair, FL 33756' },
  PALM_HARBOR:     { portal: 'https://aca-prod.accela.com/pinellas/Default.aspx', phone: '(727) 464-3888', address: '440 Court Street, Clearwater, FL 33756' },
};

const SYSTEM_PROMPT = `You are a permit requirements expert for Pinellas County, Florida.
Generate a precise, accurate list of permit requirements for a specific construction job.
Always use the jurisdiction-specific portal URL and phone number provided in the request context.

FLORIDA BUILDING CODE (FBC) — CURRENT EDITION:
- Florida Building Code, 8th Edition (2023) is the current adopted code statewide
- Roofing: FBC-Residential Chapter 9 / FBC-Building Chapter 15
- Electrical: FBC-Building Chapter 27 (adopts NEC 2020)
- Plumbing: Florida Plumbing Code (FPC) 8th Edition 2023
- Mechanical/HVAC: Florida Mechanical Code (FMC) 8th Edition 2023
- Energy: Florida Energy Conservation Code (FECC) 8th Edition 2023
- Pinellas County Coastal Construction Code applies to all coastal properties

PINELLAS COUNTY PERMIT RULES:
- Permit required for any work over $500 or requiring inspection (Pinellas County Ordinance)
- All permits: https://pinellas.gov/topic/building-development/permits/
- Forms & applications: https://pinellas.gov/forms-permit-applications-checklists/
- Express permits guide: https://pinellas.gov/express-permits/
- Inspection scheduling: (727) 453-4000 (cut-off 3:30pm for next-day)
- Permit validity: 6 months from issuance or last passed inspection
- Contractor license verification: https://www.pcclb.com (PCCLB) or https://www.myfloridalicense.com/wl11.asp (state)

EXPRESS PERMITS (same-day or next-day, no plan review required):
Building: Garage Door, Shutters, Siding/Soffit/Fascia, Windows/Doors (like-for-like)
Electrical: Service Change (1-2 Family), Pool Pump/Heat Pump, Recert/Restore Power
Gas: LP Gas Supplier, Gas Appliance Replacement, Natural Gas Water Heater Replacement, Conv. Electric to Gas Water Heater
Mechanical: A/C Equal Change Out (all subtypes), Duct Replacement, Furnace Change Out, Furnace with A/C
Plumbing: Water Heater Equal Change Out, Plumbing Fixture Replacement, Re-pipe Water Distribution, Tub-to-Shower, Walk-In Tub, Shower Pan, Water Softener
Roofing: Reroof Metal/Aluminum, Shingle and/or Flat, Tile

PERMITS REQUIRING PLAN REVIEW (standard review, 5-15 business days):
- Room additions, new construction
- Decks over 200 sq ft or over 30 inches high
- Electrical rewiring, new circuits, panel upgrades with service change
- Plumbing main line replacement
- Pool/spa installation
- Generator installation
- Foundation repair
- Kitchen remodel with structural changes

VERIFIED FEE SCHEDULE (FY25, effective Oct 1, 2024 — Pinellas County BDRS):
- Reroof: $180 for first 20 squares + $1.50/each additional square
- Water heater replacement: $85 flat
- Electrical service change (residential): $135 flat
- Electrical service change (commercial): $170 flat
- Windows/doors/shutters/garage doors: $145 per 20 openings; $5/each additional
- Solar PV system: $250 flat (includes plan review)
- Generator: $300 flat (all trades + plan review)
- Swimming pool/spa: $550 + $5.50/$1,000 over $40,000
- Demolition (residential): $225 / (commercial): $325
- Reinspection fee: $75
- After-the-fact permit: 2x normal permit fee
- Residential construction (valuation < $600K): $11.00 per $1,000; min $100/inspection
- Plan review: 25% of permit fee; min $125
Note: AC/HVAC, fence, deck, and other mechanical permits are based on project valuation.
Estimated AC changeout: $150-$350. Estimated fence: $100-$250. Estimated deck: $200-$600.
Other cities (St. Pete, Clearwater, Largo, etc.) have their own fee schedules — direct user to their portal.

NOTICE OF COMMENCEMENT (NOC):
- Required for ALL projects over $2,500 (Florida Statute 713.13)
- Must be recorded with Pinellas County Clerk BEFORE work begins
- Clerk's office: https://www.mypinellasclerk.gov
- NOC form: https://pinellas.gov/forms-permit-applications-checklists/
- Failure to record NOC can result in lien issues for the property owner

FLORIDA PRODUCT APPROVAL:
- Required for: roofing materials, windows, doors, impact shutters, exterior cladding
- Search: https://floridabuilding.org/pr/pr_app_srch.aspx
- Contractor must provide Product Approval Number on permit application
- Pinellas County is in a High-Velocity Hurricane Zone (HVHZ) — stricter wind ratings apply

ROOFING SPECIFIC RULES:
- 25% Rule: If repairs exceed 25% of total roof area, entire roof must meet current FBC
- Re-Roofing Affidavit required: https://pinellas.gov/forms-permit-applications-checklists/
- Roof work under $750 does NOT require a permit
- All roofing materials must have Florida Product Approval
- Pinellas County Roofing Inspection Policy: https://pinellas.gov/building-codes-county-policies/

FENCE RULES (Pinellas County Unincorporated):
- Fences under 6 feet do NOT require a building permit (but must comply with zoning)
- Fences over 6 feet DO require a permit
- Rear/side yard: max 6 feet; front yard: max 4 feet
- Pool barrier fences: must meet Florida Statute 515 (pool safety)
- Zoning code: Pinellas County Code Section 138-3702

CONTRACTOR LICENSING:
- All work must be done by a licensed Florida contractor
- PCCLB (Pinellas County): https://www.pcclb.com — (727) 464-3888
- State DBPR license lookup: https://www.myfloridalicense.com/wl11.asp
- License must be Active status to pull permits
- Owner-builder exemption: Florida Statute 489.103(7) — homeowners can pull their own permits

Return valid JSON only:
{
  "requirements": [
    {
      "category": "document|drawing|inspection|fee|license|insurance",
      "title": "Short clear title (max 5 words)",
      "description": "One sentence describing exactly what this document is",
      "isRequired": true,
      "actionType": "What the user must do to get this",
      "sourceUrl": "Direct URL to the form or resource — use jurisdiction-specific URL",
      "minimumCriteria": "What makes this document acceptable",
      "whoCanHelp": "Who can help the user get this (be specific with phone numbers)",
      "plainLanguageWhy": "One sentence explaining WHY this is needed in plain English",
      "acceptedFormats": ["PDF"],
      "allowsMultipleUploads": false,
      "goodUploadExample": "What a good upload looks like"
    }
  ],
  "estimatedCost": "Fee range in dollars — use verified fee schedule above",
  "estimatedTimeline": "Business days range — express permits: same-day to 1 day; plan review: 5-15 days",
  "confidenceScore": 0.9
}
RULES:
1. Be SPECIFIC to the job type — do not return generic requirements
2. Use the jurisdiction-specific portal URL from the request context
3. For express permits, explicitly state they can be obtained same-day online
4. Always include plain language explanations a contractor with limited experience can understand
5. Sort requirements in the order the contractor should complete them
6. Use verified fee amounts from the fee schedule above
7. Include the NOC requirement for any project over $2,500
8. For roofing, always mention Florida Product Approval requirement
9. For electrical, always mention PCCLB license requirement
10. For any coastal property, note HVHZ wind rating requirements`;

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  setCorsHeaders(res, origin);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers?.['x-user-id'] || req.socket?.remoteAddress || 'anonymous';
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) });
  }

  const validation = AnalyzeRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
  }

   const { jobType, jurisdiction, address, description, squareFootage, yearBuilt, ...jobAnswers } = validation.data;
  const estimates = getJobEstimates(jobType);
  const jurisdictionInfo = JURISDICTION_PORTALS[jurisdiction] || JURISDICTION_PORTALS.PINELLAS_COUNTY;

  // ── Bathroom remodel: permit NOT required if no plumbing/electrical/structural work ──
  if (
    jobType === 'SMALL_BATH_REMODEL' &&
    jobAnswers.bathMovingPlumbing === false &&
    jobAnswers.bathMovingElectric === false &&
    jobAnswers.bathStructural === false
  ) {
    return res.status(200).json({
      requirements: [
        {
          id: 'no-permit-required',
          jobId: '',
          category: 'document',
          title: 'No Permit Required for This Work',
          description: 'Based on your answers, this bathroom remodel does not require a permit in Pinellas County.',
          isRequired: false,
          confidence: 0.95,
          status: 'pending',
          actionType: 'Read',
          sourceUrl: 'https://pinellas.gov/express-permits/',
          plainLanguageWhy: 'In Pinellas County, replacing fixtures like toilets, sinks, tubs, and tile — without moving any pipes, wires, or walls — does not require a permit. This is called "like-for-like" replacement.',
          minimumCriteria: 'No plumbing lines moved, no electrical wiring changed, no walls removed or added.',
          whoCanHelp: 'If you are unsure, call the Pinellas County Building Department at (727) 464-3888 before starting work.',
          acceptedFormats: ['N/A'],
          goodUploadExample: '',
          permitNotRequired: true,
        },
      ],
      ...estimates,
      estimatedCost: '$0 — No permit fee',
      estimatedTimeline: 'No permit needed — start when ready',
      confidenceScore: 0.95,
      permitNotRequired: true,
      fallback: false,
      rateLimit,
    });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      requirements: getJobSpecificFallbacks(jobType, { ...jobAnswers, jurisdictionPortal: jurisdictionInfo.portal, jurisdictionPhone: jurisdictionInfo.phone }),
      ...estimates,
      confidenceScore: 0.85,
      fallback: true,
      rateLimit
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const jurisdictionData = JURISDICTION_PORTALS[jurisdiction] || JURISDICTION_PORTALS.PINELLAS_COUNTY;
    const userPrompt = [
      `Job Type: ${jobType}`,
      `Jurisdiction: ${jurisdiction}`,
      `Jurisdiction Portal URL: ${jurisdictionData.portal}`,
      `Jurisdiction Phone: ${jurisdictionData.phone}`,
      `Jurisdiction Address: ${jurisdictionData.address}`,
      `Address: ${address}`,
      description ? `Additional Details: ${description}` : '',
      squareFootage ? `Square Footage: ${squareFootage}` : '',
      yearBuilt ? `Year Built: ${yearBuilt}` : '',
      jobAnswers.buildingType ? `Building Type: ${jobAnswers.buildingType}` : '',
      jobAnswers.isAlteringShape !== undefined ? `Altering Roof Shape: ${jobAnswers.isAlteringShape}` : '',
      jobAnswers.isTankless !== undefined ? `Tankless Water Heater: ${jobAnswers.isTankless}` : '',
      jobAnswers.isGas !== undefined ? `Gas Fuel Type: ${jobAnswers.isGas}` : '',
      jobAnswers.deckHeight ? `Deck Height: ${jobAnswers.deckHeight}` : '',
      jobAnswers.isAttached !== undefined ? `Deck Attached to House: ${jobAnswers.isAttached}` : '',
      jobAnswers.fenceHeight ? `Fence Height: ${jobAnswers.fenceHeight}` : '',
      jobAnswers.fenceMaterial ? `Fence Material: ${jobAnswers.fenceMaterial}` : '',
      jobAnswers.panelAmps ? `Panel Amperage: ${jobAnswers.panelAmps}` : '',
      jobAnswers.hvacTonnage ? `HVAC Tonnage: ${jobAnswers.hvacTonnage}` : '',
    ].filter(Boolean).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);
    const requirements = Array.isArray(result.requirements)
      ? result.requirements.map((r: any, i: number) => enrichRequirement(r, i))
      : getJobSpecificFallbacks(jobType, jobAnswers);

    return res.status(200).json({
      requirements,
      estimatedTimeline: result.estimatedTimeline || estimates.estimatedTimeline,
      estimatedCost: result.estimatedCost || estimates.estimatedCost,
      confidenceScore: result.confidenceScore || 0.85,
      fallback: false,
      rateLimit
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(200).json({
      requirements: getJobSpecificFallbacks(jobType, jobAnswers),
      ...estimates,
      confidenceScore: 0.8,
      fallback: true,
      rateLimit
    });
  }
}
