import { motion } from "framer-motion";
import { AnimatedText } from "@/components/ui/animated-text";
import { useEffect, useRef, useCallback } from "react";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { getSchoolLocation } from "@/services/googleMapsService";
import { useTheme } from "@/lib/theme-provider";
import { School, Bus, Palmtree, BookOpen } from "lucide-react";

interface SchoolMapProps {
  className?: string;
}

interface MapOptions extends google.maps.MapOptions {
  streetViewControl: boolean;
  mapTypeControl: boolean;
  fullscreenControl: boolean;
}

// Define a simple LatLng interface to avoid type issues
interface SimpleLatLng {
  lat: number;
  lng: number;
}

export function SchoolMap({ className = "" }: SchoolMapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const busRef = useRef<google.maps.Marker | null>(null);
  const busPathRef = useRef<google.maps.Polyline | null>(null);

  // Map styles for cartoon look
  const cartoonMapStyles = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ visibility: "simplified" }, { hue: isDark ? "#1f2937" : "#a5d6ff" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: isDark ? "#3b4252" : "#a5d6ff" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: isDark ? "#4c566a" : "#b9f6ca" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: isDark ? "#d8dee9" : "#ffffff" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: isDark ? "#eceff4" : "#212529" }]
    },
    {
      featureType: "building",
      elementType: "geometry",
      stylers: [{ color: isDark ? "#4c566a" : "#ced4da" }]
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ];

  // Create SVG icons for markers
  const createSchoolIcon = () => {
    const color = isDark ? "#5e81ac" : "#4c6ef5";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m4 6 8-4 8 4"></path>
        <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path>
        <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path>
        <path d="M18 5v17"></path>
        <path d="M4 5v17"></path>
        <circle cx="12" cy="9" r="2"></circle>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const createBusIcon = () => {
    const color = isDark ? "#bf616a" : "#fa5252";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6v6"></path>
        <path d="M15 6v6"></path>
        <path d="M2 12h19.6"></path>
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path>
        <circle cx="7" cy="18" r="2"></circle>
        <path d="M9 18h5"></path>
        <circle cx="16" cy="18" r="2"></circle>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const createParkIcon = () => {
    const color = isDark ? "#a3be8c" : "#51cf66";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"></path>
        <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"></path>
        <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z"></path>
        <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"></path>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const createLibraryIcon = () => {
    const color = isDark ? "#88c0d0" : "#4dabf7";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 16V4a2 2 0 0 1 2-2h11"></path>
        <path d="M5 14H4a2 2 0 1 0 0 4h1"></path>
        <path d="M22 18H11a2 2 0 1 0 0 4h11V6H11a2 2 0 0 0-2 2v12"></path>
      </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };

  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current) return;

    const schoolLocation = getSchoolLocation();
    const mapOptions: MapOptions = {
      center: schoolLocation,
      zoom: 15,
      styles: cartoonMapStyles,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Custom school marker with animation
    const marker = new google.maps.Marker({
      position: schoolLocation,
      map: map,
      icon: {
        url: createSchoolIcon(),
        scaledSize: new google.maps.Size(60, 60),
      },
      animation: google.maps.Animation.DROP,
      title: SCHOOL_INFO.name,
    });
    markerRef.current = marker;

    // Add info window for the school
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-bold">${SCHOOL_INFO.name}</h3>
          <p>${SCHOOL_INFO.address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Animate a school bus along a path to the school
    animateSchoolBus(map, schoolLocation);

    // Add some cartoon landmarks around the school
    addCartoonLandmarks(map, schoolLocation);

  }, [isDark]);

  const animateSchoolBus = (map: google.maps.Map, schoolLocation: SimpleLatLng) => {
    // Create a path for the bus to follow
    const busPath: SimpleLatLng[] = [
      { lat: schoolLocation.lat - 0.01, lng: schoolLocation.lng - 0.01 }, // Starting point
      { lat: schoolLocation.lat - 0.008, lng: schoolLocation.lng - 0.005 },
      { lat: schoolLocation.lat - 0.005, lng: schoolLocation.lng - 0.002 },
      { lat: schoolLocation.lat - 0.002, lng: schoolLocation.lng },
      schoolLocation, // End at school
    ];

    // Draw the path
    const path = new google.maps.Polyline({
      path: busPath,
      geodesic: true,
      strokeColor: '#FF6D00',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: '#FF6D00',
        },
        repeat: '100px'
      }]
    });
    path.setMap(map);
    busPathRef.current = path;

    // Create the bus marker
    const busMarker = new google.maps.Marker({
      position: busPath[0],
      map: map,
      icon: {
        url: createBusIcon(),
        scaledSize: new google.maps.Size(40, 40),
      },
      title: 'School Bus',
    });
    busRef.current = busMarker;

    // Animate the bus along the path
    let step = 0;
    const numSteps = 100;
    const animationInterval = window.setInterval(() => {
      step = (step + 1) % numSteps;
      
      if (step === 0) {
        // Reset to beginning of path when reaching the end
        busMarker.setPosition(busPath[0]);
      } else {
        const progress = step / numSteps;
        const pathIndex = Math.floor(progress * (busPath.length - 1));
        const nextPathIndex = Math.min(pathIndex + 1, busPath.length - 1);
        
        const startPoint = busPath[pathIndex];
        const endPoint = busPath[nextPathIndex];
        
        const segmentProgress = (progress * (busPath.length - 1)) % 1;
        
        const lat = startPoint.lat + segmentProgress * (endPoint.lat - startPoint.lat);
        const lng = startPoint.lng + segmentProgress * (endPoint.lng - startPoint.lng);
        
        busMarker.setPosition({ lat, lng });
      }
    }, 100);

    // Store the interval ID to clear it when component unmounts
    return animationInterval;
  };

  const addCartoonLandmarks = (map: google.maps.Map, schoolLocation: SimpleLatLng) => {
    // Add a park near the school
    new google.maps.Marker({
      position: { lat: schoolLocation.lat + 0.003, lng: schoolLocation.lng - 0.002 },
      map: map,
      icon: {
        url: createParkIcon(),
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Community Park',
    });

    // Add a library near the school
    new google.maps.Marker({
      position: { lat: schoolLocation.lat - 0.002, lng: schoolLocation.lng + 0.003 },
      map: map,
      icon: {
        url: createLibraryIcon(),
        scaledSize: new google.maps.Size(30, 30),
      },
      title: 'Public Library',
    });
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.error('Google Maps API key is not set in environment variables');
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.onerror = () => console.error('Failed to load Google Maps script');
        script.onload = initializeMap;
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    loadGoogleMapsScript();

    return () => {
      // Clean up any animations or intervals when component unmounts
      if (busPathRef.current) {
        busPathRef.current.setMap(null);
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    // Reinitialize map when theme changes to update styles
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({ styles: cartoonMapStyles });
    }
  }, [isDark, cartoonMapStyles]);

  return (
    <section className={`py-24 ${isDark ? "bg-primary/10" : "bg-primary/5"} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedText
            text="Our Location"
            className="text-3xl font-bold mb-4"
            variant="slideUp"
          />
          <p className="text-muted-foreground">Find us on the map</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-lg overflow-hidden shadow-lg"
        >
          <div 
            ref={mapRef} 
            className="h-96 w-full rounded-lg"
            style={{ border: `4px solid rgba(var(--primary), 0.1)` }}
          />
          
          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
            <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
            <div className="flex items-center mb-1">
              <School className="w-4 h-4 text-primary mr-2" />
              <span className="text-xs">School</span>
            </div>
            <div className="flex items-center mb-1">
              <Bus className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-xs">Bus Route</span>
            </div>
            <div className="flex items-center">
              <Palmtree className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-xs">Park</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-xs">Library</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}