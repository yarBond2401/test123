export type DayOfWeek = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

export interface ServiceInDB {
  id: string;
  description: string;
  locations?: (Record<string, string> & { id: string, radius?: number, lat?: number, lng?: number })[];
  location_zip?: {
    zip: number;
    radius: number;
    zip_list: number[];
    lat?: number;
    lng?: number;
  };
  location_nationwide?: boolean;
  generic_availability: Record<
    DayOfWeek,
    { open: number; close: number; closed: boolean }
  >;
}

export type LocationMode = "regional" | "geolocation" | "nationwide";

export interface ServiceInDBWithSubcollections extends ServiceInDB {
  services: (Record<string, string> & { id: string })[];
  locationMode: LocationMode;
}
