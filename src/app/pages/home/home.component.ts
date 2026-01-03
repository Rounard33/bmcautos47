import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {RouterModule} from '@angular/router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {AboutComponent} from '../../components/about/about.component';
import {BrandsCarouselComponent} from '../../components/brands-carousel/brands-carousel.component';
import {CtaComponent} from '../../components/cta/cta.component';
import {FaqComponent} from '../../components/faq/faq.component';
import {GalleryComponent} from '../../components/gallery/gallery.component';
import {PortfolioComponent} from '../../components/portfolio/portfolio.component';
import {ProcessComponent} from '../../components/process/process.component';
import {ScrollToTopComponent} from '../../components/scroll-to-top/scroll-to-top.component';
import {SectionDividerComponent} from '../../components/section-divider/section-divider.component';
import {ServicesComponent} from '../../components/services/services.component';
import {WelcomeComponent} from '../../components/welcome/welcome.component';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    WelcomeComponent,
    AboutComponent,
    BrandsCarouselComponent,
    ServicesComponent,
    PortfolioComponent,
    ProcessComponent,
    FaqComponent,
    CtaComponent,
    ScrollToTopComponent,
    SectionDividerComponent,
    GalleryComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnDestroy {

  ngAfterViewInit(): void {
    // Initialize scroll animations after a short delay
    setTimeout(() => {
      this.initScrollAnimations();
    }, 500);
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initScrollAnimations(): void {
    // Animate section dividers
    gsap.utils.toArray('.section-divider').forEach((element: any) => {
      gsap.fromTo(element, {
        scaleX: 0,
        opacity: 0
      }, {
        scaleX: 1,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate section headers
    gsap.utils.toArray('.section-header').forEach((element: any) => {
      gsap.fromTo(element, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate gallery items
    gsap.utils.toArray('.gallery-item').forEach((element: any, index: number) => {
      gsap.fromTo(element, {
        y: 40,
        opacity: 0,
        scale: 0.9
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: index * 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate service cards
    gsap.utils.toArray('.service-card').forEach((element: any, index: number) => {
      gsap.fromTo(element, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate project cards
    gsap.utils.toArray('.project-card, .cta-card').forEach((element: any) => {
      gsap.fromTo(element, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate step cards
    gsap.utils.toArray('.step-card').forEach((element: any, index: number) => {
      gsap.fromTo(element, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: index * 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Animate FAQ items
    gsap.utils.toArray('.faq-item').forEach((element: any, index: number) => {
      gsap.fromTo(element, {
        x: -30,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        delay: index * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }
}
