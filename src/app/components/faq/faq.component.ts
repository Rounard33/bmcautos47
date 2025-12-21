import {CommonModule} from '@angular/common';
import {Component, signal} from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  
  faqs = signal<FaqItem[]>([
    {
      question: 'Combien coûte la création d\'un site web ?',
      answer: 'Le prix varie selon vos besoins : nombre de pages, fonctionnalités souhaitées, design personnalisé... Je propose des devis gratuits et personnalisés. Comptez en moyenne entre 800€ et 3000€ pour un site vitrine professionnel.',
      isOpen: false
    },
    {
      question: 'Combien de temps faut-il pour créer un site ?',
      answer: 'En général, comptez 2 à 4 semaines pour un site vitrine standard. Ce délai peut varier selon la complexité du projet et votre réactivité pour les validations. Je vous tiens informé à chaque étape.',
      isOpen: false
    },
    {
      question: 'Mon site sera-t-il adapté aux mobiles ?',
      answer: 'Absolument ! Tous mes sites sont conçus en "responsive design", ce qui signifie qu\'ils s\'adaptent automatiquement à tous les écrans : ordinateurs, tablettes et smartphones.',
      isOpen: false
    },
    {
      question: 'Puis-je modifier mon site moi-même après sa création ?',
      answer: 'Oui, selon vos besoins. Je peux intégrer un système de gestion de contenu simple qui vous permettra de modifier textes et images. Je vous forme également à son utilisation.',
      isOpen: false
    },
    {
      question: 'Vous occupez-vous du design du logo ?',
      answer: 'Non, je n\'ai pas les connaissances techniques dans la création de logo.',
      isOpen: false
    },
    {
      question: 'Qu\'est-ce que le référencement SEO ?',
      answer: 'Le SEO (Search Engine Optimization), ou référencement naturel, consiste à aider les moteurs de recherche à interpréter votre contenu, et à aider les internautes à trouver votre site.',
      isOpen: false
    },
    {
      question: 'Le référencement (SEO) est-il inclus ?',
      answer: 'Oui, j\'optimise tous mes sites pour le référencement naturel : structure technique, balises, vitesse de chargement... Cela vous assure une bonne base pour apparaître sur Google.',
      isOpen: false
    },
    {
      question: 'Comment se passe le paiement ?',
      answer: 'Je demande généralement un acompte de 30% à la signature du devis, puis le solde à la livraison. Pour les projets importants, un échelonnement peut être envisagé.',
      isOpen: false
    }
  ]);

  toggleFaq(index: number): void {
    this.faqs.update(faqs => {
      return faqs.map((faq, i) => ({
        ...faq,
        isOpen: i === index ? !faq.isOpen : faq.isOpen
      }));
    });
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
