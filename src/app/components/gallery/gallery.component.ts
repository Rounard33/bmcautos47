import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit, signal} from '@angular/core';

interface GalleryImage {
  src: string;
  alt: string;
  category: 'equipe' | 'exterieur' | 'interieur';
  title: string;
  description: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  currentSlide = signal<number>(0);
  isAutoPlaying = signal<boolean>(true);
  private autoPlayInterval: any;

  images: GalleryImage[] = [
    { 
      src: 'assets/img/presentation/facade garage.jpg', 
      alt: 'Façade principale BMC AUTOS 47 à Pujols', 
      category: 'exterieur',
      title: 'Notre Garage',
      description: 'Situé à Pujols sur la route d\'Agen, facile d\'accès'
    },
    { 
      src: 'assets/img/presentation/panorama.jpg', 
      alt: 'Vue panoramique et parking véhicules', 
      category: 'exterieur',
      title: 'Vue Panoramique',
      description: 'Un grand parking pour accueillir nos véhicules en exposition'
    },
    { 
      src: 'assets/img/presentation/exterieur 2.jpg', 
      alt: 'Extérieur avec véhicules en exposition', 
      category: 'exterieur',
      title: 'Véhicules en Exposition',
      description: 'Une sélection de véhicules soigneusement préparés'
    },
    { 
      src: 'assets/img/presentation/facade.png', 
      alt: 'Devanture BMC AUTOS 47', 
      category: 'exterieur',
      title: 'Notre Enseigne',
      description: 'Un garage familial reconnu dans le Lot-et-Garonne'
    },
    { 
      src: 'assets/img/presentation/intérieur.jpg', 
      alt: 'Intérieur', 
      category: 'interieur',
      title: 'Notre Atelier',
      description: 'Un atelier moderne et bien équipé pour la préparation'
    },
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      if (this.isAutoPlaying()) {
        this.nextSlide();
      }
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  pauseAutoPlay() {
    this.isAutoPlaying.set(false);
  }

  resumeAutoPlay() {
    this.isAutoPlaying.set(true);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  nextSlide() {
    const nextIndex = (this.currentSlide() + 1) % this.images.length;
    this.currentSlide.set(nextIndex);
  }

  previousSlide() {
    const prevIndex = this.currentSlide() === 0 
      ? this.images.length - 1 
      : this.currentSlide() - 1;
    this.currentSlide.set(prevIndex);
  }
}

