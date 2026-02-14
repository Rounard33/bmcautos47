/**
 * Utilitaire de formatage des dates
 */
export class DateFormatter {
  /**
   * Formate une date ISO en format français court (ex: 02/09/2020)
   */
  static toFrenchDate(isoDate: string | undefined): string | undefined {
    if (!isoDate) return undefined;
    
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return undefined;
    
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Formate une date ISO en format français long (ex: 2 septembre 2020)
   */
  static toFrenchDateLong(isoDate: string | undefined): string | undefined {
    if (!isoDate) return undefined;
    
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return undefined;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Formate une date ISO en format français avec heure (ex: 02/09/2020 14:30)
   */
  static toFrenchDateTime(isoDate: string | undefined): string | undefined {
    if (!isoDate) return undefined;
    
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return undefined;
    
    return date.toLocaleString('fr-FR');
  }
}

