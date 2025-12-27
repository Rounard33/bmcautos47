import {CommonModule} from '@angular/common';
import {Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

interface Vehicle {
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
  features: string[];
  status: 'available' | 'sold' | 'reserved';
  details?: {
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
  };
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ajout de FormsModule
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss', './portfolio-modal.styles.scss']
})
export class PortfolioComponent {
  
  vehicles = signal<Vehicle[]>([
    {
      id: 'land-rover-discovery',
      brand: 'Land Rover',
      model: 'Discovery Sport 2.0d 180ch R-Dynamic SE',
      year: 2020,
      mileage: '53.657 Km',
      transmission: 'Automatique',
      fuel: 'Diesel',
      price: '32.900 €',
      image: 'assets/img/Land rover/land-rover-1.jpg',
      images: [
        'assets/img/Land rover/land-rover-1.jpg',
        'assets/img/Land rover/land-rover-2.jpg',
        'assets/img/Land rover/land-rover-3.jpg',
        'assets/img/Land rover/land-rover-4.jpg',
        'assets/img/Land rover/land-rover-5.jpg'
      ],
      features: ['Toit panoramique', '7 Places', 'Garantie 12 Mois'],
      status: 'available',
      details: {
        finition: 'R-Dynamic SE BVA (Toit panoramique, 7 Places, garantie 12 Mois)',
        category: '4x4 / SUV / Crossover',
        firstRegistration: '07/2020',
        warranty: '12 Mois Agir garantie',
        exteriorColor: 'Blanc Yulong Métallisée',
        interiorColor: 'Ebony',
        fiscalPower: '10 CV',
        power: '180 ch (133 kW)',
        co2Emission: '145 g/km',
        doors: 5,
        reference: 'ELOT_1297132_3114470140',
        description: 'Suivi intégralement concession Land Rover. Diesel / Micro hybride. Kilométrage garantie : 53 657 km.',
        standardEquipment: [
          'Alarme ultrasonique',
          'Allumage automatique des phares et essuie-glaces automatiques',
          'Assistance au démarrage en côte (HSA)',
          'Bluetooth connectivity',
          'Caméra de recul',
          'Caméra stéréoscopique avec freinage d\'urgence',
          'Climatisation automatique 2 zones',
          'Console centrale avec accoudoir',
          'Contrôle de stabilité (DSC)',
          'Détecteur d\'obstacle AV/AR et caméra de recul',
          'Écran tactile Touch Pro 10"',
          'Finition Gloss Black',
          'Fixation ISOFIX sur le siège passager AV',
          'Frein de stationnement électrique',
          'Lumière d\'ambiance',
          'Miroirs de courtoisie éclairés',
          'Pavillon en tissu Morzine Light Oyster',
          'Phares LED avec feux de circulation diurnes (DRL)',
          'Prises AV/AR 12V et USB',
          'Radio numérique DAB',
          'Régulateur de vitesse avec limiteur',
          'Rétroviseurs extérieurs chauffants',
          'Système audio 180W',
          'Système d\'assistance au maintien de voie',
          'Système de freinage d\'urgence',
          'Système multimédia InControl Touch Pro',
          'Volant en cuir multifonction'
        ],
        optionalEquipment: [
          'Caméras panoramiques 3D (464 €)',
          'Black Pack Extérieur (777 €)',
          'Capteur de qualité de l\'air (87 €)',
          'Chargeur à induction (103 €)',
          'Climatisation Bi-Zone avec contrôle AR (340 €)',
          'Jantes 20" 5 branches doubles Gloss Sparkle Silver (1 848 €)',
          'Pédalier en métal Bright (206 €)',
          'Peinture métallisée Blanc Yulong (982 €)',
          'Phares antibrouillard AV (215 €)',
          'Phares Premium LED avec signature LED (1 132 €)',
          'Prises supplémentaires (145 €)',
          'Rétroviseurs photosensibles, chauffants, rabattables (515 €)',
          'Roue de secours de taille réduite (248 €)',
          'Seconde rangée de sièges réglable (566 €)',
          'Sièges AV chauffants réglables électriquement 12x12 (422 €)',
          'Sièges en cuir Windsor Ebony (5 102 €)',
          'Système d\'entrée sans clé (530 €)',
          'Tapis de sol (108 €)',
          'Toit panoramique fixe (1 513 €)',
          'Vitrage AR fumé (442 €)',
          'Volant chauffant (258 €)',
          'Wade Sensing'
        ]
      }
    },
    {
      id: 'fiat-500e',
      brand: 'Fiat',
      model: '500 e 118ch Icone Plus 42 kwh',
      year: 2021,
      mileage: '26.808 Km',
      transmission: 'Automatique',
      fuel: 'Électrique',
      price: '16.900 €',
      image: 'assets/img/E 118CH/fiat-500-e118.jpg',
      images: ['assets/img/E 118CH/fiat-500-e118.jpg'],
      features: ['1ère Main', 'Toit Panoramique'],
      status: 'available'
    },
    {
      id: 'renault-clio',
      brand: 'Renault',
      model: 'Clio 5 1.0 Sce 65 ch Business',
      year: 2021,
      mileage: '48.364 Km',
      transmission: 'Mécanique',
      fuel: 'Essence',
      price: '11.990 €',
      image: 'assets/img/5 1.0/194698179-normal.jpg',
      images: ['assets/img/5 1.0/194698179-normal.jpg'],
      features: ['1ère Main', 'Radar de recul', 'GPS', 'Garantie 12 Mois'],
      status: 'available'
    },
    {
      id: 'jeep-compass',
      brand: 'Jeep',
      model: 'Compass 2.0 L Multijet 140 ch 4x4',
      year: 2018,
      mileage: '104.658 Km',
      transmission: 'Mécanique',
      fuel: 'Diesel',
      price: '15.800 €',
      image: 'assets/img/2.0 L multijet/194450657-normal.jpg',
      images: ['assets/img/2.0 L multijet/194450657-normal.jpg'],
      features: ['Active Drive', '4x4', 'Longitude'],
      status: 'available'
    },
    {
      id: 'fiat-talento',
      brand: 'Fiat',
      model: 'Talento L2 H1 6 places 1.6 Multijet 120',
      year: 2018,
      mileage: '90.924 Km',
      transmission: 'Mécanique',
      fuel: 'Diesel',
      price: '19.800 €',
      image: 'assets/img/l2 H16/194136723-normal.jpg',
      images: ['assets/img/l2 H16/194136723-normal.jpg'],
      features: ['Attelage', 'Protection bois', '1ère Main', 'Pack Pro Nav'],
      status: 'available'
    },
    {
      id: 'lexus-ux',
      brand: 'Lexus',
      model: 'UX 250h 2WD F Sport',
      year: 2022,
      mileage: '24.600 Km',
      transmission: 'Automatique',
      fuel: 'Hybride',
      price: '27.800 €',
      image: 'assets/img/250H/193654908-normal.jpg',
      images: ['assets/img/250H/193654908-normal.jpg'],
      features: ['Bleu Saphir', '1ère Main', 'Toutes options'],
      status: 'available'
    }
  ]);

  // Filtres (signals pour la réactivité)
  searchTerm = signal<string>('');
  selectedBrand = signal<string>('');
  selectedTransmission = signal<string>('');
  selectedFuel = signal<string>('');
  maxPrice = signal<number | null>(null);

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