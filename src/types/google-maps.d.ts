// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setOptions(options: MapOptions): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setMap(map: Map | null): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: MVCObject): void;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      styles?: any[];
      streetViewControl?: boolean;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
    }

    interface ZoomControlOptions {
      position?: ControlPosition;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      icon?: Icon | string;
      title?: string;
      animation?: Animation;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    interface PolylineOptions {
      path?: Array<LatLng | LatLngLiteral>;
      geodesic?: boolean;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      icons?: Array<IconSequence>;
    }

    interface IconSequence {
      icon: Symbol;
      offset?: string;
      repeat?: string;
    }

    interface Symbol {
      path: SymbolPath | string;
      scale?: number;
      strokeColor?: string;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MVCObject {
    }

    enum ControlPosition {
      RIGHT_CENTER,
    }

    enum Animation {
      DROP,
    }

    enum SymbolPath {
      FORWARD_CLOSED_ARROW,
    }

    namespace places {
      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult, status: PlacesServiceStatus) => void): void;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }

      interface PlaceResult {
        name?: string;
        rating?: number;
        reviews?: PlaceReview[];
        user_ratings_total?: number;
      }

      interface PlaceReview {
        author_name: string;
        rating: number;
        text: string;
        profile_photo_url?: string;
      }

      enum PlacesServiceStatus {
        OK,
        ZERO_RESULTS,
        OVER_QUERY_LIMIT,
        REQUEST_DENIED,
        INVALID_REQUEST,
        UNKNOWN_ERROR,
      }
    }
  }
}