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
  const permitApp = makeReq(1, 'document', 'Permit Application', 'Completed Pinellas County building permit application form (BLD-100)', 'This is the official form that starts your permit review. The county cannot process your job without it.', 'https://pinellas.gov/wp-content/uploads/2023/06/BLD-100-Building-Permit-Application.pdf', 'Download, fill out, and upload', ['PDF']);
  const contractorLicense = makeReq(2, 'license', 'Contractor License', 'Valid Florida state contractor license (certified or registered)', 'Florida law requires all permit work to be done by a licensed contractor. The county verifies this before approving your permit.', 'https://www.myfloridalicense.com/wl11.asp', 'Upload a copy of your license', ['PDF', 'JPG', 'PNG']);
  const insurance = makeReq(3, 'insurance', 'Certificate of Insurance', 'General liability insurance certificate showing active coverage during the project period', 'The county requires proof of insurance to protect the homeowner and the public in case of accidents during the permitted work.', 'https://pinellas.gov/topic/building-development/permits/', 'Request from your insurance agent and upload', ['PDF']);
  const nocForm = makeReq(4, 'document', 'Notice of Commencement', 'Recorded Notice of Commencement (NOC) from Pinellas County Clerk — required for jobs over $2,500', 'Florida law requires a Notice of Commencement to be recorded before work begins on jobs over $2,500. This protects the homeowner from contractor liens.', 'https://www.pinellasclerk.org/services/recording/', 'Record with Clerk of Court, then upload a copy', ['PDF']);

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

const SYSTEM_PROMPT = `You are a permit requirements expert for Pinellas County, Florida. Generate
 a precise, accurate list of permit requirements for a specific construction job.

PINELLAS COUNTY PERMIT RULES:
- All permits: https://pinellas.gov/topic/building-development/permits/
- Online portal: https://epermitting.pinellascounty.org/
- Express permits (same-day): re-roofing, water heater, AC/HVAC changeout, window/door replacement, electrical panel upgrade (like-for-like)
- Permits requiring plan review: room additions, decks over 200 sqft, electrical rewiring, plumbing main line
- Jobs over $2,500 require a recorded Notice of Commencement (Florida Statute 713.13)
- Florida Product Approval (NOA) required for: roofing materials, windows, doors, exterior cladding
- All work must be done by a licensed Florida contractor
- Pinellas County is in a High-Velocity Hurricane Zone

JURISDICTION PORTALS:
- PINELLAS_COUNTY: https://epermitting.pinellascounty.org/ (727) 464-3888
- ST_PETERSBURG: https://stpetepermits.com (727) 893-7221
- CLEARWATER: https://www.myclearwater.com/government/city-departments/planning-development/building (727) 562-4567
- LARGO: https://www.largo.com/departments/development_services/building_inspections/index.php (727) 587-6710
- PALM_HARBOR: https://epermitting.pinellascounty.org/ (727) 464-3888

Return valid JSON only:
{
  "requirements": [
    {
      "category": "document|drawing|inspection|fee|license|insurance",
      "title": "Short clear title (max 5 words)",
      "description": "One sentence describing exactly what this document is",
      "isRequired": true,
      "actionType": "What the user must do to get this",
      "sourceUrl": "Direct URL to the form or resource",
      "minimumCriteria": "What makes this document acceptable",
      "whoCanHelp": "Who can help the user get this (be specific with phone numbers)",
      "plainLanguageWhy": "One sentence explaining WHY this is needed in plain English",
      "acceptedFormats": ["PDF"],
      "allowsMultipleUploads": false,
      "goodUploadExample": "What a good upload looks like"
    }
  ],
  "estimatedCost": "Fee range in dollars",
  "estimatedTimeline": "Business days range",
  "confidenceScore": 0.9
}

RULES:
1. Be SPECIFIC to the job type — do not return generic requirements
2. Include correct Pinellas County form URLs where possible
3. For express permits, note they can be obtained same-day
4. Always include plain language explanations a contractor can understand
5. Sort requirements in the order the contractor should complete them`;

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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      requirements: getJobSpecificFallbacks(jobType, jobAnswers),
      ...estimates,
      confidenceScore: 0.85,
      fallback: true,
      rateLimit
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const userPrompt = [
      `Job Type: ${jobType}`,
      `Jurisdiction: ${jurisdiction}`,
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
