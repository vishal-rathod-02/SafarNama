import { RefObject } from "react";

export interface AuthModalProps {
  isOpen: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
}

export type AuthMode = "login" | "signup";

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error?: string | null; 
  login: (token: string) => Promise<void>;
  logout: () => void;
  logoutAll: () => Promise<void>; 
  isOpen?: boolean;
  mode?: 'login' | 'signup';
};

export type AuthModalContextType = {
  isOpen: boolean;
  mode: "login" | "signup" | "forgot";
  openModal: (mode?: "login" | "signup" | "forgot") => void;
  closeModal: () => void;
  switchMode: (mode: "login" | "signup" | "forgot") => void;
  toggleModal: () => void;
  resetModal: () => void;
};

export type UserMenuProps = {
  user: AuthUser | null;
  logout: () => void;
};

export interface LayoutProps {
   isAuthenticated: boolean;
   onOpenAuthModal: (mode?: "login" | "signup") => void;
  addToast?: (toast: { message: string; type: ToastType }) => void;
}

export type Coordinates = [number, number];

export interface Place {
  label: string;
  type: any;
  coords?: Coordinates; 
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  status: string;
  location: string;
}

export interface PlaceWithCoords extends Place {
  type: string;
  coords: Coordinates; 
}

export interface RouteResult {
  route: Coordinates[];
  distance: number;  
  duration: number;  
}

export interface TripData {
  destinationCoords(destinationCoords: any): [number, number];
  sourceCoords(sourceCoords: any): [number, number];
  summary: string;
  places: PlaceWithCoords[];
  highlights: string;      
  itinerary: string;
  source: string;
  destination: string;
  distance: number; 
  duration: number;
  route: [number, number][];
  waypoints?: string[];
}


export interface SearchParams {
  start: string;
  end: string;
  travelDate?: string;
  tripPreference?: string;
  vehicleMode?: string;
  travelCompanions?: string;
}

export interface HeaderProps {
  isAuthenticated?: boolean;
  onOpenAuthModal?: (mode: "login" | "signup") => void;
  onNavLinkClick?: (section: string) => void;
  isSearchActive?: boolean;
  activeSection?: string;
}

export interface HomePageProps {
  isAuthenticated: boolean;
  addToast: (msg: string, type: "success" | "error") => void;
  authModalState: { isOpen: boolean; mode: "login" | "signup" };
  handleCloseAuthModal: () => void;
  handleOpenAuthModal: (mode: "login" | "signup") => void;
}

export interface HeroProps {
  onSearch: (params: SearchParams) => void;
  destinationValue: string;
  onDestinationChange: (value: string) => void;
  isLoading: boolean; 
  id: string;
}

export interface FooterProps {
  onNavLinkClick: (sectionId: string) => void;
  id:string;
}

export interface ResultsPageProps {
  onOpenAuthModal?: () => void;
  isAuthenticated: boolean;
  addToast: (msg: string, type: "success" | "error") => void;
}

export interface PlaceCardProps {
  place: Place;
}

export interface ResultsPanelProps {
  tripData: TripData;
  sourceCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
  travelDate?: string | null;
  tripPreference?: string | null;
  vehicleMode?: string | null;
  travelCompanions?: string | null;
}

export interface WeatherWidgetProps {
  label: string;
  coords: [number, number];
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

export type HomeSection =
  | "home"
  | "about"
  | "services"
  | "destinations"
  | "contact";

export interface OutletContext {
  sectionRefs: Record<HomeSection, RefObject<HTMLDivElement>>;
  activeSection: HomeSection;
  onScrollToSection: (section: HomeSection) => void;

  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  addToast: (toast: { message: string; type: string }) => void;
}

export interface AugmentedTripData extends TripData {
    scoredPlaces?: PlaceWithCoords[]; 
}

export interface TopDestinationsProps {
  onDestinationClick: (name: string) => void;
  id:string;
}

export interface AboutProps {
  id: string;
}

export interface ServicesProps {
  id: string;
}

export type ErrorVariant = "route" | "auth" | "generic";

export interface ErrorMessageProps {
  message: string;
  variant?: ErrorVariant;
  onPrimaryAction?: () => void; 
  
}

export interface ScrollToTopButtonProps {
  isVisible: boolean;
}

export interface FloatingFilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
  isDrawerOpen: boolean; 
}

export interface Suggestion {
  short_name: string;
  type: any;
  lon: any;
  lat: any;
  full_name: string;
  display_name: string;
  place_id: number;
}

export interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ElementType; 
  iconColor: {
    default: string;
    focused: string;
  };
  type?: 'source' | 'destination'; 
}

export interface PageStatusProps {
  isLoading: boolean;
  error: string | null;
  errorVariant?: ErrorVariant;
   onRetry?: () => void;
  onOpenAuthModal?: (mode?: "login" | "signup") => void;
}

export interface MapViewProps {
  source: { name: string; coords: Coordinates };
  destination: { name: string; coords: Coordinates };
  places: PlaceWithCoords[];
  route: Coordinates[];
}

export interface AnimatedVehicleProps {
  path: [number, number][];  
  speed?: number;            
  iconUrl: string;           
}

export interface FilterState {
  location: 'all' | 'source' | 'destination';
  keywords: string[];
  minRating: number;
}

export interface TripSummaryCardProps {
  tripData: TripData;
  sourceCoords?: Coordinates | null;
  destinationCoords?: Coordinates | null;
}

//Toast type  
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; 
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}


export interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export interface StatItem {
  title: string;
  value: number;
  description: string;
  color: "green" | "blue" | "yellow";
  icon: React.ComponentType<any>;
}
