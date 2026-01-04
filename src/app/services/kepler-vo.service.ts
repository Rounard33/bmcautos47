import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, delay, map, retry, timeout} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {MOCK_VEHICLES} from '../models/mock-vehicles';
import {KeplerResponse, KeplerVehicle, Vehicle} from '../models/vehicle.model';

/**
 * Service de gestion de l'API KeplerVO
 * 
 * Ce service peut fonctionner en 2 modes :
 * 1. MODE FALLBACK (par défaut) : Utilise les données locales (MOCK_VEHICLES)
 * 2. MODE API : Se connecte à l'API KeplerVO réelle
 * 
 * Pour activer le mode API, définir environment.keplerVO.useMockData = false
 */
@Injectable({
  providedIn: 'root'
})
export class KeplerVOService {
  private apiUrl = environment.keplerVO.apiUrl;
  private apiKey = environment.keplerVO.apiKey;
  private dealerId = environment.keplerVO.dealerId;
  private useMockData = environment.keplerVO.useMockData;

  // Cache simple en mémoire
  private cache: {
    vehicles?: { data: Vehicle[], timestamp: number };
  } = {};

  constructor(private http: HttpClient) {
    console.log('🚗 KeplerVOService initialisé');
    console.log(`📦 Mode: ${this.useMockData ? 'FALLBACK (données locales)' : 'API KeplerVO'}`);
  }

  /**
   * Récupère tous les véhicules disponibles
   * @param forceRefresh Force le rechargement depuis l'API (ignore le cache)
   */
  getVehicles(forceRefresh: boolean = false): Observable<Vehicle[]> {
    // MODE FALLBACK : Retourner les données mock
    if (this.useMockData) {
      console.log('📦 Utilisation des véhicules de fallback (mock data)');
      return of(MOCK_VEHICLES).pipe(
        delay(500) // Simuler un délai réseau pour le réalisme
      );
    }

    // MODE API : Vérifier le cache d'abord
    if (!forceRefresh && this.cache.vehicles) {
      const cacheAge = Date.now() - this.cache.vehicles.timestamp;
      if (cacheAge < environment.keplerVO.cacheDuration) {
        console.log('📦 Véhicules chargés depuis le cache local');
        return of(this.cache.vehicles.data);
      }
    }

    // MODE API : Appeler l'API KeplerVO
    console.log('🔄 Chargement des véhicules depuis l\'API KeplerVO...');
    return this.fetchVehiclesFromAPI();
  }

  /**
   * Récupère un véhicule par son ID
   * @param id Identifiant du véhicule
   */
  getVehicleById(id: string): Observable<Vehicle | null> {
    // MODE FALLBACK
    if (this.useMockData) {
      const vehicle = MOCK_VEHICLES.find(v => v.id === id);
      return of(vehicle || null).pipe(delay(200));
    }

    // MODE API (via proxy Vercel)
    const headers = this.getHeaders();
    
    // Le proxy Vercel utilise ?vehicleId=X comme query param
    return this.http.get<KeplerResponse<KeplerVehicle>>(
      `${this.apiUrl}/vehicles?vehicleId=${id}`,
      { headers }
    ).pipe(
      timeout(environment.keplerVO.timeout),
      map(response => {
        if (!response.success || !response.data) {
          return null;
        }
        return this.transformKeplerVehicle(response.data);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement du véhicule:', error);
        return of(null);
      })
    );
  }

  /**
   * Bascule entre le mode Mock et le mode API
   * Utile pour les tests
   */
  toggleMockMode(useMock: boolean): void {
    this.useMockData = useMock;
    this.clearCache();
    console.log(`🔄 Mode basculé vers: ${useMock ? 'FALLBACK' : 'API'}`);
  }

  /**
   * Vérifie si le service utilise les données mock
   */
  isMockMode(): boolean {
    return this.useMockData;
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache = {};
    console.log('🗑️ Cache vidé');
  }

  // ============================================
  // MÉTHODES PRIVÉES - API
  // ============================================

  /**
   * Récupère les véhicules depuis l'API KeplerVO (via proxy Vercel)
   * Le proxy gère l'authentification, le dealerId et les filtres
   */
  private fetchVehiclesFromAPI(): Observable<Vehicle[]> {
    const headers = this.getHeaders();

    return this.http.get<KeplerResponse<KeplerVehicle[]>>(
      `${this.apiUrl}/vehicles`,
      { headers }
    ).pipe(
      timeout(environment.keplerVO.timeout),
      retry(2), // Retry 2 fois en cas d'échec
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Réponse invalide de l\'API KeplerVO');
        }
        
        // Transformer les véhicules KeplerVO en format interne
        const vehicles = response.data.map(kv => this.transformKeplerVehicle(kv));
        
        // Mettre en cache
        this.cache.vehicles = {
          data: vehicles,
          timestamp: Date.now()
        };
        
        console.log(`✅ ${vehicles.length} véhicules chargés depuis l'API`);
        return vehicles;
      }),
      catchError(error => {
        console.error('❌ Erreur API KeplerVO, basculement sur les données mock');
        console.error('Détails:', error);
        // En cas d'erreur, retourner les données mock en fallback
        return of(MOCK_VEHICLES);
      })
    );
  }

  /**
   * Transforme un véhicule KeplerVO en format interne
   */
  private transformKeplerVehicle(kv: KeplerVehicle): Vehicle {
    // Trier et extraire les images
    const photos = (kv.photos || [])
      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    
    const images = photos.map(p => p.url);
    const mainImage = photos.find(p => p.principal)?.url || images[0] || 'assets/img/placeholder.jpg';

    // Construire les features principales
    const features: string[] = [];
    if (kv.caracteristiques?.garantie) {
      features.push(kv.caracteristiques.garantie);
    }
    if (kv.caracteristiques?.nbPortes) {
      features.push(`${kv.caracteristiques.nbPortes} portes`);
    }
    if (kv.caracteristiques?.nbPlaces) {
      features.push(`${kv.caracteristiques.nbPlaces} places`);
    }

    return {
      id: kv.id || kv.reference || `kepler-${Date.now()}`,
      brand: kv.marque,
      model: kv.modele,
      year: kv.annee,
      mileage: this.formatMileage(kv.kilometrage),
      transmission: this.formatTransmission(kv.boite),
      fuel: this.formatFuel(kv.carburant),
      price: this.formatPrice(kv.prix),
      image: mainImage,
      images: images.length > 0 ? images : [mainImage],
      features,
      status: this.mapStatus(kv.statut),
      details: kv.caracteristiques ? {
        finition: kv.caracteristiques.finition,
        category: kv.caracteristiques.categorie,
        firstRegistration: kv.caracteristiques.dateCirculation,
        warranty: kv.caracteristiques.garantie,
        exteriorColor: kv.caracteristiques.couleurExterieure,
        interiorColor: kv.caracteristiques.couleurInterieure,
        fiscalPower: kv.caracteristiques.puissanceFiscale ? 
          `${kv.caracteristiques.puissanceFiscale} CV` : undefined,
        power: kv.caracteristiques.puissanceReelle,
        co2Emission: kv.caracteristiques.emissionCO2 ? 
          `${kv.caracteristiques.emissionCO2} g/km` : undefined,
        doors: kv.caracteristiques.nbPortes,
        reference: kv.reference,
        description: kv.caracteristiques.description,
        standardEquipment: kv.caracteristiques.equipementsStandard,
        optionalEquipment: kv.caracteristiques.equipementsOption
      } : undefined
    };
  }

  /**
   * Formate le kilométrage
   */
  private formatMileage(km: number): string {
    return `${km.toLocaleString('fr-FR')} Km`;
  }

  /**
   * Formate la transmission
   */
  private formatTransmission(transmission: string): string {
    const mapping: { [key: string]: string } = {
      'auto': 'Automatique',
      'automatic': 'Automatique',
      'manual': 'Manuelle',
      'automatique': 'Automatique',
      'manuelle': 'Manuelle',
    };
    return mapping[transmission?.toLowerCase()] || transmission;
  }

  /**
   * Formate le carburant
   */
  private formatFuel(fuel: string): string {
    const mapping: { [key: string]: string } = {
      'diesel': 'Diesel',
      'essence': 'Essence',
      'gasoline': 'Essence',
      'electric': 'Électrique',
      'hybrid': 'Hybride',
      'electrique': 'Électrique',
      'électrique': 'Électrique',
      'hybride': 'Hybride'
    };
    return mapping[fuel?.toLowerCase()] || fuel;
  }

  /**
   * Formate le prix
   */
  private formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} €`;
  }

  /**
   * Mappe le statut KeplerVO vers le statut interne
   */
  private mapStatus(status?: string): 'available' | 'sold' | 'reserved' {
    if (!status) return 'available';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('vendu') || statusLower.includes('sold')) {
      return 'sold';
    }
    if (statusLower.includes('reserv') || statusLower.includes('reserved')) {
      return 'reserved';
    }
    return 'available';
  }

  /**
   * Génère les headers pour les requêtes au proxy
   * L'authentification est gérée côté serveur par le proxy Vercel
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // Plus besoin d'Authorization - le proxy Vercel s'en charge
    });
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.status === 401) {
        errorMessage = 'Erreur d\'authentification avec l\'API KeplerVO';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 429) {
        errorMessage = 'Trop de requêtes, veuillez réessayer plus tard';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de contacter l\'API KeplerVO';
      }
    }

    console.error('❌ Erreur API KeplerVO:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

