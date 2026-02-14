import {Injectable} from '@angular/core';
import {VehicleFormatter} from '../formatters/vehicle-formatter';
import {Vehicle, VehicleDetails} from '../models/vehicle.model';

/**
 * Service de transformation des données KEPLER API v3.8
 * Convertit les données de l'API vers le modèle interne Vehicle
 */
@Injectable({
  providedIn: 'root'
})
export class VehicleMapper {
  
  constructor(private formatter: VehicleFormatter) {}

  /**
   * Transforme un véhicule KEPLER API v3.8 en Vehicle
   * Supporte à la fois l'ancien format et le nouveau format de l'API
   */
  mapKeplerToVehicle(apiVehicle: any): Vehicle {
    const isNewFormat = this.isNewAPIFormat(apiVehicle);
    
    return {
      id: this.extractId(apiVehicle),
      brand: this.extractBrand(apiVehicle, isNewFormat),
      model: this.extractModel(apiVehicle, isNewFormat),
      year: apiVehicle.year || apiVehicle.annee,
      mileage: this.formatter.formatMileage(apiVehicle.distanceTraveled || apiVehicle.kilometrage || 0),
      transmission: this.formatter.formatTransmission(
        isNewFormat ? apiVehicle.gearbox?.name : apiVehicle.boite
      ),
      fuel: this.formatter.formatFuel(
        isNewFormat ? apiVehicle.energy?.name : apiVehicle.carburant
      ),
      price: this.formatter.formatPrice(apiVehicle.pricePublic || apiVehicle.prix || 0),
      image: this.extractMainImage(apiVehicle, isNewFormat),
      images: this.extractImages(apiVehicle, isNewFormat),
      features: this.extractFeatures(apiVehicle, isNewFormat),
      status: this.formatter.mapStatus(apiVehicle.state || apiVehicle.statut),
      details: this.extractDetails(apiVehicle, isNewFormat)
    };
  }

  /**
   * Détecte si c'est le nouveau format API v3.8
   */
  private isNewAPIFormat(apiVehicle: any): boolean {
    return apiVehicle.brand && typeof apiVehicle.brand === 'object';
  }

  /**
   * Extrait l'ID du véhicule
   */
  private extractId(apiVehicle: any): string {
    return apiVehicle.uuid || apiVehicle.id || apiVehicle.reference || `kepler-${Date.now()}`;
  }

  /**
   * Extrait la marque
   */
  private extractBrand(apiVehicle: any, isNewFormat: boolean): string {
    return isNewFormat ? apiVehicle.brand.name : apiVehicle.marque;
  }

  /**
   * Extrait le modèle
   */
  private extractModel(apiVehicle: any, isNewFormat: boolean): string {
    return isNewFormat ? apiVehicle.model.name : apiVehicle.modele;
  }

  /**
   * Extrait toutes les images du véhicule
   */
  private extractImages(apiVehicle: any, isNewFormat: boolean): string[] {
    let images: string[] = [];
    const placeholder = 'assets/img/placeholder.svg';
    
    if (isNewFormat && apiVehicle.gallery) {
      // Nouveau format : gallery array avec URLs S3
      const sortedGallery = [...(apiVehicle.gallery || [])]
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      
      images = sortedGallery.map((g: any) => g.photo).filter(Boolean);
    } else if (apiVehicle.photos) {
      // Ancien format : photos array
      const photos = [...(apiVehicle.photos || [])]
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
      
      images = photos.map((p: any) => p.url).filter(Boolean);
    }

    return images.length > 0 ? images : [placeholder];
  }

  /**
   * Extrait l'image principale
   */
  private extractMainImage(apiVehicle: any, isNewFormat: boolean): string {
    const images = this.extractImages(apiVehicle, isNewFormat);
    
    // Pour l'ancien format, chercher la photo principale
    if (!isNewFormat && apiVehicle.photos) {
      const mainPhoto = apiVehicle.photos.find((p: any) => p.principal);
      if (mainPhoto?.url) return mainPhoto.url;
    }
    
    return images[0] || 'assets/img/placeholder.svg';
  }

  /**
   * Extrait les caractéristiques principales (features)
   */
  private extractFeatures(apiVehicle: any, isNewFormat: boolean): string[] {
    const features: string[] = [];
    
    if (isNewFormat) {
      if (apiVehicle.warrantyLabel?.name) {
        features.push(apiVehicle.warrantyLabel.name);
      }
      if (apiVehicle.doors) {
        features.push(`${apiVehicle.doors} portes`);
      }
      if (apiVehicle.seats) {
        features.push(`${apiVehicle.seats} places`);
      }
    } else if (apiVehicle.caracteristiques) {
      if (apiVehicle.caracteristiques.garantie) {
        features.push(apiVehicle.caracteristiques.garantie);
      }
      if (apiVehicle.caracteristiques.nbPortes) {
        features.push(`${apiVehicle.caracteristiques.nbPortes} portes`);
      }
      if (apiVehicle.caracteristiques.nbPlaces) {
        features.push(`${apiVehicle.caracteristiques.nbPlaces} places`);
      }
    }
    
    return features;
  }

  /**
   * Extrait les détails complets du véhicule
   */
  private extractDetails(apiVehicle: any, isNewFormat: boolean): VehicleDetails | undefined {
    if (isNewFormat) {
      return this.extractDetailsNewFormat(apiVehicle);
    } else if (apiVehicle.caracteristiques) {
      return this.extractDetailsOldFormat(apiVehicle);
    }
    return undefined;
  }

  /**
   * Extrait les détails pour le nouveau format API v3.8
   */
  private extractDetailsNewFormat(apiVehicle: any): VehicleDetails {
    return {
      finition: apiVehicle.version?.name,
      category: undefined,
      firstRegistration: this.formatter.formatDate(apiVehicle.dateOfDistribution),
      warranty: apiVehicle.warrantyLabel?.name,
      exteriorColor: apiVehicle.color?.name,
      interiorColor: apiVehicle.insideColor?.name,
      fiscalPower: this.formatter.formatFiscalPower(apiVehicle.taxHorsepower),
      power: this.formatter.formatRealPower(apiVehicle.horsepower),
      co2Emission: undefined,
      doors: apiVehicle.doors,
      reference: apiVehicle.reference,
      description: undefined,
      standardEquipment: apiVehicle.equipmentStandard?.map((e: any) => e.name),
      optionalEquipment: apiVehicle.equipmentOptional?.map((e: any) => e.name)
    };
  }

  /**
   * Extrait les détails pour l'ancien format API
   */
  private extractDetailsOldFormat(apiVehicle: any): VehicleDetails {
    const carac = apiVehicle.caracteristiques;
    
    return {
      finition: carac.finition,
      category: carac.categorie,
      firstRegistration: this.formatter.formatDate(carac.dateCirculation),
      warranty: carac.garantie,
      exteriorColor: carac.couleurExterieure,
      interiorColor: carac.couleurInterieure,
      fiscalPower: this.formatter.formatFiscalPower(carac.puissanceFiscale),
      power: this.formatter.formatRealPower(carac.puissanceReelle),
      co2Emission: this.formatter.formatCO2Emission(carac.emissionCO2),
      doors: carac.nbPortes,
      reference: apiVehicle.reference,
      description: carac.description,
      standardEquipment: carac.equipementsStandard,
      optionalEquipment: carac.equipementsOption
    };
  }
}

