import {CommonModule} from '@angular/common';
import {Component, OnInit, signal} from '@angular/core';
import {PreloadService} from '../../services/preload.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" [class.fade-out]="!isLoading()">
      <div class="loader-content">
        <div class="loader-logo">
          <img src="assets/logo/logo.png" alt="BMC AUTOS 47">
        </div>
        <div class="loader-text">{{ loadingMessage() }}</div>
        
        <!-- Barre de progression -->
        @if (showProgress()) {
          <div class="loader-progress">
            <div class="progress-bar" [style.width.%]="progress()"></div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('Bienvenue sur BMC AUTOS 47');
  showProgress = signal<boolean>(false);
  progress = signal<number>(0);
  
  private minLoadTime = 800; // Durée minimum d'affichage (0.8s)
  private maxLoadTime = 10000; // Durée maximum augmentée à 10s pour l'API
  private startTime = Date.now();

  constructor(private preloadService: PreloadService) {}

  async ngOnInit() {
    try {
      // Étape 1: Attendre le DOM
      this.loadingMessage.set('Chargement...');
      await this.waitForDOM();
      
      // Étape 2: Précharger les véhicules
      this.showProgress.set(true);
      
      // Simuler une progression pendant le chargement
      const progressInterval = setInterval(() => {
        const current = this.progress();
        if (current < 90) {
          this.progress.set(current + 10);
        }
      }, 200);

      // Charger les véhicules depuis l'API
      await this.preloadService.preloadVehicles();
      
      clearInterval(progressInterval);
      this.progress.set(100);

      // Vérifier si ce sont de vraies données
      const state = this.preloadService.getState();
      
      if (state.isRealData && state.vehicles.length > 0) {
        // Vraies données chargées avec succès !
        await this.delay(500);
        this.hideLoader();
      } else if (state.vehicles.length > 0) {
        // Données de secours (cache ou mock)
        await this.delay(500);
        this.hideLoader();
      } else {
        // Aucune donnée
        this.loadingMessage.set('Erreur de chargement');
        await this.delay(1000);
        this.hideLoader();
      }
      
    } catch (error) {
      console.error('❌ Erreur préchargement:', error);
      // En cas d'erreur, respecter le temps minimum puis afficher
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.minLoadTime - elapsed);
      await this.delay(remaining);
      this.hideLoader();
    }
    
    // Timeout de sécurité : force la fermeture après 10s max
    setTimeout(() => {
      if (this.isLoading()) {
        console.warn('⚠️ Loader timeout - fermeture forcée après 10s');
        this.hideLoader();
      }
    }, this.maxLoadTime);
  }

  private async waitForDOM(): Promise<void> {
    if (document.readyState === 'complete') {
      return;
    }
    return new Promise(resolve => {
      window.addEventListener('load', () => resolve());
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private hideLoader() {
    this.isLoading.set(false);
    // Réactiver le scroll après l'animation
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 600);
  }
}

