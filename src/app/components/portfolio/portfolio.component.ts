import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Component, computed, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Vehicle} from '../../models/vehicle.model';
import {KeplerVOService} from '../../services/kepler-vo.service';
import {NavigationService} from '../../services/navigation.service';
import {PreloadService} from '../../services/preload.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss', './portfolio-modal.styles.scss']
})
export class PortfolioComponent implements OnInit, OnDestroy {
  
  // États de chargement
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  
  // Subscriptions pour nettoyer à la destruction du composant
  private vehiclesSubscription?: Subscription;
  private preloadSubscription?: Subscription;
  private closeModalSubscription?: Subscription;
  private mobileQuery?: MediaQueryList;
  private mqListener?: (e: MediaQueryListEvent) => void;
  
  // Liste des véhicules (chargée depuis le service)
  vehicles = signal<Vehicle[]>([]);

  // Filtres (signals pour la réactivité)
  searchTerm = signal<string>('');
  selectedBrand = signal<string>('');
  selectedTransmission = signal<string>('');
  selectedFuel = signal<string>('');
  maxPrice = signal<number | null>(null);

  private platformId = inject(PLATFORM_ID);

  constructor(
    private keplerService: KeplerVOService,
    private navigationService: NavigationService,
    private preloadService: PreloadService
  ) {}

  ngOnInit(): void {
    // Détecter mobile pour utiliser images pleine taille (thumb Kepler peuvent échouer sur mobile)
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.mobileQuery = window.matchMedia('(max-width: 768px)');
      this.isMobile.set(this.mobileQuery.matches);
      this.mqListener = (e) => this.isMobile.set(e.matches);
      this.mobileQuery.addEventListener('change', this.mqListener);
    }

    // Fermer la modal quand l'utilisateur clique sur Accueil ou une catégorie du header
    this.closeModalSubscription = this.navigationService.closeModal$.subscribe(() => {
      if (this.showModal) {
        this.closeModal();
      }
    });

    // S'abonner à l'état du preload pour éviter les appels API en double
    this.preloadSubscription = this.preloadService.state$.subscribe(state => {
      if (!state.isLoading) {
        // Le preload est terminé
        if (state.vehicles.length > 0) {
          // Utiliser les véhicules préchargés (évite une double requête API)
          this.vehicles.set(state.vehicles);
          this.isLoading.set(false);
        } else {
          // Pas de véhicules préchargés, charger normalement
          this.loadVehicles();
        }
      }
      // Si isLoading = true, on attend que le preload se termine
    });
  }

  ngOnDestroy(): void {
    // Nettoyer les subscriptions pour éviter les fuites mémoire
    this.vehiclesSubscription?.unsubscribe();
    this.preloadSubscription?.unsubscribe();
    this.closeModalSubscription?.unsubscribe();
    if (this.mobileQuery && this.mqListener) {
      this.mobileQuery.removeEventListener('change', this.mqListener);
    }
  }

  /**
   * Charge les véhicules depuis le service KeplerVO
   * @param forceRefresh Force le rechargement depuis l'API (ignore le cache)
   */
  /**
   * Vérifie si on utilise des données dégradées (cache ou mock)
   */
  isUsingDegradedData(): boolean {
    return this.keplerService.isUsingDegradedData();
  }

  loadVehicles(forceRefresh: boolean = false): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.vehiclesSubscription = this.keplerService.getVehicles(forceRefresh).subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('error');
        this.isLoading.set(false);
        console.error('❌ Erreur lors du chargement des véhicules');
      }
    });
  }

  /**
   * Rafraîchit la liste des véhicules
   */
  refreshVehicles(): void {
    this.loadVehicles(true);
  }

  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return this.keplerService.isMockMode();
  }

  // Computed properties pour les filtres
  filteredVehicles = computed(() => {
    let result = this.vehicles();

    // Filtre par recherche
    const search = this.searchTerm();
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(v => 
        v.brand.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par marque
    const brand = this.selectedBrand();
    if (brand) {
      result = result.filter(v => v.brand === brand);
    }

    // Filtre par transmission
    const transmission = this.selectedTransmission();
    if (transmission) {
      result = result.filter(v => v.transmission === transmission);
    }

    // Filtre par carburant
    const fuel = this.selectedFuel();
    if (fuel) {
      result = result.filter(v => v.fuel === fuel);
    }

    // Filtre par prix max
    const priceMax = this.maxPrice();
    if (priceMax) {
      result = result.filter(v => {
        const price = parseFloat(v.price.replace(/[^\d]/g, ''));
        return price <= priceMax;
      });
    }

    return result;
  });

  // Options uniques pour les selects
  uniqueBrands = computed(() => {
    const brands = this.vehicles().map(v => v.brand);
    return [...new Set(brands)].sort();
  });

  uniqueTransmissions = computed(() => {
    const transmissions = this.vehicles().map(v => v.transmission);
    return [...new Set(transmissions)].sort();
  });

  uniqueFuels = computed(() => {
    const fuels = this.vehicles().map(v => v.fuel);
    return [...new Set(fuels)].sort();
  });

  // Modal & Carousel
  selectedVehicle = signal<Vehicle | null>(null);
  showModal = false;
  currentImageIndex = signal<number>(0);
  activeTab = signal<'overview' | 'equipment' | 'options'>('overview');
  
  // Lightbox
  showLightbox = signal<boolean>(false);
  lightboxImageIndex = signal<number>(0);

  /** Sur mobile, utiliser images (pleine taille) car les thumb Kepler peuvent échouer */
  isMobile = signal(false);

  openVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
    this.showModal = true;
    this.currentImageIndex.set(0);
    this.activeTab.set('overview');
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVehicle.set(null);
    this.currentImageIndex.set(0);
    this.activeTab.set('overview');
    this.closeLightbox(); // Ferme aussi la lightbox si elle est ouverte
  }

  nextImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images) {
      const newIndex = (this.currentImageIndex() + 1) % vehicle.images.length;
      this.currentImageIndex.set(newIndex);
    }
  }

  previousImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images) {
      const newIndex = this.currentImageIndex() === 0 
        ? vehicle.images.length - 1 
        : this.currentImageIndex() - 1;
      this.currentImageIndex.set(newIndex);
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }
  
  // Lightbox methods
  openLightbox(index: number): void {
    this.lightboxImageIndex.set(index);
    this.showLightbox.set(true);
  }
  
  closeLightbox(): void {
    this.showLightbox.set(false);
  }
  
  nextLightboxImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images) {
      const newIndex = (this.lightboxImageIndex() + 1) % vehicle.images.length;
      this.lightboxImageIndex.set(newIndex);
    }
  }
  
  previousLightboxImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images) {
      const newIndex = this.lightboxImageIndex() === 0 
        ? vehicle.images.length - 1 
        : this.lightboxImageIndex() - 1;
      this.lightboxImageIndex.set(newIndex);
    }
  }
  
  goToLightboxImage(index: number): void {
    this.lightboxImageIndex.set(index);
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (this.showLightbox()) {
      if (event.key === 'Escape') {
        this.closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        this.previousLightboxImage();
      } else if (event.key === 'ArrowRight') {
        this.nextLightboxImage();
      }
    }
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedBrand.set('');
    this.selectedTransmission.set('');
    this.selectedFuel.set('');
    this.maxPrice.set(null);
  }

  /** Fallback : photo si miniature échoue, puis placeholder si photo échoue aussi */
  onThumbnailError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = img.getAttribute('data-fallback');
    const placeholder = 'assets/img/placeholder.svg';

    if (fallback && img.src !== fallback) {
      img.src = fallback;
      img.setAttribute('data-fallback', placeholder);
    } else {
      img.src = placeholder;
      img.removeAttribute('data-fallback');
    }
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    if (this.showModal) {
      this.closeModal();
    }
    const element = document.getElementById('contact');
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}