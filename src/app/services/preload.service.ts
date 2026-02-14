import {Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {Vehicle} from '../models/vehicle.model';
import {KeplerVOService} from './kepler-vo.service';

export interface PreloadState {
  isLoading: boolean;
  vehicles: Vehicle[];
  isRealData: boolean; // true = vraies données API, false = mock/cache
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PreloadService {
  private state = new BehaviorSubject<PreloadState>({
    isLoading: true,
    vehicles: [],
    isRealData: false,
    error: null
  });

  public state$ = this.state.asObservable();

  constructor(private keplerService: KeplerVOService) {}

  /**
   * Précharge les véhicules depuis l'API
   * Retourne une Promise qui se résout quand les VRAIES données sont chargées
   */
  async preloadVehicles(): Promise<void> {
    try {
      console.log('🔄 Préchargement des véhicules...');
      
      // Charger les véhicules
      const vehicles = await firstValueFrom(
        this.keplerService.getVehicles(true) // Force refresh = bypass cache
      );

      // Vérifier si ce sont de vraies données ou du fallback
      const isRealData = !this.keplerService.isUsingDegradedData();

      console.log(`✅ Préchargement terminé: ${vehicles.length} véhicules`);
      console.log(`📊 Type de données: ${isRealData ? 'API réelle' : 'Données de secours'}`);

      this.state.next({
        isLoading: false,
        vehicles,
        isRealData,
        error: isRealData ? null : 'Données de secours utilisées'
      });

    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
      this.state.next({
        isLoading: false,
        vehicles: [],
        isRealData: false,
        error: 'Erreur de chargement'
      });
    }
  }

  /**
   * Retourne les véhicules préchargés (pour éviter de recharger)
   */
  getPreloadedVehicles(): Vehicle[] {
    return this.state.value.vehicles;
  }

  /**
   * Indique si les données sont réelles (pas mock/cache)
   */
  hasRealData(): boolean {
    return this.state.value.isRealData;
  }

  /**
   * Retourne l'état actuel du préchargement
   */
  getState(): PreloadState {
    return this.state.value;
  }
}
