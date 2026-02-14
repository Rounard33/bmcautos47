import {Injectable} from '@angular/core';
import {DateFormatter} from './date-formatter';

/**
 * Service de formatage des données véhicules
 * Centralise tous les formatages pour cohérence et réutilisabilité
 */
@Injectable({
  providedIn: 'root'
})
export class VehicleFormatter {
  
  /**
   * Formate le kilométrage (ex: 45000 → "45 000 Km")
   */
  formatMileage(km: number): string {
    return `${km.toLocaleString('fr-FR')} Km`;
  }

  /**
   * Formate le prix (ex: 18500 → "18 500 €")
   */
  formatPrice(price: number | string): string {
    // Convertir en number si c'est une string
    const numPrice = typeof price === 'string' 
      ? parseFloat(price)
      : price;
    
    // Gérer les valeurs invalides
    if (isNaN(numPrice) || numPrice === 0) {
      return 'Prix non communiqué';
    }
    
    // Formater sans décimales
    return `${numPrice.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })} €`;
  }

  /**
   * Formate la transmission (normalisation FR)
   */
  formatTransmission(transmission: string): string {
    const mapping: { [key: string]: string } = {
      'auto': 'Automatique',
      'automatic': 'Automatique',
      'manual': 'Manuelle',
      'automatique': 'Automatique',
      'manuelle': 'Manuelle',
    };
    return mapping[transmission?.toLowerCase()] || transmission;
  }

  /**
   * Formate le carburant (normalisation FR)
   */
  formatFuel(fuel: string): string {
    const mapping: { [key: string]: string } = {
      'diesel': 'Diesel',
      'essence': 'Essence',
      'gasoline': 'Essence',
      'electric': 'Électrique',
      'hybrid': 'Hybride',
      'electrique': 'Électrique',
      'électrique': 'Électrique',
      'hybride': 'Hybride'
    };
    return mapping[fuel?.toLowerCase()] || fuel;
  }

  /**
   * Formate une date ISO en format français
   */
  formatDate(isoDate: string | undefined): string | undefined {
    return DateFormatter.toFrenchDate(isoDate);
  }

  /**
   * Mappe le statut KEPLER vers le statut interne
   */
  mapStatus(status?: string): 'available' | 'sold' | 'reserved' {
    if (!status) return 'available';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('vendu') || statusLower.includes('sold')) {
      return 'sold';
    }
    if (statusLower.includes('reserv') || statusLower.includes('reserved')) {
      return 'reserved';
    }
    return 'available';
  }

  /**
   * Formate la puissance fiscale (ex: 5 → "5 CV")
   */
  formatFiscalPower(power: number | undefined): string | undefined {
    if (!power) return undefined;
    return `${power} CV`;
  }

  /**
   * Formate la puissance réelle (ex: 90 → "90 ch")
   */
  formatRealPower(power: number | string | undefined): string | undefined {
    if (!power) return undefined;
    return typeof power === 'number' ? `${power} ch` : power;
  }

  /**
   * Formate les émissions CO2 (ex: 120 → "120 g/km")
   */
  formatCO2Emission(emission: number | undefined): string | undefined {
    if (!emission) return undefined;
    return `${emission} g/km`;
  }
}

