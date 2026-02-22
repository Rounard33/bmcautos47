// ============================================
// Interfaces Communes pour les Véhicules
// ============================================

/**
 * Interface principale pour les véhicules (utilisée dans l'application)
 */
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: string;
  transmission: string;
  fuel: string;
  price: string;
  image: string;
  images: string[];
  thumbnails?: string[];
  features: string[];
  status: 'available' | 'sold' | 'reserved';
  details?: VehicleDetails;
}

/**
 * Détails complets d'un véhicule
 */
export interface VehicleDetails {
  finition?: string;
  category?: string;
  firstRegistration?: string;
  warranty?: string;
  exteriorColor?: string;
  interiorColor?: string;
  fiscalPower?: string;
  power?: string;
  co2Emission?: string;
  doors?: number;
  reference?: string;
  description?: string;
  standardEquipment?: string[];
  optionalEquipment?: string[];
}

// ============================================
// Interfaces pour l'API KeplerVO
// ============================================

/**
 * Structure d'un véhicule retourné par KeplerVO
 * (À adapter selon la vraie documentation de l'API)
 */
export interface KeplerVehicle {
  id: string;
  reference?: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  boite: string;
  carburant: string;
  prix: number;
  photos: KeplerPhoto[];
  caracteristiques?: KeplerCaracteristiques;
  statut?: string;
  dateCreation?: string;
  dateModification?: string;
}

/**
 * Photo d'un véhicule KeplerVO
 */
export interface KeplerPhoto {
  url: string;
  ordre?: number;
  principal?: boolean;
  miniature?: string;
}

/**
 * Caractéristiques détaillées d'un véhicule KeplerVO
 */
export interface KeplerCaracteristiques {
  finition?: string;
  categorie?: string;
  dateCirculation?: string;
  garantie?: string;
  couleurExterieure?: string;
  couleurInterieure?: string;
  puissanceFiscale?: number;
  puissanceReelle?: string;
  emissionCO2?: number;
  nbPortes?: number;
  nbPlaces?: number;
  description?: string;
  equipementsStandard?: string[];
  equipementsOption?: string[];
}

/**
 * Réponse générique de l'API KeplerVO
 */
export interface KeplerResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  perPage?: number;
  timestamp?: string;
}

/**
 * Options de filtrage pour les véhicules
 */
export interface VehicleFilters {
  brand?: string;
  fuel?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  status?: 'available' | 'sold' | 'reserved';
  search?: string;
}

