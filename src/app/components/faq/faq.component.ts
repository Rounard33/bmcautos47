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
      question: 'Quels types de véhicules proposez-vous ?',
      answer: 'Nous proposons un large choix de véhicules d\'occasion et neufs : citadines, berlines, SUV, utilitaires, et véhicules électriques/hybrides. Toutes marques disponibles. Notre stock est régulièrement renouvelé.',
      isOpen: false
    },
    {
      question: 'Les véhicules sont-ils garantis ?',
      answer: 'Oui, nous proposons une garantie de 12 mois sur la plupart de nos véhicules. Cette garantie couvre les pièces mécaniques et électriques principales. Des extensions de garantie sont également disponibles.',
      isOpen: false
    },
    {
      question: 'Puis-je faire reprendre mon ancien véhicule ?',
      answer: 'Absolument ! Nous reprenons votre ancien véhicule au meilleur prix. Nous réalisons une estimation gratuite et vous proposons une reprise immédiate pour faciliter votre achat.',
      isOpen: false
    },
    {
      question: 'Comment se passe la réservation d\'un véhicule ?',
      answer: 'Contactez-nous par téléphone ou via le formulaire de contact. Nous vous réservons le véhicule pendant 48h le temps que vous puissiez venir le voir et l\'essayer. Un acompte peut être demandé pour confirmer la réservation.',
      isOpen: false
    },
    {
      question: 'Proposez-vous des solutions de financement ?',
      answer: 'Oui, nous travaillons avec plusieurs organismes de crédit pour vous proposer des solutions de financement adaptées à votre budget. Nous vous accompagnons dans toutes vos démarches.',
      isOpen: false
    },
    {
      question: 'Les véhicules ont-ils un historique vérifiable ?',
      answer: 'Tous nos véhicules sont sélectionnés avec soin. Nous vérifions systématiquement l\'historique (carnet d\'entretien, rapport HistoVec, contrôle technique) et vous le communiquons de manière transparente.',
      isOpen: false
    },
    {
      question: 'Puis-je essayer le véhicule avant l\'achat ?',
      answer: 'Bien sûr ! Nous vous proposons systématiquement un essai routier pour que vous puissiez juger du comportement et du confort du véhicule avant votre décision d\'achat.',
      isOpen: false
    },
    {
      question: 'Vous occupez-vous des démarches administratives ?',
      answer: 'Oui, nous prenons en charge toutes les formalités : carte grise, certificat de cession, contrôle technique si nécessaire. Nous vous accompagnons jusqu\'à la remise des clés.',
      isOpen: false
    },
    {
      question: 'Faites-vous de la recherche personnalisée ?',
      answer: 'Oui ! Si vous cherchez un véhicule précis que nous n\'avons pas en stock, confiez-nous votre recherche. Nous mettons notre réseau à votre service pour trouver le véhicule qui correspond exactement à vos critères.',
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
