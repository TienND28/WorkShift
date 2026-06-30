const HCMC_CENTER = { lat: 10.8231, lng: 106.6297 };

export type GeocodeResult = {
  lat: number;
  lng: number;
  /** Mức độ khớp: ROOFTOP > RANGE_INTERPOLATED > GEOMETRIC_CENTER > APPROXIMATE */
  locationType?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | null = null;

export function getMapsApiKey(): string | undefined {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
}

export function getDefaultCoordinates() {
  return { ...HCMC_CENTER };
}

export function buildFullAddressQuery(
  address: string,
  locationLabel?: string,
): string {
  const parts = [address.trim(), locationLabel?.trim(), "Việt Nam"].filter(
    Boolean,
  );
  return parts.join(", ");
}

export function isAddressReadyForMap(
  address: string,
  provinceId: string,
  districtId: string,
  wardId: string,
): boolean {
  return Boolean(address.trim() && provinceId && districtId && wardId);
}

async function geocodeViaNominatim(
  query: string,
): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data[0]) return null;

  return {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
    locationType: "APPROXIMATE",
  };
}

async function geocodeViaGoogleRest(
  query: string,
): Promise<GeocodeResult | null> {
  const apiKey = getMapsApiKey();
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("region", "vn");
  url.searchParams.set("language", "vi");
  url.searchParams.set("components", "country:VN");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    results?: {
      geometry: {
        location: { lat: number; lng: number };
        location_type?: string;
      };
    }[];
  };

  if (import.meta.env.DEV && data.status !== "OK") {
    console.warn("[geocode] Google REST:", data.status, data.error_message);
  }

  if (data.status !== "OK" || !data.results?.[0]) return null;

  const { location, location_type } = data.results[0].geometry;
  return {
    lat: location.lat,
    lng: location.lng,
    locationType: location_type,
  };
}

/** Dùng Geocoder từ Maps JavaScript API — cùng API key, cần bật Geocoding API */
export async function geocodeViaJsApi(
  query: string,
): Promise<GeocodeResult | null> {
  const g = await loadGoogleMaps();
  const geocoder = new g.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode(
      { address: query, region: "VN" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (results: any, status: string) => {
        if (import.meta.env.DEV && status !== "OK") {
          console.warn("[geocode] Google JS:", status);
        }

        if (status !== "OK" || !results?.[0]?.geometry?.location) {
          resolve(null);
          return;
        }

        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
          locationType: results[0].geometry.location_type,
        });
      },
    );
  });
}

/**
 * Chuyển địa chỉ → tọa độ.
 * Cần bật **Geocoding API** trên cùng API key (không cần Places API).
 */
export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  // Ưu tiên JS Geocoder (cùng referrer với map đang chạy)
  try {
    const viaJs = await geocodeViaJsApi(query);
    if (viaJs) return viaJs;
  } catch {
    /* Maps JS chưa load — thử REST */
  }

  const viaRest = await geocodeViaGoogleRest(query);
  if (viaRest) return viaRest;

  return geocodeViaNominatim(query);
}

export function buildMapEmbedUrl(coords: { lat: number; lng: number }): string {
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadGoogleMaps(): Promise<any> {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      new Error("VITE_GOOGLE_MAPS_API_KEY chưa được cấu hình"),
    );
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      // Không cần Places API — chỉ Maps JS + Geocoding API
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&language=vi&region=VN`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps không tải được"));
        }
      };
      script.onerror = () =>
        reject(new Error("Không tải được Google Maps JavaScript API"));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
