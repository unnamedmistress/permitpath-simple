import { Camera, Check, X, AlertCircle } from "lucide-react";
import { JobType } from "@/types";

interface PhotoGuidelinesProps {
  jobType: JobType;
  inline?: boolean;
}

const PHOTO_REQUIREMENTS: Record<JobType, {
  requiredPhotos: string[];
  tips: string[];
  examples?: string[];
}> = {
  RE_ROOFING: {
    requiredPhotos: [
      "Wide shot showing entire roof from street level",
      "Close-up of damaged or deteriorated areas",
      "Attic/deck condition (if accessible)",
      "Existing flashing around chimneys and vents",
      "Photo of current roofing material and condition"
    ],
    tips: [
      "Take photos on a clear day for best lighting",
      "Include reference objects for scale",
      "Capture all four sides of the house if possible"
    ]
  },
  ROOF_REPAIR: {
    requiredPhotos: [
      "Close-up of damaged area",
      "Wide shot showing location on roof",
      "Interior damage (ceiling stains, water marks)",
      "Surrounding area context"
    ],
    tips: [
      "Mark the damaged area with chalk or tape if safe",
      "Show the full extent of damage"
    ]
  },
  AC_HVAC_CHANGEOUT: {
    requiredPhotos: [
      "Current outdoor unit (full view with serial number visible)",
      "Indoor air handler or furnace",
      "Electrical disconnect and wiring",
      "Existing ductwork condition"
    ],
    tips: [
      "Clean the data plate before photographing serial numbers",
      "Include the entire unit in frame"
    ]
  },
  WATER_HEATER: {
    requiredPhotos: [
      "Current water heater with data plate visible",
      "Installation location and clearances",
      "Venting configuration (gas units)",
      "Water and gas connections",
      "Drain pan and TPR valve"
    ],
    tips: [
      "Wipe data plate clean for legibility",
      "Show adequate working space around unit"
    ]
  },
  ELECTRICAL_PANEL: {
    requiredPhotos: [
      "Full panel face with door open showing all breakers",
      "Close-up of breaker labels and panel rating",
      "Service entrance and meter location",
      "Main disconnect",
      "Any visible damage or corrosion"
    ],
    tips: [
      "Never touch electrical components - photos only!",
      "Ensure photos are clear and in focus",
      "Photograph the rating label inside panel door"
    ]
  },
  ELECTRICAL_REWIRING: {
    requiredPhotos: [
      "Existing electrical panel with available space",
      "Areas where new wiring will be installed",
      "Outlet/switch locations to be modified",
      "Attic or crawl space access points"
    ],
    tips: [
      "Mark locations with painter's tape for reference",
      "Show wall/ceiling context for wire routing"
    ]
  },
  EV_CHARGER: {
    requiredPhotos: [
      "Proposed charger installation location",
      "Electrical panel with available space",
      "Distance from panel to charger location",
      "Mounting surface (wall, post, etc.)"
    ],
    tips: [
      "Measure and note distance from panel",
      "Show parking area and vehicle clearance"
    ]
  },
  GENERATOR_INSTALL: {
    requiredPhotos: [
      "Proposed generator location",
      "Electrical panel",
      "Gas meter and line location",
      "Clearances to windows, doors, property lines",
      "Existing concrete pad or proposed location"
    ],
    tips: [
      "Measure distances to all openings (windows/doors)",
      "Show relationship to property line"
    ]
  },
  PLUMBING_MAIN_LINE: {
    requiredPhotos: [
      "Cleanout access location",
      "Area to be excavated",
      "Connection point at street (if visible)",
      "Foundation penetration point",
      "Existing pipe condition (if exposed)"
    ],
    tips: [
      "Mark the line location if known",
      "Show landscape features that may be affected"
    ]
  },
  SMALL_BATH_REMODEL: {
    requiredPhotos: [
      "Current layout - wide shot from doorway",
      "Each fixture (toilet, sink, tub/shower)",
      "Electrical outlets and switches",
      "Ventilation fan",
      "Any visible plumbing or electrical issues"
    ],
    tips: [
      "Take before photos from multiple angles",
      "Photograph behind vanity if removing"
    ]
  },
  KITCHEN_REMODEL: {
    requiredPhotos: [
      "Overall kitchen layout (multiple angles)",
      "Existing cabinets and appliances",
      "Plumbing under sink",
      "Electrical outlets and panel",
      "Any walls to be removed or modified"
    ],
    tips: [
      "Create a visual walkthrough of the space",
      "Include ceiling if making changes to lighting"
    ]
  },
  WINDOW_DOOR_REPLACEMENT: {
    requiredPhotos: [
      "Each window/door opening (exterior and interior)",
      "Window frame and sill condition",
      "Existing product labels (if visible)",
      "Overall building elevation"
    ],
    tips: [
      "Measure and note opening dimensions",
      "Show surrounding siding/trim"
    ]
  },
  SIDING_EXTERIOR: {
    requiredPhotos: [
      "All sides of building to be sided",
      "Close-up of existing siding condition",
      "Areas of rot or damage",
      "Window and door trim details",
      "Soffit and fascia condition"
    ],
    tips: [
      "Photograph in good lighting",
      "Include foundation-to-roof shots"
    ]
  },
  DECK_INSTALLATION: {
    requiredPhotos: [
      "Proposed deck location",
      "House connection point",
      "Ground conditions and slope",
      "Relationship to property lines"
    ],
    tips: [
      "Show full area where deck will be built",
      "Include measurements to property boundaries"
    ]
  },
  FENCE_INSTALLATION: {
    requiredPhotos: [
      "Property corners and boundaries",
      "Proposed fence line",
      "Existing utilities or obstacles",
      "Gate locations"
    ],
    tips: [
      "Walk the entire fence line taking photos",
      "Mark corners with stakes or flags"
    ]
  },
  POOL_BARRIER: {
    requiredPhotos: [
      "Pool and surrounding area",
      "All sides of pool showing setbacks",
      "Existing barriers or structures",
      "Gate and latch locations"
    ],
    tips: [
      "Show full perimeter of pool area",
      "Include measuring tape for scale"
    ]
  },
  ROOM_ADDITION: {
    requiredPhotos: [
      "Exterior wall where addition will attach",
      "Interior of existing space",
      "Ground conditions at addition location",
      "Roof line and connection points",
      "Property setbacks (multiple angles)"
    ],
    tips: [
      "Document existing structure thoroughly",
      "Show relationship to property lines"
    ]
  },
  FOUNDATION_REPAIR: {
    requiredPhotos: [
      "Foundation cracks or damage (with measuring tape)",
      "Interior signs of settlement (wall cracks, door gaps)",
      "Exterior grade and drainage",
      "All sides of foundation",
      "Floor level variations"
    ],
    tips: [
      "Use a level or tape measure in photos",
      "Photograph cracks from multiple distances"
    ]
  },
};

const GENERAL_REQUIREMENTS = {
  formats: ["JPG", "PNG", "HEIC", "WebP"],
  maxSize: "10 MB per photo",
  maxCount: "10 photos per requirement",
  quality: "Clear, well-lit photos - avoid blurry images"
};

export default function PhotoGuidelines({ jobType, inline = false }: PhotoGuidelinesProps) {
  const guidelines = PHOTO_REQUIREMENTS[jobType];
  
  if (!guidelines) {
    return null;
  }

  if (inline) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <div className="flex items-start gap-2">
          <Camera size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1.5">
              Photos Needed ({guidelines.requiredPhotos.length})
            </p>
            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              {guidelines.requiredPhotos.slice(0, 3).map((photo, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{photo}</span>
                </li>
              ))}
              {guidelines.requiredPhotos.length > 3 && (
                <li className="text-blue-600 dark:text-blue-300 font-medium">
                  + {guidelines.requiredPhotos.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Camera size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Photo Requirements
          </h3>
          <p className="text-xs text-muted-foreground">
            Take clear photos of these items for your permit application
          </p>
        </div>
      </div>

      {/* General Requirements */}
      <div className="bg-muted rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold text-foreground mb-2">📋 General Guidelines</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-start gap-1.5">
            <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Formats</p>
              <p className="text-muted-foreground">{GENERAL_REQUIREMENTS.formats.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Max Size</p>
              <p className="text-muted-foreground">{GENERAL_REQUIREMENTS.maxSize}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Max Count</p>
              <p className="text-muted-foreground">{GENERAL_REQUIREMENTS.maxCount}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Quality</p>
              <p className="text-muted-foreground">Clear & well-lit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Photos */}
      <div>
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Camera size={14} />
          Required Photos ({guidelines.requiredPhotos.length})
        </h4>
        <div className="space-y-1.5">
          {guidelines.requiredPhotos.map((photo, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">{idx + 1}</span>
              </div>
              <p className="text-xs text-foreground flex-1">{photo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {guidelines.tips.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            💡 Pro Tips
          </h4>
          <div className="space-y-1.5">
            {guidelines.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-primary mt-0.5">•</span>
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5">
        <p className="text-xs text-warning-foreground">
          <strong>Note:</strong> Photos are for documentation purposes. The building department may request additional images during review.
        </p>
      </div>
    </div>
  );
}
