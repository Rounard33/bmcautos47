import {CommonModule} from '@angular/common';
import {Component, OnInit, signal} from '@angular/core';

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
        <div class="loader-text">Bienvenue sur BMC AUTOS 47</div>
      </div>
    </div>
  `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  isLoading = signal<boolean>(true);
  private minLoadTime = 800; // Durée minimum d'affichage (0.8s)
  private maxLoadTime = 3000; // Durée maximum (3s)
  private startTime = Date.now();

  ngOnInit() {
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      this.checkIfReady();
    } else {
      window.addEventListener('load', () => this.checkIfReady());
    }
    
    // Timeout de sécurité : disparaît après 3s max
    setTimeout(() => {
      if (this.isLoading()) {
        console.log('Loader timeout - fermeture forcée');
        this.hideLoader();
      }
    }, this.maxLoadTime);
  }

  private checkIfReady() {
    const elapsedTime = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);

    // Attendre le temps minimum
    setTimeout(() => {
      this.hideLoader();
    }, remainingTime);
  }

  private hideLoader() {
    this.isLoading.set(false);
    // Supprimer le loader du DOM après l'animation
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 600);
  }

  private async waitForImages(): Promise<void> {
    const images = Array.from(document.images);
    const imagePromises = images.map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener('load', () => resolve(undefined));
        img.addEventListener('error', () => resolve(undefined)); // Continuer même si erreur
      });
    });

    await Promise.all(imagePromises);
  }
}

