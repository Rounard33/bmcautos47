import {CommonModule} from '@angular/common';
import {Component, signal} from '@angular/core';
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
  images: string[];
  features: string[];
  status: 'available' | 'sold' | 'reserved';
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent {
  
  // Filtres
  filters = {
    brand: '',
    transmission: '',
    fuel: '',
    priceMax: '',
    search: ''
  };
  
  allVehicles: Vehicle[] = [
    {
      id: 'land-rover-discovery',
      brand: 'Land Rover',
      model: 'Discovery Sport 2.0d 180ch R-Dynamic SE',
      year: 2020,
      mileage: '53.657 Km',
      transmission: 'Automatique',
      fuel: 'Diesel',
      price: '32.900 €',
      images: [
        'assets/img/Land rover/195177755-normal.jpg',
        'assets/img/Land rover/land-rover-discovery-sport-land-rover-2-0d-180ch-r-dynamic-se-bva-toit-panoramique-7-places-garantie-12-mois-195177756 (1).jpg',
        'assets/img/Land rover/land-rover-discovery-sport-land-rover-2-0d-180ch-r-dynamic-se-bva-toit-panoramique-7-places-garantie-12-mois-195177757.jpg',
        'assets/img/Land rover/land-rover-discovery-sport-land-rover-2-0d-180ch-r-dynamic-se-bva-toit-panoramique-7-places-garantie-12-mois-195177758 (1).jpg',
        'assets/img/Land rover/land-rover-discovery-sport-land-rover-2-0d-180ch-r-dynamic-se-bva-toit-panoramique-7-places-garantie-12-mois-195177759 (1).jpg'
      ],
      features: ['Toit panoramique', '7 Places', 'Garantie 12 Mois'],
      status: 'available'
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
      images: ['assets/img/E 118CH/195177750-normal.jpg'],
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
      images: ['assets/img/250H/193654908-normal.jpg'],
      features: ['Bleu Saphir', '1ère Main', 'Toutes options'],
      status: 'available'
    }
  ];
  
  vehicles = signal<Vehicle[]>([...this.allVehicles]);

  selectedVehicle = signal<Vehicle | null>(null);
  currentImageIndex = signal<number>(0);
  showModal = false;

  openVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
    this.currentImageIndex.set(0);
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVehicle.set(null);
    this.currentImageIndex.set(0);
    document.body.style.overflow = 'auto';
  }

  nextImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images.length > 1) {
      const currentIndex = this.currentImageIndex();
      this.currentImageIndex.set((currentIndex + 1) % vehicle.images.length);
    }
  }

  previousImage(): void {
    const vehicle = this.selectedVehicle();
    if (vehicle && vehicle.images.length > 1) {
      const currentIndex = this.currentImageIndex();
      this.currentImageIndex.set(currentIndex === 0 ? vehicle.images.length - 1 : currentIndex - 1);
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }
  
  applyFilters(): void {
    let filtered = [...this.allVehicles];
    
    // Filtre par marque
    if (this.filters.brand) {
      filtered = filtered.filter(v => 
        v.brand.toLowerCase() === this.filters.brand.toLowerCase()
      );
    }
    
    // Filtre par transmission
    if (this.filters.transmission) {
      filtered = filtered.filter(v => 
        v.transmission.toLowerCase() === this.filters.transmission.toLowerCase()
      );
    }
    
    // Filtre par carburant
    if (this.filters.fuel) {
      filtered = filtered.filter(v => 
        v.fuel.toLowerCase() === this.filters.fuel.toLowerCase()
      );
    }
    
    // Filtre par prix max
    if (this.filters.priceMax) {
      const maxPrice = parseFloat(this.filters.priceMax);
      filtered = filtered.filter(v => {
        const price = parseFloat(v.price.replace(/[^0-9]/g, ''));
        return price <= maxPrice;
      });
    }
    
    // Recherche textuelle
    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(v =>
        v.brand.toLowerCase().includes(searchTerm) ||
        v.model.toLowerCase().includes(searchTerm) ||
        v.features.some(f => f.toLowerCase().includes(searchTerm))
      );
    }
    
    this.vehicles.set(filtered);
  }
  
  resetFilters(): void {
    this.filters = {
      brand: '',
      transmission: '',
      fuel: '',
      priceMax: '',
      search: ''
    };
    this.vehicles.set([...this.allVehicles]);
  }
  
  get uniqueBrands(): string[] {
    return [...new Set(this.allVehicles.map(v => v.brand))].sort();
  }
  
  get uniqueTransmissions(): string[] {
    return [...new Set(this.allVehicles.map(v => v.transmission))].sort();
  }
  
  get uniqueFuels(): string[] {
    return [...new Set(this.allVehicles.map(v => v.fuel))].sort();
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
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
