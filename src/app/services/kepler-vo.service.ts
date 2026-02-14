import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, delay, map, retry, timeout} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {VehicleMapper} from '../mappers/vehicle.mapper';
import {MOCK_VEHICLES} from '../models/mock-vehicles';
import {KeplerResponse, KeplerVehicle, Vehicle} from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class KeplerVOService {
  private apiUrl = environment.keplerVO.apiUrl;
  private useMockData = environment.keplerVO.useMockData;
  
  // Flag pour indiquer si on utilise des données dégradées
  private usingDegradedData = false;

  // Cache en mémoire
  private cache: {
    vehicles?: { data: Vehicle[], timestamp: number };
  } = {};
  
  // Clé pour localStorage
  private readonly STORAGE_KEY = 'kepler_vehicles_cache';

  constructor(
    private http: HttpClient,
    private vehicleMapper: VehicleMapper
  ) {
    if (!environment.production) {
      console.log('🚗 KeplerVOService initialisé');
      console.log(`📦 Mode: ${this.useMockData ? 'FALLBACK (données locales)' : 'API KEPLER'}`);
    }
  }

  /**
   * Récupère tous les véhicules disponibles
   * @param forceRefresh Force le rechargement depuis l'API (ignore le cache)
   */
  getVehicles(forceRefresh: boolean = false): Observable<Vehicle[]> {
    if (this.useMockData) {
      if (!environment.production) {
        console.log('📦 Utilisation des véhicules de fallback (mock data)');
      }
      // En mode mock, on est toujours en mode dégradé
      this.usingDegradedData = true;
      return of(MOCK_VEHICLES).pipe(
        delay(500)
      );
    }

    if (!forceRefresh && this.cache.vehicles) {
      const cacheAge = Date.now() - this.cache.vehicles.timestamp;
      if (cacheAge < environment.keplerVO.cacheDuration) {
        if (!environment.production) {
          console.log('📦 Véhicules chargés depuis le cache local');
        }
        return of(this.cache.vehicles.data);
      }
    }

    if (!environment.production) {
      console.log('🔄 Chargement des véhicules depuis l\'API KEPLER...');
    }
    return this.fetchVehiclesFromAPI();
  }

  /**
   * Récupère un véhicule par son ID
   * @param id Identifiant du véhicule
   */
  getVehicleById(id: string): Observable<Vehicle | null> {
    if (this.useMockData) {
      const vehicle = MOCK_VEHICLES.find(v => v.id === id);
      return of(vehicle || null).pipe(delay(200));
    }

    const headers = this.getHeaders();
    
    return this.http.get<KeplerResponse<KeplerVehicle>>(
      `${this.apiUrl}/vehicles?vehicleId=${id}`,
      { headers }
    ).pipe(
      timeout(environment.keplerVO.timeout),
      map(response => {
        if (!response.success || !response.data) {
          return null;
        }
        return this.vehicleMapper.mapKeplerToVehicle(response.data);
      }),
      catchError(error => {
        console.error('❌ Erreur lors du chargement du véhicule:', error);
        return of(null);
      })
    );
  }

  toggleMockMode(useMock: boolean): void {
    this.useMockData = useMock;
    this.clearCache();
    if (!environment.production) {
      console.log(`🔄 Mode basculé vers: ${useMock ? 'FALLBACK' : 'API'}`);
    }
  }

  isMockMode(): boolean {
    return this.useMockData;
  }

  clearCache(): void {
    this.cache = {};
    if (!environment.production) {
      console.log('🗑️ Cache vidé');
    }
  }

  /**
   * Vérifie si le service utilise des données dégradées (cache ou mock)
   */
  isUsingDegradedData(): boolean {
    return this.usingDegradedData;
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  /**
   * Récupère les véhicules depuis l'API KEPLER (via proxy Vercel)
   * Le proxy gère l'authentification et les filtres
   */
  private fetchVehiclesFromAPI(): Observable<Vehicle[]> {
    const headers = this.getHeaders();

    return this.http.get<KeplerResponse<KeplerVehicle[]>>(
      `${this.apiUrl}/vehicles`,
      { headers }
    ).pipe(
      timeout(environment.keplerVO.timeout),
      retry(2),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Réponse invalide de l\'API KEPLER');
        }
        
        const vehicles = response.data
          .map(kv => this.vehicleMapper.mapKeplerToVehicle(kv))
          .filter(v => {
            // Ne garder que les véhicules avec un vrai prix
            const rawPrice = v.price.replace(/\s/g, '').replace('€', '');
            return rawPrice !== 'Prixnoncommuniqué' && parseFloat(rawPrice) > 0;
          });
        
        // Mettre en cache mémoire
        this.cache.vehicles = {
          data: vehicles,
          timestamp: Date.now()
        };
        
        // Sauvegarder dans localStorage pour fallback
        this.saveToLocalStorage(vehicles);
        
        // API fonctionne : pas de mode dégradé
        this.usingDegradedData = false;
        
        if (!environment.production) {
          console.log(`✅ ${vehicles.length} véhicules chargés depuis l'API`);
        }
        return vehicles;
      }),
      catchError(error => {
        console.error('❌ Erreur API KEPLER');
        console.error('Détails:', error);
        
        // Stratégie de fallback en cascade
        
        // 1. Essayer le cache localStorage (vrais véhicules)
        const cachedVehicles = this.getFromLocalStorage();
        if (cachedVehicles && cachedVehicles.length > 0) {
          console.warn('⚠️ API indisponible, utilisation du cache localStorage');
          this.usingDegradedData = true;
          return of(cachedVehicles);
        }
        
        // 2. En dernier recours : mock data
        console.warn('⚠️ API + cache indisponibles, utilisation des mock data');
        this.usingDegradedData = true;
        return of(MOCK_VEHICLES);
      })
    );
  }

  /**
   * Sauvegarde les véhicules dans localStorage
   */
  private saveToLocalStorage(vehicles: Vehicle[]): void {
    try {
      const dataToStore = {
        data: vehicles,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
      if (!environment.production) {
        console.log('💾 Véhicules sauvegardés dans localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }

  /**
   * Récupère les véhicules depuis localStorage
   * Retourne null si le cache est trop ancien (> 24h) ou invalide
   */
  private getFromLocalStorage(): Vehicle[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const { data, timestamp } = JSON.parse(stored);
      
      // Vérifier que le cache a moins de 24 heures
      const cacheAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (cacheAge > maxAge) {
        if (!environment.production) {
          console.log('⏰ Cache localStorage trop ancien (> 24h)');
        }
        return null;
      }
      
      if (!environment.production) {
        const ageInHours = Math.floor(cacheAge / (60 * 60 * 1000));
        console.log(`📦 Cache localStorage valide (âge: ${ageInHours}h)`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  }

  /**
   * Génère les headers pour les requêtes au proxy
   * L'authentification est gérée côté serveur par le proxy Vercel
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
