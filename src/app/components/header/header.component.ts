import {CommonModule} from '@angular/common';
import {Component, HostListener, signal} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {NavigationService} from '../../services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMenuOpen = false;
  isScrolled = false;
  currentRoute = '';

  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  onNavClick(): void {
    this.closeMenu();
  }

  isActiveRoute(route: string): boolean {
    if (route === '/home') {
      return this.currentRoute === '/home' || this.currentRoute === '/';
    }
    return this.currentRoute === route;
  }

  /**
   * Smooth scroll to a section on the page
   */
  smoothScrollToSection(sectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    this.closeMenu();
    this.navigationService.requestCloseModal();

    // If already on home page, scroll directly
    if (this.currentRoute === '/home' || this.currentRoute === '/') {
      this.scrollToElement(sectionId);
    } else {
      // Navigate to home first, then scroll
      this.router.navigate(['/home']).then(() => {
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    }
  }

  /**
   * Scroll to a specific element on the page
   */
  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
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
