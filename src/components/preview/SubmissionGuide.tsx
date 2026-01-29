import { MapPin, Phone, Mail, Globe, Clock, ExternalLink } from "lucide-react";
import { BuildingDepartment, getBuildingDepartmentMapLink, formatPhoneLink } from "@/data/jurisdictionData";

interface SubmissionGuideProps {
  department: BuildingDepartment;
  address?: string;
}

export default function SubmissionGuide({ department, address }: SubmissionGuideProps) {
  const mapLink = getBuildingDepartmentMapLink(department);

  return (
    <section>
      <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
        <MapPin size={16} className="text-primary" />
        Where to Submit Your Permit
      </h3>

      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        {/* Location Header */}
        <div>
          {address && (
            <p className="text-xs text-muted-foreground mb-1">
              📍 Your Location: {address}
            </p>
          )}
          <h4 className="font-semibold text-base text-foreground">
            {department.name}
          </h4>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-foreground hover:text-primary transition-colors group"
          >
            <MapPin size={16} className="text-muted-foreground mt-0.5 group-hover:text-primary" />
            <div className="flex-1">
              <p>{department.address}</p>
              <p>
                {department.city}, FL {department.zipCode}
              </p>
              <span className="text-xs text-primary">
                View on Google Maps <ExternalLink size={10} className="inline" />
              </span>
            </div>
          </a>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-2 border-t border-border">
          {/* Phone */}
          <a
            href={formatPhoneLink(department.phone)}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Phone size={16} className="text-muted-foreground" />
            <span>{department.phone}</span>
          </a>

          {/* Email */}
          {department.email && (
            <a
              href={`mailto:${department.email}`}
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <Mail size={16} className="text-muted-foreground" />
              <span>{department.email}</span>
            </a>
          )}

          {/* Website */}
          {department.website && (
            <a
              href={department.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
            >
              <Globe size={16} className="text-muted-foreground" />
              <span className="truncate">Website</span>
              <ExternalLink size={12} className="text-muted-foreground" />
            </a>
          )}

          {/* Hours */}
          <div className="flex items-start gap-2 text-sm text-foreground">
            <Clock size={16} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Hours:</p>
              <p className="text-muted-foreground text-xs">{department.hours}</p>
            </div>
          </div>
        </div>

        {/* Online Portal */}
        {department.onlinePortal && (
          <div className="pt-2 border-t border-border">
            <a
              href={department.onlinePortal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <div>
                <p className="font-medium text-sm text-primary">Apply Online</p>
                <p className="text-xs text-muted-foreground">
                  Submit your permit application digitally
                </p>
              </div>
              <ExternalLink size={18} className="text-primary group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}

        {/* Walk-In Info */}
        {department.walkInAvailable && (
          <div className="bg-primary/5 rounded p-3">
            <p className="text-xs text-foreground">
              <strong>Walk-in Service Available:</strong> You can visit in person to submit your application. 
              {department.notes && <span className="text-muted-foreground"> {department.notes}</span>}
            </p>
          </div>
        )}

        {/* Additional Notes */}
        {department.notes && !department.walkInAvailable && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> {department.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
