import {CommonModule} from '@angular/common';
import {Component, signal} from '@angular/core';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  url?: string;
  status: 'completed' | 'in-progress';
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent {
  
  projects = signal<Project[]>([
    {
      id: 'reiki-sens',
      title: 'Reiki & Sens',
      description: 'Site vitrine pour une praticienne Reiki. Design apaisant avec système de réservation en ligne et gestion des rendez-vous.',
      image: 'assets/img/portfolio/reiki-sens.jpg',
      tags: ['Angular', 'TypeScript', 'Supabase', 'SCSS'],
      url: 'https://reikietsens.fr',
      status: 'completed'
    }
  ]);

  selectedProject = signal<Project | null>(null);

  openProject(project: Project): void {
    if (project.url) {
      window.open(project.url, '_blank');
    }
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

