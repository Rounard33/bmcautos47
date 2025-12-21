import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';

interface Service {
  id: string;
  title: string;
  description: string;
  iconType: 'website' | 'webapp' | 'redesign' | 'maintenance';
  features: string[];
  featured?: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  
  services: Service[] = [
    {
      id: 'website',
      title: 'Site Vitrine',
      description: 'Un site web professionnel pour présenter votre activité et attirer de nouveaux clients.',
      iconType: 'website',
      features: [
        'Design moderne et responsive',
        'Optimisé pour le référencement (SEO)',
        'Formulaire de contact intégré',
        'Compatible tous appareils',
        'Formation à la gestion du site'
      ],
      featured: true
    },
    {
      id: 'webapp',
      title: 'Application Web',
      description: 'Des applications sur-mesure pour digitaliser et automatiser vos processus métier.',
      iconType: 'webapp',
      features: [
        'Développement sur-mesure',
        'Interface intuitive',
        'Base de données sécurisée',
        'Évolutif selon vos besoins'
      ]
    },
    {
      id: 'redesign',
      title: 'Refonte de Site',
      description: 'Modernisez votre site existant avec un nouveau design et de meilleures performances.',
      iconType: 'redesign',
      features: [
        'Analyse de l\'existant',
        'Nouveau design moderne',
        'Migration des contenus',
        'Amélioration des performances',
        'Optimisation SEO'
      ]
    },
  ];

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
