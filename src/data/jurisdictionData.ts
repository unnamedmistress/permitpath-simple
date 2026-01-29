/**
 * Jurisdiction determination for Pinellas County permit submission
 * Helps users know WHERE to submit their permit application
 */

export interface BuildingDepartment {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  fax?: string;
  email?: string;
  website?: string;
  onlinePortal?: string;
  hours: string;
  walkInAvailable: boolean;
  notes?: string;
}

// St. Petersburg Building Department
export const ST_PETE_BUILDING_DEPT: BuildingDepartment = {
  name: "St. Petersburg Construction Services & Permitting Division",
  address: "Municipal Services Center (MSC), One 4th Street North",
  city: "St. Petersburg",
  zipCode: "33701",
  phone: "(727) 893-7231",
  fax: "(727) 893-7884",
  email: "permits@stpete.org",
  website: "https://www.stpete.org/business/building_permitting/building_permits.php",
  onlinePortal: "https://stpe-egov.aspgov.com/Click2GovBP/index.html",
  hours: "Monday, Tuesday, Thursday, Friday: 8:00 AM - 4:00 PM | Wednesday: 8:00 AM - 12:00 PM",
  walkInAvailable: true,
  notes: "Last customer taken 30 minutes before closing. ePlan Help Desk: (727) 893-7230"
};

// Pinellas County Building Services (Unincorporated areas)
export const PINELLAS_COUNTY_BUILDING: BuildingDepartment = {
  name: "Pinellas County Building Services",
  address: "400 South Fort Harrison Avenue, 2nd Floor",
  city: "Clearwater",
  zipCode: "33756",
  phone: "(727) 464-3207",
  fax: "(727) 464-3448",
  email: "building@pinellas.gov",
  website: "https://pinellas.gov/topic/building-development/permits/",
  onlinePortal: "https://aca-prod.accela.com/pinellas/Default.aspx",
  hours: "Monday - Friday: 8:00 AM - 5:00 PM",
  walkInAvailable: true,
  notes: "TTY: (727) 464-4062"
};

// Other major cities in Pinellas County
export const CLEARWATER_BUILDING_DEPT: BuildingDepartment = {
  name: "Clearwater Building Services",
  address: "100 S Myrtle Avenue",
  city: "Clearwater",
  zipCode: "33756",
  phone: "(727) 562-4980",
  website: "https://www.myclearwater.com/Business-Development/Permits-and-Inspections",
  onlinePortal: "https://www.myclearwater.com/Business-Development/Permits-and-Inspections/02-Get-A-Building-Permit-Apply-Online",
  hours: "Monday - Friday: 8:00 AM - 5:00 PM",
  walkInAvailable: true
};

export const LARGO_BUILDING_DEPT: BuildingDepartment = {
  name: "Largo Building Division",
  address: "201 Highland Avenue",
  city: "Largo",
  zipCode: "33770",
  phone: "(727) 587-6750",
  website: "https://www.largo.com/building/",
  hours: "Monday - Friday: 7:30 AM - 4:30 PM",
  walkInAvailable: true
};

export const PINELLAS_PARK_BUILDING_DEPT: BuildingDepartment = {
  name: "Pinellas Park Development Services",
  address: "5141 78th Avenue North",
  city: "Pinellas Park",
  zipCode: "33781",
  phone: "(727) 369-5764",
  website: "https://www.pinellas-park.com/departments/development_services/",
  hours: "Monday - Friday: 7:30 AM - 4:00 PM",
  walkInAvailable: true
};

export const TARPON_SPRINGS_BUILDING_DEPT: BuildingDepartment = {
  name: "Tarpon Springs Building Department",
  address: "324 Pine Street",
  city: "Tarpon Springs",
  zipCode: "34689",
  phone: "(727) 942-5635",
  website: "https://www.ctsfl.us/building-department",
  hours: "Monday - Friday: 8:00 AM - 4:30 PM",
  walkInAvailable: true
};

export const DUNEDIN_BUILDING_DEPT: BuildingDepartment = {
  name: "Dunedin Building Department",
  address: "542 Main Street",
  city: "Dunedin",
  zipCode: "34698",
  phone: "(727) 298-3021",
  website: "https://www.dunedinfl.net/building/",
  hours: "Monday - Friday: 8:00 AM - 5:00 PM",
  walkInAvailable: true
};

// Map of city names to building departments
export const CITY_BUILDING_DEPARTMENTS: Record<string, BuildingDepartment> = {
  "St. Petersburg": ST_PETE_BUILDING_DEPT,
  "St Petersburg": ST_PETE_BUILDING_DEPT,
  "Saint Petersburg": ST_PETE_BUILDING_DEPT,
  "Clearwater": CLEARWATER_BUILDING_DEPT,
  "Largo": LARGO_BUILDING_DEPT,
  "Pinellas Park": PINELLAS_PARK_BUILDING_DEPT,
  "Tarpon Springs": TARPON_SPRINGS_BUILDING_DEPT,
  "Dunedin": DUNEDIN_BUILDING_DEPT
  // Add more cities as needed
};

/**
 * Determines the building department based on city name from address
 * Falls back to Pinellas County for unincorporated areas
 */
export function getBuildingDepartment(address?: string): BuildingDepartment {
  if (!address) {
    // Default to Pinellas County if no address provided
    return PINELLAS_COUNTY_BUILDING;
  }
  
  // Normalize address to uppercase for comparison
  const normalizedAddress = address.toUpperCase();
  
  // Check each city
  for (const [cityName, department] of Object.entries(CITY_BUILDING_DEPARTMENTS)) {
    if (normalizedAddress.includes(cityName.toUpperCase())) {
      return department;
    }
  }
  
  // Default to Pinellas County for unincorporated areas
  return PINELLAS_COUNTY_BUILDING;
}

/**
 * Generates a Google Maps link for the building department
 */
export function getBuildingDepartmentMapLink(dept: BuildingDepartment): string {
  const fullAddress = `${dept.address}, ${dept.city}, FL ${dept.zipCode}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
}

/**
 * Helper to format phone number for tel: links
 */
export function formatPhoneLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9]/g, '')}`;
}
