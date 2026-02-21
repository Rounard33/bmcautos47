import type {VercelRequest, VercelResponse} from '@vercel/node';
import {Resend} from 'resend';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', 'https://www.bmcautos47.com');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    return response.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const body = request.body as Record<string, string | undefined>;
  const {
    name,
    email,
    phone,
    projectType,
    budget,
    message,
    brand,
    model,
    transmission,
    fuel,
    category,
    mileage,
    yearFrom,
    yearTo,
    repriseBrand,
    repriseModel,
    repriseYear,
    repriseMileage,
    repriseCondition,
  } = body;

  if (!name || !email || !message) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(apiKey);

  // Destinataire des messages contact (variable Vercel : ADMIN_EMAIL)
  const toEmail = process.env['ADMIN_EMAIL'];
  if (!toEmail) {
    return response.status(500).json({ error: 'ADMIN_EMAIL not configured' });
  }

  // Expéditeur visible par les clients (variable Vercel : RESEND_FROM)
  // Format : "Nom affiché <email@domaine.com>"
  const fromAddress = process.env['RESEND_FROM'] || 'BMC Autos 47 <onboarding@resend.dev>';

  const esc = (s: string | undefined) => (s ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const projectTypeLabels: Record<string, string> = {
    'info-vehicule': 'Information sur un véhicule',
    'recherche': 'Recherche personnalisée',
    'reprise': 'Demande de reprise',
    'financement': 'Financement',
    'autre': 'Autre demande',
  };
  const projectTypeLabel = projectTypeLabels[projectType ?? ''] ?? projectType ?? '-';

  let detailsHtml = `
    <p><strong>Nom :</strong> ${esc(name)}</p>
    <p><strong>Email :</strong> ${esc(email)}</p>
    <p><strong>Téléphone :</strong> ${phone ? esc(phone) : 'Non renseigné'}</p>
    <p><strong>Objet :</strong> ${esc(projectTypeLabel)}</p>
    <p><strong>Budget :</strong> ${esc(budget) || 'À définir'}</p>
  `;

  if (projectType === 'recherche') {
    detailsHtml += `
    <h3>Critères de recherche</h3>
    <p><strong>Marque :</strong> ${esc(brand)}</p>
    <p><strong>Modèle :</strong> ${esc(model)}</p>
    <p><strong>Transmission :</strong> ${esc(transmission)}</p>
    <p><strong>Énergie :</strong> ${esc(fuel)}</p>
    <p><strong>Catégorie :</strong> ${esc(category)}</p>
    <p><strong>Kilométrage max :</strong> ${esc(mileage)}</p>
    <p><strong>Année :</strong> ${esc(yearFrom)} - ${esc(yearTo)}</p>
    `;
  }

  if (projectType === 'reprise') {
    detailsHtml += `
    <h3>Informations véhicule à reprendre</h3>
    <p><strong>Marque :</strong> ${esc(repriseBrand)}</p>
    <p><strong>Modèle :</strong> ${esc(repriseModel)}</p>
    <p><strong>Année :</strong> ${esc(repriseYear)}</p>
    <p><strong>Kilométrage :</strong> ${esc(repriseMileage)}</p>
    <p><strong>État général :</strong> ${esc(repriseCondition === 'excellent' ? 'Excellent état' : repriseCondition === 'tres-bon' ? 'Très bon état' : repriseCondition === 'bon' ? 'Bon état' : repriseCondition === 'moyen' ? 'État moyen' : repriseCondition)}</p>
    `;
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [toEmail],
    replyTo: email,
    subject: `Nouveau contact - ${projectTypeLabel}`,
    html: `
      <h2>Nouveau message depuis le site</h2>
      ${detailsHtml}
      <hr>
      <h3>Message</h3>
      <p>${esc(message)}</p>
    `,
  });

  if (error) {
    const errMsg = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : 'Failed to send email';
    console.error('Resend error:', error);
    return response.status(500).json({ error: 'Failed to send email', details: errMsg });
  }

  return response.status(200).json({ success: true, id: data?.id });
}
