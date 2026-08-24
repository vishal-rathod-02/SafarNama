import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { TripService } from "@/Services/Trip/Trip.service";
import { Header } from "../Components/HomeComponents/Header";
import { Hero } from "../Components/HomeComponents/Hero";
import { TopDestinations } from "../Components/HomeComponents/TopDestinations";
import { Services } from "../Components/HomeComponents/Services";
import { AboutSection } from "../Components/HomeComponents/AboutSection";
import { Footer } from "../Components/HomeComponents/Footer";
import { ScrollToTopButton } from "../Components/HomeComponents/ScrollButton";
import { geocodeSinglePlace } from "@/hooks/geoUtils";
import { PageStatus } from "./PageStatus";
import type {  OutletContext as MyOutletContext, SearchParams, Place } from '@/hooks/types';


export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { onOpenAuthModal, isAuthenticated } = useOutletContext<MyOutletContext>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVariant, setErrorVariant] = useState<"route" | "auth" | "generic">("generic");
  const [destination, setDestination] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Section refs
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const sectionRefs = { home: heroRef, about: aboutRef, services: servicesRef, destinations: destinationsRef, contact: contactRef };

//   useEffect(() => {
//   const observer = new IntersectionObserver(
//     (entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           const sectionId = entry.target.id;
//           if (sectionId) {
//             setActiveSection(sectionId);
//           }
//         }
//       });
//     },
//     {
//       root: null,
//       threshold: 0.3,
//       rootMargin: "-80px 0px -40% 0px",
//     }
//   );

//   Object.values(sectionRefs).forEach((ref) => {
//     if (ref.current) observer.observe(ref.current);
//   });

//   return () => observer.disconnect();
// }, []);

 const handleScrollToSection = useCallback(
  (sectionId: keyof typeof sectionRefs) => {
    const section = sectionRefs[sectionId]?.current;
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
      window.history.replaceState(null, "", `#${sectionId}`);
    }
  },
  []
);

  // Scroll on hash load
 useEffect(() => {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;

  const section = sectionRefs[hash as keyof typeof sectionRefs]?.current;
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(hash);
  }
}, []);

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 800);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLoading || error ? "hidden" : "auto";
  }, [isLoading, error]);

 // --- Helper: call backend /api/trips/generate ---
  const callGenerateTripApi = async (payload: {
    source: string;
    destination: string;
    startCoords: number[];
    endCoords: number[];
  }) => {
    const res = await TripService.generate(payload);

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Server error while generating trip");
    }
    const json = await res.json();
    const trip = json.trip ?? json.tripData ?? json;

    return trip;
  };

const handleSearch = useCallback(
  async ({ start, end, travelDate, travelCompanions, vehicleMode, tripPreference }: SearchParams) => {

    if (!isAuthenticated) {
      console.log("User not authenticated → opening auth modal");
      onOpenAuthModal();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [sCoordData, dCoordData] = await Promise.all([
        geocodeSinglePlace({ name: start, location: "" } as Place),
        geocodeSinglePlace({ name: end, location: "" } as Place),
      ]);

      const startCoords = sCoordData?.coords;
      const endCoords = dCoordData?.coords;

      if (!startCoords || !endCoords) {
        setErrorVariant("route");
        setError("Could not find one or both locations.");
        return;
      }

      const tripData = await callGenerateTripApi({
        source: start,
        destination: end,
        startCoords,
        endCoords,
      });

      if (!tripData) {
        setErrorVariant("route");
        setError("Could not generate a travel plan for this route.");
        return;
      }

      navigate("/results", {
        state: {
          tripData,
          sourceCoords: startCoords,
          destinationCoords: endCoords,
          routePolyline: tripData.route || [],
          travelDate,
          travelCompanions,
          vehicleMode,
          tripPreference,
        },
      });
    } catch (err: any) {
      console.error("❌ handleSearch error:", err);
      if (err.message === "UNAUTHORIZED") {
        setErrorVariant("auth");
        setError("Your session has expired. Please login again to plan your trip.");
        onOpenAuthModal();
      } else {
        setErrorVariant("route");
        setError(err.message || "We could not generate a travel plan for this route.");
      }
    } finally {
      setIsLoading(false);
    }
  },
  [navigate, isAuthenticated, onOpenAuthModal]
);


  const handleDestinationSelect = useCallback((name: string) => {
    setDestination(name);
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleErrorPrimaryAction = useCallback(() => {
  if (errorVariant === "auth") {
    setError(null);
    onOpenAuthModal();
    return;
  }

  setError(null);
  heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}, [errorVariant, onOpenAuthModal]);

  return (
    <>
      {/* Header always visible */}
      <Header
        activeSection={activeSection}
        onNavLinkClick={(section) =>
        handleScrollToSection(section as keyof typeof sectionRefs)
  }
      />

      <main >
        {( error) ? (
         <PageStatus
            isLoading={isLoading}
            error={error}
            errorVariant={errorVariant}
            onRetry={handleErrorPrimaryAction}
            onOpenAuthModal={onOpenAuthModal}
        />
        ) : (
          <>
            <Hero
              ref={heroRef}
              id="home"
              onSearch={handleSearch}
              destinationValue={destination}
              onDestinationChange={setDestination}
              isLoading={isLoading}
            />

            <TopDestinations
              ref={destinationsRef}
              id="destinations"
              onDestinationClick={handleDestinationSelect}
            />
            <Services ref={servicesRef} id="services" />
            <AboutSection ref={aboutRef} id="about" />
            <Footer
              ref={contactRef}
              id="contact"
              onNavLinkClick={(section) =>
              handleScrollToSection(section as keyof typeof sectionRefs)
              }
            />
          </>
        )}
      </main>

      <ScrollToTopButton isVisible={isScrolled} />
    </>
  );
};
