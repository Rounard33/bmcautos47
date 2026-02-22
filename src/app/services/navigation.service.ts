import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  /** Émis quand une navigation (header, lien) demande de fermer la modal véhicule */
  readonly closeModal$ = new Subject<void>();

  /** Demande la fermeture de la modal (ex: clic sur Accueil, catégorie, etc.) */
  requestCloseModal(): void {
    this.closeModal$.next();
  }
  constructor(private router: Router) {
    this.initScrollToTop();
  }

  private initScrollToTop(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  scrollToElement(elementId: string): void {
    if (typeof window !== 'undefined') {
      try {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } catch (error) {
        // Silently handle errors to prevent breaking navigation
        // In production, you might want to log this to a monitoring service
      }
    }
  }
}
