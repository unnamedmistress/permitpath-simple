import { useState, useRef, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { cn } from "@/lib/utils";

export interface AddressResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  components: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface AddressAutocompleteProps {
  onSelect: (result: AddressResult) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  onSelect,
  defaultValue = "",
  placeholder = "Enter your property address...",
  className,
}: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry", "address_components"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      setIsSearching(false);
      const comps = place.address_components || [];
      const get = (type: string) =>
        comps.find((c) => c.types.includes(type))?.long_name || "";
      const getShort = (type: string) =>
        comps.find((c) => c.types.includes(type))?.short_name || "";

      const result: AddressResult = {
        formattedAddress: place.formatted_address || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        components: {
          street: `${get("street_number")} ${get("route")}`.trim(),
          city: get("locality") || get("sublocality"),
          state: getShort("administrative_area_level_1"),
          zip: get("postal_code"),
        },
      };

      setInputValue(result.formattedAddress);
      onSelect(result);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onSelect]);

  if (loadError) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        Address search unavailable. Please enter your address manually.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsSearching(true); }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-border rounded-xl text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors bg-card"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        )}
      </div>
      {!isLoaded && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading address search...
        </p>
      )}
    </div>
  );
}
