import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, forkJoin} from 'rxjs';
import {catchError, delay, map, retry, timeout, switchMap} from 'rxjs/operators';
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
    // Service initialisé
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
   * Cette méthode récupère TOUTES les pages de véhicules
   */
  private fetchVehiclesFromAPI(): Observable<Vehicle[]> {
    const headers = this.getHeaders();

    // Fonction pour récupérer une page spécifique
    const fetchPage = (pageNumber: number): Observable<KeplerResponse<any[]>> => {
      return this.http.get<KeplerResponse<any[]>>(
        `${this.apiUrl}/vehicles?page=${pageNumber}`,
        { headers }
      ).pipe(
        timeout(environment.keplerVO.timeout),
        retry(2)
      );
    };

    // 1. Récupérer la première page pour connaître le nombre total de pages
    return fetchPage(1).pipe(
      switchMap(firstPageResponse => {
        if (!firstPageResponse.success || !firstPageResponse.data || firstPageResponse.data.length === 0) {
          throw new Error('Réponse invalide de l\'API KEPLER');
        }

        const firstVehicle = firstPageResponse.data[0];
        const totalPages = parseInt(firstVehicle.nbPageList || '1', 10);

        // 2. Si plusieurs pages, récupérer toutes les autres pages en parallèle
        if (totalPages > 1) {
          const otherPages$ = Array.from(
            { length: totalPages - 1 }, 
            (_, i) => fetchPage(i + 2) // Pages 2, 3, 4, 5...
          );

          // 3. Combiner la première page avec toutes les autres
          return forkJoin([of(firstPageResponse), ...otherPages$]).pipe(
            map(allResponses => {
              // Fusionner tous les véhicules de toutes les pages
              const allVehicles = allResponses.flatMap(response => response.data);
              return allVehicles;
            })
          );
        } else {
          // Une seule page
          return of(firstPageResponse.data);
        }
      }),
      map(allVehicles => {
        // Mapper et filtrer tous les véhicules
        const vehicles = allVehicles
          .map(kv => this.vehicleMapper.mapKeplerToVehicle(kv))
          .filter(v => {
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
        
        return vehicles;
      }),
      catchError(error => {
        console.error('❌ Erreur API KEPLER:', error);
        
        // Stratégie de fallback en cascade
        
        // 1. Essayer le cache localStorage (vrais véhicules)
        const cachedVehicles = this.getFromLocalStorage();
        if (cachedVehicles && cachedVehicles.length > 0) {
          this.usingDegradedData = true;
          return of(cachedVehicles);
        }
        
        // 2. En dernier recours : mock data
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
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
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
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  }

  /**
   * Vide le cache (mémoire + localStorage)
   * Utile pour forcer un rechargement complet depuis l'API
   */
  clearCache(): void {
    this.cache = {};
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cache vidé (mémoire + localStorage)');
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
