import {CommonModule} from '@angular/common';
import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Vehicle} from '../../models/vehicle.model';
import {KeplerVOService} from '../../services/kepler-vo.service';

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
  
  // Subscription pour nettoyer à la destruction du composant
  private vehiclesSubscription?: Subscription;
  
  // Liste des véhicules (chargée depuis le service)
  vehicles = signal<Vehicle[]>([]);

  // Filtres (signals pour la réactivité)
  searchTerm = signal<string>('');
  selectedBrand = signal<string>('');
  selectedTransmission = signal<string>('');
  selectedFuel = signal<string>('');
  maxPrice = signal<number | null>(null);

  constructor(private keplerService: KeplerVOService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    // Nettoyer la subscription pour éviter les fuites mémoire
    this.vehiclesSubscription?.unsubscribe();
  }

  /**
   * Charge les véhicules depuis le service KeplerVO
   * @param forceRefresh Force le rechargement depuis l'API (ignore le cache)
   */
  loadVehicles(forceRefresh: boolean = false): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.vehiclesSubscription = this.keplerService.getVehicles(forceRefresh).subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.isLoading.set(false);
        console.log('✅ Véhicules chargés avec succès:', vehicles.length);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erreur lors du chargement des véhicules');
        this.isLoading.set(false);
        console.error('❌ Erreur lors du chargement:', error);
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

  openVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
    this.showModal = true;
    this.currentImageIndex.set(0);
    this.activeTab.set('overview');
    document.body.style.overflow = 'hidden'; // Empêche le scroll
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVehicle.set(null);
    this.currentImageIndex.set(0);
    this.activeTab.set('overview');
    document.body.style.overflow = ''; // Réactive le scroll
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

  applyFilters(): void {
    // Le computed property se met à jour automatiquement
    // Cette méthode peut être utilisée pour des actions supplémentaires si besoin
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedBrand.set('');
    this.selectedTransmission.set('');
    this.selectedFuel.set('');
    this.maxPrice.set(null);
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