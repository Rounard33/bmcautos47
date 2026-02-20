import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';

interface Service {
  id: string;
  title: string;
  description: string;
  iconType: 'sale' | 'search' | 'trade' | 'warranty';
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
      id: 'sale',
      title: 'Vente de véhicules',
      description: 'Un large choix de véhicules d\'occasion et neufs, sélectionnés avec soin pour leur qualité.',
      iconType: 'sale',
      features: [
        'Véhicules contrôlés',
        'Historique transparent',
        'Toutes marques disponibles',
        'Stock régulièrement renouvelé',
        'Financement possible'
      ],
      featured: true
    },
    {
      id: 'search',
      title: 'Recherche personnalisée',
      description: 'Vous cherchez un véhicule précis ? Confiez-nous votre recherche et nous le trouvons pour vous.',
      iconType: 'search',
      features: [
        'Service gratuit',
        'Recherche ciblée',
        'Accompagnement personnalisé',
        'Délai rapide'
      ]
    },
    {
      id: 'trade',
      title: 'Reprise de votre véhicule',
      description: 'Nous reprenons votre ancien véhicule au meilleur prix pour faciliter votre achat.',
      iconType: 'trade',
      features: [
        'Estimation gratuite',
        'Reprise immédiate',
        'Démarches simplifiées'
      ]
    },
    {
      id: 'warranty',
      title: 'Garantie 12 mois',
      description: 'Tous nos véhicules sont garantis 12 mois. Extension possible jusqu\'à 24 mois pour votre tranquillité.',
      iconType: 'warranty',
      features: [
        'Garantie 12 mois incluse',
        'Extension jusqu\'à 24 mois',
      ]
    }
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
