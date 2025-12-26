import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Brand {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-brands-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brands-carousel.component.html',
  styleUrl: './brands-carousel.component.scss'
})
export class BrandsCarouselComponent {
  brands: Brand[] = [
    { name: 'Alfa Romeo', logo: 'assets/brands/alfa-romeo.png' },
    { name: 'Citroën', logo: 'assets/brands/citroen.png' },
    { name: 'Fiat', logo: 'assets/brands/fiat.png' },
    { name: 'Ford', logo: 'assets/brands/ford.png' },
    { name: 'Hyundai', logo: 'assets/brands/hyundai.png' },
    { name: 'Jaguar', logo: 'assets/brands/jaguar.png' },
    { name: 'Kia', logo: 'assets/brands/kia.png' },
    { name: 'Peugeot', logo: 'assets/brands/peugeot.png' },
    { name: 'Renault', logo: 'assets/brands/renault.png' }
  ];
}
