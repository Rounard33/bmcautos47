import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  department?: string;
  projectType: string;
  
  // Champs spécifiques recherche personnalisée
  brand?: string;
  model?: string;
  budget?: string;
  transmission?: string;
  fuel?: string;
  category?: string;
  mileage?: string;
  yearFrom?: string;
  yearTo?: string;
  
  // Champs spécifiques reprise
  repriseBrand?: string;
  repriseModel?: string;
  repriseYear?: string;
  repriseMileage?: string;
  repriseCondition?: string;
  
  message: string;
}

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent {
  private http = inject(HttpClient);
  
  // API contact (Resend via Vercel)
  private readonly CONTACT_API_URL = '/api/contact';
  
  isSubmitting = false;
  submitSuccess = signal(false);
  submitError = signal(false);
  errorMessage = signal('');
  
  // Honeypot anti-spam (doit rester vide)
  honeypot = '';
  
  formData: ContactForm = {
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  };
  
  // Liste des marques disponibles
  brands = [
    'Alfa Romeo', 'BMW', 'Citroën', 'Fiat', 'Ford', 
    'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Land Rover',
    'Lexus', 'Mercedes', 'Mitsubishi', 'Peugeot', 'Renault'
  ];
  
  transmissionTypes = ['Manuelle', 'Automatique'];
  fuelTypes = ['Essence', 'Diesel', 'Électrique', 'Hybride', 'Gaz Naturel', 'GPL'];
  categories = [
    'Berline', 'Break', 'Cabriolet', 'Citadine', 'Coupé',
    'Monospace', 'Pick-Up', 'SUV / 4x4', 'Utilitaire'
  ];
  
  years: number[] = [];
  
  constructor() {
    // Générer les années de 2005 à année actuelle + 1
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 1; year >= 2005; year--) {
      this.years.push(year);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    
    // Anti-spam : si le honeypot est rempli, c'est un bot
    if (this.honeypot) {
      console.log('Bot détecté via honeypot');
      // On simule un succès pour ne pas alerter le bot
      this.submitSuccess.set(true);
      setTimeout(() => this.submitSuccess.set(false), 8000);
      return;
    }
    
    this.isSubmitting = true;
    this.submitError.set(false);
    this.submitSuccess.set(false);
    
    try {
      await this.sendToContactApi();
      
      this.submitSuccess.set(true);
      this.resetForm();
      
      // Reset success message after 8 seconds
      setTimeout(() => {
        this.submitSuccess.set(false);
      }, 8000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      this.submitError.set(true);
      this.errorMessage.set('Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.');
      
      // Reset error message after 8 seconds
      setTimeout(() => {
        this.submitError.set(false);
      }, 8000);
    } finally {
      this.isSubmitting = false;
    }
  }

  private sendToContactApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = {
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone || 'Non renseigné',
        projectType: this.formData.projectType,
        budget: this.formData.budget || 'À définir',
        message: this.formData.message,
      };

      this.http.post(this.CONTACT_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      projectType: '',
      message: ''
    };
  }
}
