import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {RouterModule} from '@angular/router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('title') title!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('actions') actions!: ElementRef;

  // Carrousel d'images
  carouselImages = [
    {
      src: '../../../assets/img/presentation/facade garage.jpg',
      alt: 'Façade du garage BMC AUTOS 47'
    },
    {
      src: '../../../assets/img/presentation/facade garage 2.jpg',
      alt: 'Façade du garage BMC AUTOS 47 - Vue 2'
    },
    {
      src: '../../../assets/img/presentation/intérieur.jpg',
      alt: 'Intérieur du garage BMC AUTOS 47'
    },
    {
      src: '../../../assets/img/presentation/panorama.jpg',
      alt: 'Vue panoramique du garage BMC AUTOS 47'
    },
    {
      src: '../../../assets/img/presentation/facade.png',
      alt: 'BMC AUTOS 47 - Équipe familiale'
    }
  ];

  currentImageIndex = 0;
  private carouselInterval: any;

  scrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const element = document.getElementById(sectionId);
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

  ngAfterViewInit() {
    this.initWelcomeAnimations();
    this.startCarousel();
  }

  ngOnDestroy() {
    // Nettoyer l'interval du carrousel
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  /**
   * Démarre le carrousel automatique
   */
  private startCarousel() {
    // Changer d'image toutes les 5 secondes
    this.carouselInterval = setInterval(() => {
      this.nextImage();
    }, 5000);
  }

  /**
   * Passe à l'image suivante
   */
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
  }

  /**
   * Passe à l'image précédente
   */
  previousImage() {
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.carouselImages.length - 1 
      : this.currentImageIndex - 1;
  }

  private initWelcomeAnimations() {
    if (!this.title || !this.description || !this.actions) return;

    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animation du badge
    tl.from('.badge', {
      duration: 0.8,
      y: -30,
      opacity: 0,
      ease: "power2.out"
    });

    // Animation du titre
    tl.from(this.title.nativeElement.querySelectorAll('.title-line'), {
      duration: 1.2,
      y: 50,
      opacity: 0,
      ease: "power3.out",
      stagger: 0.2
    }, "-=0.4");

    // Animation de la description
    tl.from(this.description.nativeElement, {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.6");

    // Animation des boutons
    tl.from(this.actions.nativeElement, {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.4");
  }
}
