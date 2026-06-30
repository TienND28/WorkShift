import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildFullAddressQuery,
  buildMapEmbedUrl,
  geocodeAddress,
  loadGoogleMaps,
} from "@/lib/google-maps";

type Coordinates = { lat: number; lng: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMaps = any;

type MapMode = "idle" | "geocoding" | "embed" | "interactive";

interface AddressMapPickerProps {
  address: string;
  locationLabel?: string;
  isReady: boolean;
  coordinates: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
  compact?: boolean;
}

export function AddressMapPicker({
  address,
  locationLabel,
  isReady,
  coordinates,
  onCoordinatesChange,
  compact = false,
}: AddressMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<GoogleMaps>(null);
  const markerRef = useRef<GoogleMaps>(null);
  const geocodeRequestId = useRef(0);
  const interactiveTried = useRef(false);

  const [mode, setMode] = useState<MapMode>("idle");
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const [interactiveError, setInteractiveError] = useState<string | null>(null);

  const fullQuery = buildFullAddressQuery(address, locationLabel);

  const initInteractiveMap = useCallback(
    async (center: Coordinates) => {
      if (!mapRef.current) return false;

      try {
        const g = await loadGoogleMaps();

        if (!mapRef.current) return false;

        const map = new g.maps.Map(mapRef.current, {
          center,
          zoom: 17,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const marker = new g.maps.Marker({
          map,
          position: center,
          draggable: true,
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) {
            onCoordinatesChange({ lat: pos.lat(), lng: pos.lng() });
          }
        });

        map.addListener("click", (e: GoogleMaps) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          onCoordinatesChange({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          });
        });

        mapInstance.current = map;
        markerRef.current = marker;
        setInteractiveError(null);
        setMode("interactive");
        return true;
      } catch (e) {
        setInteractiveError(
          e instanceof Error ? e.message : "Không tải được bản đồ tương tác",
        );
        setMode("embed");
        return false;
      }
    },
    [onCoordinatesChange],
  );

  // Auto geocode when address is complete
  useEffect(() => {
    if (!isReady || !fullQuery) {
      setMode("idle");
      setGeocodeFailed(false);
      interactiveTried.current = false;
      mapInstance.current = null;
      markerRef.current = null;
      return;
    }

    interactiveTried.current = false;
    mapInstance.current = null;
    markerRef.current = null;

    const requestId = ++geocodeRequestId.current;
    setMode("geocoding");

    const timer = window.setTimeout(async () => {
      try {
        const result = await geocodeAddress(fullQuery);
        if (requestId !== geocodeRequestId.current) return;

        if (result) {
          onCoordinatesChange(result);
          setGeocodeFailed(false);
        } else {
          setGeocodeFailed(true);
        }

        interactiveTried.current = true;
        const ok = await initInteractiveMap(
          result ?? { lat: coordinates.lat, lng: coordinates.lng },
        );
        if (!ok) setMode("embed");
      } catch {
        if (requestId === geocodeRequestId.current) {
          setGeocodeFailed(true);
          setMode("embed");
        }
      }
    }, 700);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when address query changes
  }, [isReady, fullQuery]);

  useEffect(() => {
    if (!markerRef.current || !mapInstance.current) return;
    const pos = { lat: coordinates.lat, lng: coordinates.lng };
    markerRef.current.setPosition(pos);
    mapInstance.current.panTo(pos);
  }, [coordinates.lat, coordinates.lng]);

  if (!isReady) {
    return (
      <div className="space-y-2">
        <span className="onboarding-label">Vị trí trên bản đồ</span>
        <div
          className={`flex ${compact ? "h-44" : "h-56"} items-center justify-center rounded-xl border border-dashed border-border-subtle bg-neutral-50 px-6 text-center text-sm text-on-surface-variant`}
        >
          Điền đầy đủ địa chỉ, tỉnh/thành, quận/huyện và phường/xã để hiển thị
          bản đồ tự động.
        </div>
      </div>
    );
  }

  const embedUrl = buildMapEmbedUrl(coordinates);
  const showInteractive = mode === "interactive";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="onboarding-label">Vị trí trên bản đồ</span>
        {mode === "geocoding" ? (
          <span className="text-sm text-on-surface-variant">Đang định vị...</span>
        ) : null}
      </div>

      {geocodeFailed ? (
        <p className="text-xs text-amber-700">
          Không định vị được từ địa chỉ — hãy bật <strong>Geocoding API</strong>{" "}
          trên cùng API key (Google Cloud Console), hoặc nhấn/kéo ghim trên bản
          đồ để chọn vị trí thủ công.
        </p>
      ) : (
        <p className="text-xs text-on-surface-variant">
          Ghim tự động theo địa chỉ. Nhấn hoặc kéo ghim nếu cần chỉnh chính xác
          hơn.
        </p>
      )}

      <div
        className={`relative ${compact ? "h-44" : "h-56"} w-full overflow-hidden rounded-xl border border-border-subtle bg-neutral-100`}
      >
        {showInteractive ? null : (
          <iframe
            title="Bản đồ vị trí"
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        <div
          ref={mapRef}
          className={`absolute inset-0 h-full w-full ${showInteractive ? "z-10" : "pointer-events-none opacity-0"}`}
        />
        {mode === "geocoding" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-sm text-on-surface-variant">
            Đang tải bản đồ...
          </div>
        ) : null}
      </div>

      {interactiveError && mode === "embed" ? (
        <p className="text-xs text-on-surface-variant">
          Đang dùng bản đồ xem trước. Để kéo ghim, bật{" "}
          <strong>Maps JavaScript API</strong> và thêm{" "}
          <code className="text-[11px]">http://localhost:5173/*</code> vào HTTP
          referrer của API key trên Google Cloud Console.
        </p>
      ) : null}
    </div>
  );
}
